import { Check, Tv, X } from "lucide-react";

export function EpisodeSheet({
  item,
  color,
  watched,
  onToggleEpisode,
  onToggleAll,
  onClose,
}) {
  const episodeCount = item.episodes.length;
  const episodesDone = item.episodes.filter(
    (_, i) => watched[`${item.id}::e${i}`],
  ).length;
  const allDone = episodesDone === episodeCount;

  return (
    <div
      className="fixed inset-0 bg-black/65 backdrop-blur-sm z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg animate-[mcu-sheet-up_0.22s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="bg-slate-800 rounded-t-2xl border border-slate-700 border-b-0 pt-2.5 px-4.5 pb-5.5 flex flex-col overflow-hidden"
          style={{
            maxHeight: "85vh",
            boxShadow: `0 -8px 32px ${color}30, 0 -4px 24px rgba(0,0,0,0.5)`,
          }}
        >
          <div className="w-9 h-1 rounded-full bg-slate-600 mx-auto mb-3.5 flex-shrink-0" />

          <div className="flex items-center gap-3 mb-3.5 flex-shrink-0">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}26`, color }}
            >
              <Tv size={17} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-extrabold text-slate-50 overflow-hidden text-ellipsis whitespace-nowrap">
                {item.title}
              </div>
              <div className="text-xs font-bold mt-0.5" style={{ color }}>
                {episodesDone}/{episodeCount} episodes watched
              </div>
            </div>
            <button
              type="button"
              className="bg-slate-950 border border-slate-600 rounded-lg text-slate-300 w-[30px] h-[30px] flex items-center justify-center cursor-pointer flex-shrink-0"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <button
            type="button"
            className="border-[1.5px] bg-transparent rounded-lg font-bold text-xs py-2.5 px-3 cursor-pointer mb-2 flex items-center justify-center gap-1.5"
            style={
              allDone
                ? { background: color, color: "#12141B", borderColor: color }
                : { color, borderColor: `${color}66` }
            }
            onClick={onToggleAll}
          >
            {allDone ? (
              <>
                <Check size={14} strokeWidth={3} /> All episodes watched
              </>
            ) : (
              "Mark all episodes watched"
            )}
          </button>

          <div className="flex flex-col overflow-y-auto pt-1 flex-1 min-h-0">
            {item.episodes.map((title, i) => {
              const isWatched = !!watched[`${item.id}::e${i}`];
              return (
                <button
                  key={`${item.id}-e${i}`}
                  type="button"
                  className="mcu-episode-row flex items-center gap-2.5 bg-transparent border-none cursor-pointer py-2.5 px-1.5 text-left rounded-lg"
                  onClick={() => onToggleEpisode(i)}
                >
                  <span
                    className="w-[17px] h-[17px] rounded border-[1.5px] border-slate-600 flex-shrink-0 flex items-center justify-center"
                    style={
                      isWatched
                        ? { background: color, borderColor: color }
                        : undefined
                    }
                  >
                    {isWatched && (
                      <Check size={11} color="#12141B" strokeWidth={3} />
                    )}
                  </span>
                  <span className="text-xs text-slate-500 flex-shrink-0 min-w-[18px]">
                    {i + 1}.
                  </span>
                  <span
                    className={`text-sm overflow-hidden text-ellipsis whitespace-nowrap ${isWatched ? "text-slate-300" : "text-slate-200"}`}
                  >
                    {title}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
