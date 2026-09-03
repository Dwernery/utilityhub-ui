import PropTypes from "prop-types";
import { useState } from "react";
import { Check } from "lucide-react";
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
  const [imageLoaded, setImageLoaded] = useState(!!item.s3Url);
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
      className="mcu-poster-card group relative w-28 flex-shrink-0 rounded-[10px] border border-white/10 cursor-pointer overflow-hidden"
      style={{
        aspectRatio: "2 / 3",
        scrollSnapAlign: "start",
        boxShadow: complete ? `0 0 0 2px ${color}, 0 6px 18px ${color}55` : ``,
      }}
      onClick={handleCardClick}
    >
      {/* Background image */}
      {item.s3Url && (
        <img
          src={item.s3Url}
          alt={item.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover z-0"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(false)}
        />
      )}

      {/* Gradient overlay */}
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          backgroundImage: posterBackground(item.id, color),
        }}
      />
      {isTv && (
        <span className="text-[8.5px] font-medium text-white absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-slate-950/80 backdrop-blur-sm">
          {episodesDone}/{episodeCount} {MODAL_LABELS.EPS}
        </span>
      )}
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
          if (isTv) {
            onSelectItem?.(item, color);
          } else {
            onToggleItem?.();
          }
        }}
        aria-label={
          complete ? MODAL_LABELS.MARK_UNWATCHED : MODAL_LABELS.MARK_WATCHED
        }
      >
        {!isTv && complete && (
          <Check size={12} color="#12141B" strokeWidth={3} />
        )}
      </button>

      <div
        className={`absolute left-0 right-0 bottom-0 px-1.5 pb-1.5 pt-3.5 transition-opacity duration-200 ${
          imageLoaded ? "invisible group-hover:visible" : "visible"
        }`}
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
    s3Url: PropTypes.string,
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
