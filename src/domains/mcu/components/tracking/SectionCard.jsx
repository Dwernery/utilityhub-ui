import PropTypes from "prop-types";
import { ChevronDown, ChevronRight } from "lucide-react";
import { PosterCard } from "./PosterCard";

export function SectionCard({
  label,
  color,
  items,
  stats,
  watched,
  expanded,
  onToggleExpand,
  onToggleItem,
  onSelectItem,
}) {
  const summary = `${stats.movies} movies · ${stats.episodes} episodes · ${stats.specials} specials`;

  return (
    <section className="bg-slate-800 border border-slate-700 rounded-xl mb-2">
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
            <div className=""></div>
          </div>
        </div>
        <div className="text-xs text-slate-400">{summary}</div>
      </button>

      {expanded && (
        <div className="border-t border-slate-700 px-2.5 pt-2.5 pb-3">
          {/* Horizontal scroll row for poster cards with custom scrollbar styling */}
          <div className="mcu-scroll-row flex overflow-x-auto gap-2.5 -mx-1.5 px-1.5 py-1.5">
            {items.map((item) => (
              <PosterCard
                key={item.id}
                item={item}
                color={color}
                watched={watched}
                onToggleItem={() => onToggleItem(item)}
                onSelectItem={onSelectItem}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

SectionCard.propTypes = {
  label: PropTypes.string.isRequired,
  color: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    }),
  ).isRequired,
  stats: PropTypes.shape({
    moviesDone: PropTypes.number,
    movies: PropTypes.number,
    episodesDone: PropTypes.number,
    episodes: PropTypes.number,
    specialsDone: PropTypes.number,
    specials: PropTypes.number,
  }),
  watched: PropTypes.object,
  expanded: PropTypes.bool,
  onToggleExpand: PropTypes.func,
  onToggleItem: PropTypes.func,
  onSelectItem: PropTypes.func,
};
