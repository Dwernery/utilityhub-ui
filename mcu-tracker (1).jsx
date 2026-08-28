import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Check, ChevronDown, ChevronRight, Trash2, Plus, X, Film,
  Tv, Sparkles, RotateCcw, Layers, Play, PartyPopper,
} from "lucide-react";

const genEp = (n) => Array.from({ length: n }, (_, i) => `Episode ${i + 1}`);

const SAGAS = [
  { id: "infinity", title: "The Infinity Saga", years: "2008–2019", color: "#4C8DFF", phaseNums: [1, 2, 3] },
  { id: "multiverse", title: "The Multiverse Saga", years: "2021–", color: "#8B7CF6", phaseNums: [4, 5, 6] },
];


const STORAGE_KEY = "mcu-tracker-state-v2";
const TYPE_META = {
  movie: { icon: Film, label: "Movie" },
  tv: { icon: Tv, label: "Series" },
  special: { icon: Sparkles, label: "Special" },
};

function unitCount(item) {
  return item.type === "tv" ? item.episodes.length : 1;
}

function computeStats(items, watched) {
  let total = 0, done = 0, movies = 0, moviesDone = 0, eps = 0, epsDone = 0, specials = 0, specialsDone = 0;
  for (const item of items) {
    const u = unitCount(item);
    total += u;
    if (item.type === "movie") {
      movies++;
      if (watched[item.id]) { moviesDone++; done++; }
    } else if (item.type === "special") {
      specials++;
      if (watched[item.id]) { specialsDone++; done++; }
    } else if (item.type === "tv") {
      eps += u;
      for (let i = 0; i < u; i++) if (watched[`${item.id}::e${i}`]) { epsDone++; done++; }
    }
  }
  return { total, done, movies, moviesDone, eps, epsDone, specials, specialsDone };
}

/* ---------------- Color + generative poster art helpers ----------------
   These stay as plain JS/inline style because they compute per-item,
   runtime-only values (unique gradients, colored glows) that can't be
   expressed as static Tailwind utility classes without a JIT compiler.
------------------------------------------------------------------*/
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function seeded(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}
function hexToRgb(hex) {
  const m = hex.replace("#", "");
  return [parseInt(m.slice(0, 2), 16), parseInt(m.slice(2, 4), 16), parseInt(m.slice(4, 6), 16)];
}
function shade(hex, pct) {
  const [r, g, b] = hexToRgb(hex);
  const adj = (c) => Math.max(0, Math.min(255, Math.round(c + (pct / 100) * 255)));
  return `rgb(${adj(r)}, ${adj(g)}, ${adj(b)})`;
}
function posterBackground(id, color) {
  const h = hashStr(id);
  const x1 = 10 + seeded(h) * 70, y1 = 5 + seeded(h + 1) * 35;
  const x2 = 10 + seeded(h + 2) * 75, y2 = 35 + seeded(h + 3) * 40;
  const x3 = 15 + seeded(h + 4) * 65, y3 = 55 + seeded(h + 5) * 35;
  return [
    `radial-gradient(circle at ${x1}% ${y1}%, ${shade(color, 38)}FA 0%, transparent 50%)`,
    `radial-gradient(circle at ${x2}% ${y2}%, ${color}F0 0%, transparent 55%)`,
    `radial-gradient(circle at ${x3}% ${y3}%, ${shade(color, -8)}E0 0%, transparent 62%)`,
    `linear-gradient(150deg, #262b3a 0%, #171a22 100%)`,
  ].join(",");
}
function gradientBar(color) {
  return `linear-gradient(90deg, ${shade(color, -18)}, ${shade(color, 22)})`;
}

function findNextUp(itemsBySection, watched) {
  for (const phase of PHASES) {
    const items = itemsBySection[`phase-${phase.num}`] || [];
    for (const item of items) {
      if (item.unreleased) continue;
      if (item.type === "tv") {
        const idx = item.episodes.findIndex((_, i) => !watched[`${item.id}::e${i}`]);
        if (idx !== -1) return { item, phase, epIndex: idx };
      } else if (!watched[item.id]) {
        return { item, phase, epIndex: null };
      }
    }
  }
  return null;
}

const ALL_SECTION_KEYS_DEFAULT = Object.fromEntries([
  ...PHASES.map((p) => [`phase-${p.num}`, true]),
  ...EXPANDED.map((c) => [c.id, true]),
]);

