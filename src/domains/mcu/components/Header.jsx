import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Film, Home, Sparkles, Tv } from "lucide-react";
import { EXPANDED, PHASES } from "../data";
import { useMcuTracker } from "../context/McuTrackerContext";
import { combineStats, computeStats, percentage } from "../utils/stats";

const VIEWS = [
  { key: "phases", label: "MCU Phases" },
  { key: "expanded", label: "Expanded Universe" },
];

const BREAKDOWN = [
  { key: "movies", doneKey: "moviesDone", label: "Movies", icon: Film },
  {
    key: "specials",
    doneKey: "specialsDone",
    label: "Specials",
    icon: Sparkles,
  },
  { key: "episodes", doneKey: "episodesDone", label: "Episodes", icon: Tv },
];

const SECTIONS_BY_VIEW = {
  phases: PHASES.map((p) => p.items),
  expanded: EXPANDED.map((c) => c.items),
};

export function Header() {
  const { view, setView, watched } = useMcuTracker();

  const stats = useMemo(
    () =>
      combineStats(
        SECTIONS_BY_VIEW[view].map((items) => computeStats(items, watched)),
      ),
    [view, watched],
  );
  const pct = percentage(stats.done, stats.total);

  return (
    <div className="max-w-7xl mx-auto border-b border-slate-700 pt-5 pb-4 mb-2">
      <div className="mx-auto">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors w-fit mb-3"
        >
          <Home className="w-3 h-3" />
          Home
        </Link>
        <div className="mb-3.5">
          <div className="text-[11px] tracking-[0.2em] text-slate-400 font-bold mb-1">
            MARVEL CINEMATIC UNIVERSE
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight m-0">
            MCU Watch Tracker
          </h1>
        </div>

        <div className="flex gap-2 mb-3.5">
          {VIEWS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={`flex-1 border text-xs font-bold py-2.5 px-2.5 rounded-lg cursor-pointer tracking-wide transition-colors ${
                view === key
                  ? "bg-slate-700 text-slate-50 border-blue-400 shadow-[0_0_0_1px_rgba(91,132,245,0.25),0_2px_10px_rgba(91,132,245,0.25)]"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2 mt-3.5">
          {BREAKDOWN.map(({ key, doneKey, label, icon: Icon }) => {
            const total = stats[key];
            const done = stats[doneKey];
            return (
              <div
                key={key}
                className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
              >
                <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[11px] text-slate-400 truncate">
                    {label}
                  </div>
                  <div className="text-sm font-bold text-slate-50">
                    {total > 0 ? `${done}/${total}` : "—"}
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex flex-col justify-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
            <div className="flex items-center justify-between">
              <div className="text-[11px] text-slate-400 truncate">Overall</div>
              <div className="text-sm font-bold text-slate-50">{pct}%</div>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-400 shadow-[0_0_10px_rgba(139,124,246,0.35)] transition-[width] duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
