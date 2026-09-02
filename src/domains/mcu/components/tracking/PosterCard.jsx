import PropTypes from "prop-types";
import { Check } from "lucide-react";
import { TYPE_META } from "../../utils/constants";
import { posterBackground } from "../../utils/posterArt";
import {
  getStatus,
  isItemComplete,
  isItemPartial,
  getItemProgressFraction,
} from "../../utils/stats";
import { MODAL_LABELS, STATUS } from "../../utils/statConstants";

export function PosterCard({
  item,
  color,
  watched,
  onToggleItem,
  onSelectItem,
}) {
  const Icon = TYPE_META[item.type].icon;
  const isTv = item.type === "tv";
  const episodeCount = isTv ? item.episodes.length : 0;
  // Count completed episodes for TV shows by checking globalId status
  const episodesDone = isTv
    ? item.episodes.filter(
        (episode) => getStatus(watched, episode.globalId) === STATUS.WATCHED,
      ).length
    : 0;

  // Use centralized status calculation functions
  const complete = isItemComplete(item, watched);
  const partial = isItemPartial(item, watched);
  const ringFraction = getItemProgressFraction(item, watched);

  const handleCardClick = () => {
    onSelectItem?.(item, color);
  };

  return (
    <div
      className="mcu-poster-card relative w-28 flex-shrink-0 rounded-[10px] border border-white/10 cursor-pointer overflow-hidden"
      style={{
        aspectRatio: "2 / 3",
        scrollSnapAlign: "start",
        backgroundImage: posterBackground(item.id, color),
        boxShadow: complete ? `0 0 0 2px ${color}, 0 6px 18px ${color}55` : ``,
      }}
      onClick={handleCardClick}
    >
      <Icon
        size={30}
        className="absolute top-3.5 left-2.5 text-white opacity-20"
      />
      {!isTv && (
        <button
          type="button"
          disabled={watched === undefined}
          className="absolute top-1.5 right-1.5 w-[22px] h-[22px] rounded-full border-[1.5px] border-white/75 bg-slate-950/40 flex items-center justify-center cursor-pointer z-[2] disabled:opacity-50 disabled:cursor-not-allowed"
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
                  background: `conic-gradient(${color} ${ringFraction * 360}deg, rgba(0,0,0,0.35) ${ringFraction * 360}deg)`,
                }
              : null),
          }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleItem?.();
          }}
          aria-label={
            complete ? MODAL_LABELS.MARK_UNWATCHED : MODAL_LABELS.MARK_WATCHED
          }
        >
          {complete && <Check size={12} color="#12141B" strokeWidth={3} />}
        </button>
      )}
      {isTv && (
        <span className="text-[8.5px] text-slate-300 absolute top-8.5 right-1.5">
          {episodesDone}/{episodeCount} {MODAL_LABELS.EPS}
        </span>
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
          <span>{item.premiereDate ?? ""}</span>
          {item.seasonNumber ? `S${item.seasonNumber}` : ""}
        </div>
      </div>
    </div>
  );
}

PosterCard.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["movie", "tv"]).isRequired,
    title: PropTypes.string.isRequired,
    episodes: PropTypes.array,
    premiereDate: PropTypes.string,
    seasonNumber: PropTypes.number,
  }).isRequired,
  color: PropTypes.string,
  watched: PropTypes.object,
  onToggleItem: PropTypes.func,
  onSelectItem: PropTypes.func,
};
