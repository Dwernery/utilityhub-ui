import { Check } from "lucide-react";
import { TYPE_META } from "../../constants";
import { posterBackground } from "../../utils/posterArt";

export function PosterCard({
  item,
  color,
  watched,
  onOpenEpisodes,
  onToggleItem,
}) {
  const Icon = TYPE_META[item.type].icon;
  const isTv = item.type === "tv";
  const episodeCount = isTv ? item.episodes.length : 0;
  const episodesDone = isTv
    ? item.episodes.filter((_, i) => watched[`${item.id}::e${i}`]).length
    : 0;
  const complete = isTv
    ? episodeCount > 0 && episodesDone === episodeCount
    : !!watched[item.id];
  const partial = isTv && episodesDone > 0 && !complete;

  return (
    <div
      className="mcu-poster-card relative w-24 flex-shrink-0 rounded-[10px] border border-white/10 cursor-pointer overflow-hidden"
      style={{
        aspectRatio: "2 / 3",
        scrollSnapAlign: "start",
        backgroundImage: posterBackground(item.id, color),
        opacity: item.unreleased ? 0.65 : 1,
        boxShadow: complete
          ? `0 0 0 2px ${color}, 0 6px 18px ${color}55`
          : `0 4px 14px ${color}30, 0 2px 6px rgba(0,0,0,0.4)`,
      }}
      onClick={isTv ? onOpenEpisodes : onToggleItem}
    >
      <Icon
        size={30}
        className="absolute top-3.5 left-2.5 text-white opacity-20"
      />

      <button
        type="button"
        className="absolute top-1.5 right-1.5 w-[22px] h-[22px] rounded-full border-[1.5px] border-white/75 bg-slate-950/40 flex items-center justify-center cursor-pointer z-[2]"
        style={{
          ...(complete
            ? {
                background: color,
                borderColor: color,
                boxShadow: `0 0 10px ${color}`,
              }
            : null),
          ...(partial
            ? {
                borderColor: color,
                background: `conic-gradient(${color} ${(episodesDone / episodeCount) * 360}deg, rgba(0,0,0,0.35) ${(episodesDone / episodeCount) * 360}deg)`,
              }
            : null),
        }}
        onClick={(e) => {
          e.stopPropagation();
          onToggleItem();
        }}
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
        className="absolute left-0 right-0 bottom-0 px-1.5 pb-1.5 pt-3.5"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, rgba(8,9,13,0.55) 35%, rgba(8,9,13,0.95) 100%)",
        }}
      >
        <div
          className={`text-[10.5px] font-bold leading-tight line-clamp-2 ${complete ? "text-slate-300" : "text-white"}`}
        >
          {item.title}
        </div>
        <div className="flex justify-between text-[8.5px] text-slate-300 mt-0.5">
          <span>{item.year ?? ""}</span>
          {isTv && (
            <span>
              {episodesDone}/{episodeCount} eps
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
