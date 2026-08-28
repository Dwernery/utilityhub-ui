import { ChevronDown, ChevronRight } from "lucide-react";
import { PosterCard } from "./PosterCard";
import { gradientBar } from "../../utils/posterArt";
import { percentage } from "../../utils/stats";

export function SectionCard({
  label,
  color,
  items,
  stats,
  watched,
  expanded,
  onToggleExpand,
  onOpenEpisodes,
  onToggleItem,
}) {
  const pct = percentage(stats.done, stats.total);
  const summary = `${stats.moviesDone}/${stats.movies} movies · ${stats.episodesDone}/${stats.episodes} episodes · ${stats.specialsDone}/${stats.specials} specials`;

  return (
    <section
      className="bg-slate-800 border border-slate-700 rounded-xl mb-2 border-l-4 border-r-4"
      style={{
        borderLeftColor: color,
        borderRightColor: color,
        boxShadow: `0 3px 16px ${color}26, 0 2px 10px rgba(0,0,0,0.25)`,
      }}
    >
      <button
        type="button"
        className="w-full flex justify-between items-center py-2.5 px-3.5 bg-transparent border-none cursor-pointer text-left"
        onClick={onToggleExpand}
      >
        <div className="flex items-center gap-2.5">
          {expanded ? (
            <ChevronDown size={18} color={color} />
          ) : (
            <ChevronRight size={18} color={color} />
          )}
          <div>
            <div
              className="text-[11px] font-extrabold tracking-wide mb-0.5"
              style={{ color }}
            >
              {label}
            </div>
            <div className="text-xs text-slate-400">{summary}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{ width: `${pct}%`, background: gradientBar(color) }}
            />
          </div>
          <span
            className="font-extrabold min-w-[2.5rem] text-right"
            style={{ color }}
          >
            {pct}%
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-700 px-2.5 pt-2.5 pb-3">
          <div className="mcu-scroll-row flex overflow-x-auto gap-2.5 -mx-1.5 px-1.5 py-1.5">
            {items.map((item) => (
              <PosterCard
                key={item.id}
                item={item}
                color={color}
                watched={watched}
                onOpenEpisodes={() => onOpenEpisodes(item)}
                onToggleItem={() => onToggleItem(item)}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