export default function MCUTracker() {
  const [loaded, setLoaded] = useState(false);
  const [watched, setWatched] = useState({});
  const [customItems, setCustomItems] = useState({});
  const [hidden, setHidden] = useState({});
  const [expanded, setExpanded] = useState(ALL_SECTION_KEYS_DEFAULT);
  const [activeShow, setActiveShow] = useState(null); // { item, color } | null
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [saveState, setSaveState] = useState("idle");
  const [view, setView] = useState("phases");

  useEffect(() => {
    document.body.style.overflow = (activeShow || addModalOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [activeShow, addModalOpen]);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get(STORAGE_KEY, false);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          setWatched(parsed.watched || {});
          setCustomItems(parsed.customItems || {});
          setHidden(parsed.hidden || {});
        }
      } catch (e) { /* fresh start */ }
      finally { setLoaded(true); }
    })();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    setSaveState("saving");
    const t = setTimeout(async () => {
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify({ watched, customItems, hidden }), false);
        setSaveState("saved");
      } catch (e) { setSaveState("idle"); }
    }, 500);
    return () => clearTimeout(t);
  }, [watched, customItems, hidden, loaded]);

  const SECTIONS = useMemo(() => ({
    ...Object.fromEntries(PHASES.map((p) => [`phase-${p.num}`, p])),
    ...Object.fromEntries(EXPANDED.map((c) => [c.id, c])),
  }), []);

  const itemsBySection = useMemo(() => {
    const map = {};
    for (const key of Object.keys(SECTIONS)) {
      const base = SECTIONS[key].items.filter((it) => !hidden[it.id]);
      const custom = (customItems[key] || []).filter((it) => !hidden[it.id]);
      map[key] = [...base, ...custom];
    }
    return map;
  }, [SECTIONS, customItems, hidden]);

  const toggleItem = useCallback((item) => {
    if (item.type === "tv") {
      setWatched((prev) => {
        const next = { ...prev };
        const n = item.episodes.length;
        const allWatched = Array.from({ length: n }).every((_, i) => prev[`${item.id}::e${i}`]);
        for (let i = 0; i < n; i++) {
          if (allWatched) delete next[`${item.id}::e${i}`];
          else next[`${item.id}::e${i}`] = true;
        }
        return next;
      });
    } else {
      setWatched((prev) => {
        const next = { ...prev };
        if (next[item.id]) delete next[item.id]; else next[item.id] = true;
        return next;
      });
    }
  }, []);

  const toggleEpisode = useCallback((itemId, epIndex) => {
    const key = `${itemId}::e${epIndex}`;
    setWatched((prev) => {
      const next = { ...prev };
      if (next[key]) delete next[key]; else next[key] = true;
      return next;
    });
  }, []);

  const deleteItem = useCallback((sectionKey, item) => {
    if (customItems[sectionKey]?.some((c) => c.id === item.id)) {
      setCustomItems((prev) => ({ ...prev, [sectionKey]: prev[sectionKey].filter((c) => c.id !== item.id) }));
    } else {
      setHidden((prev) => ({ ...prev, [item.id]: true }));
    }
    setWatched((prev) => {
      const next = { ...prev };
      delete next[item.id];
      if (item.type === "tv") for (let i = 0; i < (item.episodes?.length || 0); i++) delete next[`${item.id}::e${i}`];
      return next;
    });
  }, [customItems]);

  const addCustomItem = useCallback((sectionKey, item) => {
    const id = `custom-${sectionKey}-${Date.now()}`;
    setCustomItems((prev) => ({ ...prev, [sectionKey]: [...(prev[sectionKey] || []), { ...item, id }] }));
  }, []);

  const resetAll = useCallback(() => {
    if (confirm("Clear all progress and custom entries?")) {
      setWatched({}); setCustomItems({}); setHidden({});
    }
  }, []);

  const phaseKeys = PHASES.map((p) => `phase-${p.num}`);

  const mcuOverall = useMemo(() => {
    let total = 0, done = 0;
    phaseKeys.forEach((k) => {
      const s = computeStats(itemsBySection[k] || [], watched);
      total += s.total; done += s.done;
    });
    return { total, done };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsBySection, watched]);

  const nextUp = useMemo(() => findNextUp(itemsBySection, watched), [itemsBySection, watched]);

  if (!loaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-slate-400 font-sans tracking-widest text-sm">LOADING…</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen text-slate-50 font-sans pb-12"
      style={{ background: "radial-gradient(ellipse 900px 500px at 50% -10%, #2A3040 0%, #12141B 60%)" }}
    >
      <style>{css}</style>
      <div className="h-1 bg-gradient-to-r from-blue-400 to-violet-400" />
      <Header overall={mcuOverall} saveState={saveState} onReset={resetAll} view={view} setView={setView} />
      <div className="max-w-4xl mx-auto px-4">
        {view === "phases" ? (
          <>
            <NextUpHero nextUp={nextUp} onToggleItem={toggleItem} onToggleEpisode={toggleEpisode} />
            {SAGAS.map((saga) => {
              let sagaTotal = 0, sagaDone = 0;
              saga.phaseNums.forEach((n) => {
                const s = computeStats(itemsBySection[`phase-${n}`] || [], watched);
                sagaTotal += s.total; sagaDone += s.done;
              });
              const sagaPct = sagaTotal ? Math.round((sagaDone / sagaTotal) * 100) : 0;
              return (
                <div key={saga.id} className="mb-5">
                  <div className="flex justify-between items-center border-b-4 pb-3 mb-3.5" style={{ borderColor: saga.color }}>
                    <div>
                      <div
                        className="text-lg font-extrabold tracking-tight"
                        style={{ color: saga.color, textShadow: `0 0 24px ${saga.color}66` }}
                      >
                        {saga.title}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{saga.years} · Phases {saga.phaseNums.join("–")}</div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${sagaPct}%`, background: gradientBar(saga.color) }} />
                      </div>
                      <div className="text-lg font-extrabold min-w-[2.5rem] text-right" style={{ color: saga.color }}>{sagaPct}%</div>
                    </div>
                  </div>
                  {saga.phaseNums.map((num) => {
                    const phase = PHASES.find((p) => p.num === num);
                    const key = `phase-${num}`;
                    return (
                      <Section
                        key={key}
                        sectionKey={key}
                        label={`PHASE ${num}`}
                        color={phase.color}
                        items={itemsBySection[key]}
                        stats={computeStats(itemsBySection[key], watched)}
                        watched={watched}
                        expanded={!!expanded[key]}
                        onToggleExpand={() => setExpanded((prev) => ({ ...prev, [key]: !prev[key] }))}
                        onOpenEpisodes={(item) => setActiveShow({ item, color: phase.color })}
                        onToggleItem={toggleItem}
                        onToggleEpisode={toggleEpisode}
                        onDeleteItem={(item) => deleteItem(key, item)}
                      />
                    );
                  })}
                </div>
              );
            })}
          </>
        ) : (
          <>
            <p className="text-xs text-slate-400 leading-relaxed mb-3.5">
              These sagas aren't official MCU Phases, but plenty of fans track them alongside it. Progress here is kept separate from your MCU totals above.
            </p>
            {EXPANDED.map((cat) => (
              <Section
                key={cat.id}
                sectionKey={cat.id}
                label={cat.title.toUpperCase()}
                sublabel={cat.blurb}
                color={cat.color}
                items={itemsBySection[cat.id]}
                stats={computeStats(itemsBySection[cat.id], watched)}
                watched={watched}
                expanded={!!expanded[cat.id]}
                onToggleExpand={() => setExpanded((prev) => ({ ...prev, [cat.id]: !prev[cat.id] }))}
                onOpenEpisodes={(item) => setActiveShow({ item, color: cat.color })}
                onToggleItem={toggleItem}
                onToggleEpisode={toggleEpisode}
                onDeleteItem={(item) => deleteItem(cat.id, item)}
              />
            ))}
          </>
        )}
      </div>

      <button
        className="fixed right-5 bottom-6 w-14 h-14 rounded-full border-none cursor-pointer flex items-center justify-center z-40"
        style={{ background: "linear-gradient(135deg, #7FB1FF, #8B7CF6)", boxShadow: "0 6px 20px rgba(139,124,246,0.45), 0 2px 8px rgba(0,0,0,0.4)" }}
        onClick={() => setAddModalOpen(true)}
        aria-label="Add a title"
      >
        <Plus size={22} className="text-slate-950" strokeWidth={2.5} />
      </button>

      <footer className="max-w-4xl mx-auto px-4 mt-3 text-xs text-slate-500 text-center leading-relaxed">
        Every checkbox saves automatically. Some newer or shorts-format episodes use generic numbering until titles are confirmed — add or fix any entry with the +/trash icons.
      </footer>

      {addModalOpen && (
        <AddItemModal
          onClose={() => setAddModalOpen(false)}
          onAdd={(sectionKey, item) => {
            addCustomItem(sectionKey, item);
            setExpanded((prev) => ({ ...prev, [sectionKey]: true }));
            setAddModalOpen(false);
          }}
        />
      )}
      {activeShow && (
        <EpisodeSheet
          item={activeShow.item}
          color={activeShow.color}
          watched={watched}
          onToggleEpisode={(i) => toggleEpisode(activeShow.item.id, i)}
          onToggleAll={() => toggleItem(activeShow.item)}
          onClose={() => setActiveShow(null)}
        />
      )}
    </div>
  );
}

function NextUpHero({ nextUp, onToggleItem, onToggleEpisode }) {
  if (!nextUp) {
    return (
      <div className="rounded-2xl mb-5 shadow-lg overflow-hidden">
        <div className="flex items-center gap-3 p-4 bg-slate-800 border border-slate-700 rounded-2xl">
          <PartyPopper size={22} className="text-emerald-500" />
          <div>
            <div className="text-[15px] font-extrabold">You're fully caught up!</div>
            <div className="text-xs text-slate-300 mt-0.5">Every released title is checked off. New Phase 6 entries will show up here.</div>
          </div>
        </div>
      </div>
    );
  }
  const { item, phase, epIndex } = nextUp;
  const Icon = TYPE_META[item.type].icon;
  const subtitle = epIndex !== null ? item.episodes[epIndex] : TYPE_META[item.type].label;
  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-5 border border-white/10 shadow-xl"
      style={{ backgroundImage: posterBackground(item.id + "-hero", phase.color) }}
    >
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(90deg, rgba(10,11,15,0.35) 0%, rgba(10,11,15,0.82) 60%, rgba(10,11,15,0.94) 100%)" }}
      />
      <div className="relative flex items-center gap-3.5 p-4">
        <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center flex-shrink-0">
          <Icon size={22} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10.5px] font-extrabold tracking-[0.12em] mb-0.5 text-amber-400">NEXT UP · PHASE {phase.num}</div>
          <div className="text-lg font-extrabold text-white overflow-hidden text-ellipsis whitespace-nowrap">{item.title}</div>
          <div className="text-sm text-slate-200 mt-0.5 overflow-hidden text-ellipsis whitespace-nowrap">
            {subtitle}{epIndex !== null ? ` (Ep ${epIndex + 1})` : ""}
          </div>
        </div>
        <button
          className="flex items-center gap-1.5 border-none rounded-lg text-slate-950 font-extrabold text-xs px-4 py-2.5 cursor-pointer flex-shrink-0 bg-amber-400 shadow-[0_3px_12px_rgba(242,201,76,0.35)]"
          onClick={() => (epIndex !== null ? onToggleEpisode(item.id, epIndex) : onToggleItem(item))}
        >
          <Play size={13} fill="#12141B" /> Mark watched
        </button>
      </div>
    </div>
  );
}

/* ---------------- Poster grid section ---------------- */

function Section({
  sectionKey, label, sublabel, color, items, stats, watched, expanded, onToggleExpand,
  onOpenEpisodes, onToggleItem, onToggleEpisode, onDeleteItem,
}) {
  const pct = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
  return (
    <section
      className="bg-slate-800 border border-slate-700 rounded-xl mb-2 border-l-4"
      style={{ borderLeftColor: color, boxShadow: `0 3px 16px ${color}26, 0 2px 10px rgba(0,0,0,0.25)` }}
    >
      <button className="w-full flex justify-between items-center py-2.5 px-3.5 bg-transparent border-none cursor-pointer text-left" onClick={onToggleExpand}>
        <div className="flex items-center gap-2.5">
          {expanded ? <ChevronDown size={18} color={color} /> : <ChevronRight size={18} color={color} />}
          <div>
            <div className="text-[11px] font-extrabold tracking-wide mb-0.5" style={{ color }}>{label}</div>
            {sublabel ? (
              <div className="text-xs text-slate-400">{sublabel}</div>
            ) : (
              <div className="text-xs text-slate-400">
                {stats.moviesDone}/{stats.movies} movies · {stats.epsDone}/{stats.eps} episodes · {stats.specialsDone}/{stats.specials} specials
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: gradientBar(color) }} />
          </div>
          <span className="font-extrabold min-w-[2.5rem] text-right" style={{ color }}>{pct}%</span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-700 px-2.5 pt-2.5 pb-3">
          {sublabel && (
            <div className="text-xs text-slate-500 px-0.5 pb-3">
              {stats.moviesDone}/{stats.movies} movies · {stats.epsDone}/{stats.eps} episodes · {stats.specialsDone}/{stats.specials} specials
            </div>
          )}
          <div
            className="phase-scroll flex overflow-x-auto gap-2.5"
            style={{ padding: "10px 6px 12px 6px", margin: "-10px -6px -12px -6px", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
          >
            {items.map((item) => (
              <PosterCard
                key={item.id}
                item={item}
                color={color}
                watched={watched}
                onOpenEpisodes={() => onOpenEpisodes(item)}
                onToggleItem={() => onToggleItem(item)}
                onDelete={() => onDeleteItem(item)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function PosterCard({ item, color, watched, onOpenEpisodes, onToggleItem, onDelete }) {
  const Icon = TYPE_META[item.type].icon;
  const isTv = item.type === "tv";
  const epCount = isTv ? item.episodes.length : 0;
  const doneCount = isTv ? Array.from({ length: epCount }).filter((_, i) => watched[`${item.id}::e${i}`]).length : 0;
  const complete = isTv ? doneCount === epCount && epCount > 0 : !!watched[item.id];
  const partial = isTv && doneCount > 0 && !complete;

  return (
    <div
      className="poster-card relative w-24 flex-shrink-0 rounded-[10px] border border-white/10 cursor-pointer overflow-hidden"
      style={{
        aspectRatio: "2 / 3",
        scrollSnapAlign: "start",
        backgroundImage: posterBackground(item.id, color),
        opacity: item.unreleased ? 0.65 : 1,
        boxShadow: complete ? `0 0 0 2px ${color}, 0 6px 18px ${color}55` : `0 4px 14px ${color}30, 0 2px 6px rgba(0,0,0,0.4)`,
      }}
      onClick={isTv ? onOpenEpisodes : onToggleItem}
    >
      <Icon size={30} className="absolute top-3.5 left-2.5 text-white opacity-20" />

      <button
        className="absolute top-1.5 left-1.5 w-5 h-5 rounded-md bg-slate-950/55 border-none text-slate-200 flex items-center justify-center cursor-pointer z-[2]"
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        aria-label="Remove"
      >
        <Trash2 size={12} />
      </button>

      <button
        className="absolute top-1.5 right-1.5 w-[22px] h-[22px] rounded-full border-[1.5px] border-white/75 bg-slate-950/40 flex items-center justify-center cursor-pointer z-[2]"
        style={{
          ...(complete ? { background: color, borderColor: color, boxShadow: `0 0 10px ${color}` } : {}),
          ...(partial ? { borderColor: color, background: `conic-gradient(${color} ${(doneCount / epCount) * 360}deg, rgba(0,0,0,0.35) ${(doneCount / epCount) * 360}deg)` } : {}),
        }}
        onClick={(e) => { e.stopPropagation(); onToggleItem(); }}
        aria-label={complete ? "Mark unwatched" : "Mark watched"}
      >
        {complete && <Check size={12} color="#12141B" strokeWidth={3} />}
      </button>

      {item.unreleased && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 text-[9px] font-bold tracking-wide text-amber-400 bg-slate-950/75 border border-amber-400/30 rounded px-1.5 py-0.5 whitespace-nowrap">
          Unreleased
        </div>
      )}

      <div
        className="absolute left-0 right-0 bottom-0 px-1.5 pb-1.5"
        style={{ paddingTop: 14, background: "linear-gradient(180deg, transparent 0%, rgba(8,9,13,0.55) 35%, rgba(8,9,13,0.95) 100%)" }}
      >
        <div className={`text-[10.5px] font-bold leading-tight line-clamp-2 ${complete ? "text-slate-300" : "text-white"}`}>{item.title}</div>
        <div className="flex justify-between text-[8.5px] text-slate-300 mt-0.5">
          <span>{item.year || ""}</span>
          {isTv && <span>{doneCount}/{epCount} eps</span>}
        </div>
      </div>
    </div>
  );
}

function EpisodeSheet({ item, color, watched, onToggleEpisode, onToggleAll, onClose }) {
  const epCount = item.episodes.length;
  const doneCount = Array.from({ length: epCount }).filter((_, i) => watched[`${item.id}::e${i}`]).length;
  const allDone = doneCount === epCount;

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-end justify-center" onClick={onClose}>
      <div className="w-full max-w-lg" style={{ animation: "sheet-up 0.22s ease-out" }} onClick={(e) => e.stopPropagation()}>
        <div
          className="bg-slate-800 rounded-t-2xl border border-slate-700 border-b-0 pt-2.5 px-4.5 pb-5.5 flex flex-col overflow-hidden"
          style={{ maxHeight: "85vh", boxShadow: `0 -8px 32px ${color}30, 0 -4px 24px rgba(0,0,0,0.5)` }}
        >
          <div className="w-9 h-1 rounded-full bg-slate-600 mx-auto mb-3.5 flex-shrink-0" />
          <div className="flex items-center gap-3 mb-3.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + "26", color }}>
              <Tv size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-extrabold text-slate-50 overflow-hidden text-ellipsis whitespace-nowrap">{item.title}</div>
              <div className="text-xs font-bold mt-0.5" style={{ color }}>{doneCount}/{epCount} episodes watched</div>
            </div>
            <button
              className="bg-slate-950 border border-slate-600 rounded-lg text-slate-300 w-[30px] h-[30px] flex items-center justify-center cursor-pointer flex-shrink-0"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <button
            className="border-[1.5px] bg-transparent rounded-lg font-bold text-xs py-2.5 px-3 cursor-pointer mb-2 flex items-center justify-center gap-1.5"
            style={allDone ? { background: color, color: "#12141B", borderColor: color } : { color, borderColor: color + "66" }}
            onClick={onToggleAll}
          >
            {allDone ? <><Check size={14} strokeWidth={3} /> All episodes watched</> : "Mark all episodes watched"}
          </button>

          <div className="flex flex-col overflow-y-auto pt-1 flex-1 min-h-0">
            {item.episodes.map((title, i) => {
              const w = !!watched[`${item.id}::e${i}`];
              return (
                <button key={i} className="sheet-ep-row flex items-center gap-2.5 bg-transparent border-none cursor-pointer py-2.5 px-1.5 text-left rounded-lg" onClick={() => onToggleEpisode(i)}>
                  <span
                    className="w-[17px] h-[17px] rounded border-[1.5px] border-slate-600 flex-shrink-0 flex items-center justify-center"
                    style={w ? { background: color, borderColor: color } : {}}
                  >
                    {w && <Check size={11} color="#12141B" strokeWidth={3} />}
                  </span>
                  <span className="text-xs text-slate-500 flex-shrink-0 min-w-[18px]">{i + 1}.</span>
                  <span className={`text-sm overflow-hidden text-ellipsis whitespace-nowrap ${w ? "text-slate-300" : "text-slate-200"}`}>{title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Add item form ---------------- */

function AddItemModal({ onClose, onAdd }) {
  const sectionOptions = [
    ...PHASES.map((p) => ({ key: `phase-${p.num}`, label: `Phase ${p.num}`, color: p.color })),
    ...EXPANDED.map((c) => ({ key: c.id, label: c.title, color: c.color })),
  ];
  const [sectionKey, setSectionKey] = useState(sectionOptions[0].key);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("movie");
  const [episodeCount, setEpisodeCount] = useState(6);
  const section = sectionOptions.find((s) => s.key === sectionKey);

  function submit(e) {
    e.preventDefault();
    if (!title.trim()) return;
    const item = { title: title.trim(), type, year: null };
    if (type === "tv") item.episodes = genEp(Math.max(1, Number(episodeCount) || 1));
    onAdd(sectionKey, item);
  }

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-center justify-center p-5" onClick={onClose}>
      <div className="w-full max-w-md" style={{ animation: "modal-pop 0.16s ease-out" }} onClick={(e) => e.stopPropagation()}>
        <div
          className="bg-slate-800 rounded-2xl border border-slate-700 pt-5 px-5 pb-5.5 flex flex-col overflow-hidden"
          style={{ maxHeight: "85vh", boxShadow: `0 12px 40px ${section.color}30, 0 4px 24px rgba(0,0,0,0.5)` }}
        >
          <div className="flex items-center gap-3 mb-3.5 flex-shrink-0">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: section.color + "26", color: section.color }}>
              <Plus size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-extrabold text-slate-50">Add a title</div>
              <div className="text-xs font-bold mt-0.5" style={{ color: section.color }}>Goes into your tracker right away</div>
            </div>
            <button
              className="bg-slate-950 border border-slate-600 rounded-lg text-slate-300 w-[30px] h-[30px] flex items-center justify-center cursor-pointer flex-shrink-0"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={submit} className="flex flex-col flex-1 min-h-0">
            <div className="flex flex-col gap-1.5 overflow-y-auto flex-1 min-h-0 pb-1">
              <label className="text-[11px] font-bold text-slate-400 tracking-wide mt-2">Section</label>
              <select
                className="bg-slate-950 border border-slate-600 rounded-lg text-slate-50 py-2.5 px-3 text-base"
                value={sectionKey}
                onChange={(e) => setSectionKey(e.target.value)}
              >
                {sectionOptions.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>

              <label className="text-[11px] font-bold text-slate-400 tracking-wide mt-2">Title</label>
              <input
                autoFocus
                className="bg-slate-950 border border-slate-600 rounded-lg text-slate-50 py-2.5 px-3 text-base"
                placeholder="e.g. Blade"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <label className="text-[11px] font-bold text-slate-400 tracking-wide mt-2">Type</label>
              <div className="flex gap-2">
                {[["movie", "Movie"], ["tv", "Series"], ["special", "Special"]].map(([val, lbl]) => (
                  <button
                    type="button"
                    key={val}
                    className="flex-1 bg-slate-950 border-[1.5px] border-slate-600 rounded-lg text-slate-300 font-bold text-sm py-2.5 cursor-pointer"
                    style={type === val ? { background: section.color, borderColor: section.color, color: "#12141B" } : {}}
                    onClick={() => setType(val)}
                  >
                    {lbl}
                  </button>
                ))}
              </div>

              {type === "tv" && (
                <>
                  <label className="text-[11px] font-bold text-slate-400 tracking-wide mt-2">Episode count</label>
                  <input
                    type="number"
                    min={1}
                    className="bg-slate-950 border border-slate-600 rounded-lg text-slate-50 py-2.5 px-3 text-base"
                    value={episodeCount}
                    onChange={(e) => setEpisodeCount(e.target.value)}
                  />
                </>
              )}
            </div>

            <button
              type="submit"
              className="border-none rounded-lg text-slate-950 font-extrabold text-sm py-3.5 px-3 cursor-pointer mt-3.5 flex-shrink-0"
              style={{ background: section.color }}
            >
              Add to {section.label}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const css = `
  * { box-sizing: border-box; }
  button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid #8890A3; outline-offset: 2px; }
  .poster-card { transition: transform 0.12s ease, box-shadow 0.12s ease; }
  .poster-card:active { transform: scale(0.96); }
  @media (hover: hover) { .poster-card:hover { filter: brightness(1.15); transform: translateY(-2px); } }
  @media (hover: hover) { .sheet-ep-row:hover { background: rgba(255,255,255,0.05); } }
  @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
  @keyframes sheet-up { from { transform: translateY(24px); opacity: 0.4; } to { transform: translateY(0); opacity: 1; } }
  @keyframes modal-pop { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
  .phase-scroll::-webkit-scrollbar { height: 6px; }
  .phase-scroll::-webkit-scrollbar-track { background: transparent; }
  .phase-scroll::-webkit-scrollbar-thumb { background: #363B4C; border-radius: 999px; }
  .phase-scroll::-webkit-scrollbar-thumb:hover { background: #4A5066; }
  .phase-scroll { scrollbar-width: thin; scrollbar-color: #363B4C transparent; }
`;
