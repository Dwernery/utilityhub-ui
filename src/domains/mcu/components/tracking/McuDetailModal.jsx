import { useState } from "react";
import PropTypes from "prop-types";
import { X } from "lucide-react";
import Modal from "../../../library/components/Modal";
import { useMcuTracker } from "../../context/McuTrackerContext";
import { useUpdateContentStatus } from "../../hooks/useUpdateContentStatus";
import { useToast } from "../../../../context/ToastContext";
import { getStatus, nextStatus } from "../../utils/stats";
import { TYPE_META } from "../../utils/constants";
import { posterBackground } from "../../utils/posterArt";
import { MODAL_TITLE, MODAL_LABELS, STATUS } from "../../utils/statConstants";

export function McuDetailModal({
  isOpen,
  onClose,
  selectedItem,
  selectedItemColor,
}) {
  const { watched, setWatched } = useMcuTracker();
  const { mutate: updateContentStatus } = useUpdateContentStatus();
  const addToast = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  if (!selectedItem || !isOpen) return null;

  const closeModal = () => {
    onClose?.();
  };

  const isTv = selectedItem.type === "tv";
  // Movies/specials show status; TV shows display episodes in detail view
  const currentStatus = isTv
    ? null
    : getStatus(watched, selectedItem.id) || STATUS.UNWATCHED;

  const handleStatusChange = (newStatus) => {
    if (isTv) return; // Status toggle not available for TV shows in detail view

    setIsUpdating(true);
    updateContentStatus(
      {
        globalId: selectedItem.id,
        status: newStatus,
      },
      {
        onSuccess: () => {
          setWatched((prev) => ({
            ...prev,
            [selectedItem.id]: newStatus,
          }));
          addToast(`Status updated to ${newStatus}`, "success");
        },
        onError: () => {
          addToast("Failed to update status. Please try again.", "error");
        },
        onSettled: () => {
          setIsUpdating(false);
        },
      },
    );
  };

  const handleEpisodeStatusChange = (episodeGlobalId) => {
    // Cycle through status: UNWATCHED -> IN_PROGRESS -> WATCHED -> UNWATCHED
    const episodeStatus =
      getStatus(watched, episodeGlobalId) || STATUS.UNWATCHED;
    const newEpisodeStatus = nextStatus(episodeStatus);

    setIsUpdating(true);
    updateContentStatus(
      {
        globalId: episodeGlobalId,
        status: newEpisodeStatus,
      },
      {
        onSuccess: () => {
          setWatched((prev) => ({
            ...prev,
            [episodeGlobalId]: newEpisodeStatus,
          }));
          addToast(`Episode status updated to ${newEpisodeStatus}`, "success");
        },
        onError: () => {
          addToast(
            "Failed to update episode status. Please try again.",
            "error",
          );
        },
        onSettled: () => {
          setIsUpdating(false);
        },
      },
    );
  };

  const Icon = TYPE_META[selectedItem.type].icon;

  return (
    <Modal
      onClose={closeModal}
      panelClassName="bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-700 shadow-2xl"
    >
      <div className="sticky top-0 bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="font-semibold text-slate-100 text-sm truncate pr-4">
          {MODAL_TITLE[selectedItem.type] || MODAL_TITLE.movie}
        </div>
        <button
          onClick={closeModal}
          className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors flex-shrink-0 hover:cursor-pointer"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {isTv ? (
        // TV Show Season Details
        <div className="px-4 py-4">
          <div className="flex gap-4 mb-5">
            <div className="relative w-24 h-36 rounded-lg flex-shrink-0 overflow-hidden shadow-md border border-slate-700">
              {/* Background image */}
              {selectedItem.s3Url && (
                <img
                  src={selectedItem.s3Url}
                  alt={selectedItem.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
              )}
              {/* Gradient overlay */}
              <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  backgroundImage: posterBackground(
                    selectedItem.id,
                    selectedItemColor,
                  ),
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-start gap-2 mb-2">
                <Icon
                  size={18}
                  className="text-slate-400 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white leading-snug">
                    {selectedItem.title}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {MODAL_LABELS.SEASON} {selectedItem.seasonNumber}
                  </p>
                </div>
              </div>

              {selectedItem.episodes &&
                selectedItem.episodes.length > 0 &&
                (() => {
                  const totalRuntime = selectedItem.episodes.reduce(
                    (sum, episode) => sum + (episode.runtime || 0),
                    0,
                  );
                  return totalRuntime > 0 ? (
                    <div className="mt-3 p-2 bg-slate-800/50 rounded">
                      <div className="text-xs text-slate-400 mb-1">
                        Total Runtime
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {totalRuntime} min
                      </div>
                    </div>
                  ) : null;
                })()}
            </div>
          </div>

          {selectedItem.episodes && selectedItem.episodes.length > 0 && (
            <>
              {(() => {
                const watchedCount = selectedItem.episodes.filter((episode) => {
                  return getStatus(watched, episode.globalId) === "WATCHED";
                }).length;
                const progressPercent =
                  (watchedCount / selectedItem.episodes.length) * 100;

                return (
                  <div className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                        Progress
                      </div>
                      <div className="text-xs text-slate-300 font-medium">
                        {watchedCount}/{selectedItem.episodes.length} watched
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-300 rounded-full"
                        style={{
                          width: `${progressPercent}%`,
                          backgroundColor: selectedItemColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {selectedItem.synopsis && (
            <div className="mb-5 p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">
                Synopsis
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedItem.synopsis}
              </p>
            </div>
          )}

          {selectedItem.episodes && selectedItem.episodes.length > 0 && (
            <div>
              <div className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wide">
                Episodes
              </div>
              <div className="space-y-1.5">
                {selectedItem.episodes.map((episode, episodeIndex) => {
                  const episodeStatus =
                    getStatus(watched, episode.globalId) || "UNWATCHED";
                  const isWatched = episodeStatus === "WATCHED";
                  return (
                    <div
                      key={episodeIndex}
                      className="flex items-center gap-3 p-2 rounded hover:bg-slate-800/50 transition-colors"
                    >
                      <button
                        onClick={() =>
                          handleEpisodeStatusChange(episode.globalId)
                        }
                        disabled={isUpdating}
                        style={{
                          backgroundColor:
                            episodeStatus === "WATCHED"
                              ? selectedItemColor
                              : episodeStatus === "IN_PROGRESS"
                                ? `${selectedItemColor}33`
                                : "transparent",
                          borderColor:
                            episodeStatus === "WATCHED"
                              ? selectedItemColor
                              : episodeStatus === "IN_PROGRESS"
                                ? selectedItemColor
                                : "#475569",
                        }}
                        className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-all disabled:opacity-50 hover:cursor-pointer`}
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-medium ${
                            isWatched ? "text-slate-400" : "text-white"
                          }`}
                        >
                          {episode.title}
                          {episode.runtime && (
                            <span className="text-slate-500 ml-2">
                              • {episode.runtime} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ) : (
        // Movie/Special Details
        <div className="px-4 py-4">
          <div className="flex gap-4 mb-4">
            <div className="relative w-24 h-36 rounded-lg flex-shrink-0 overflow-hidden shadow-md border border-slate-700">
              {/* Background image */}
              {selectedItem.s3Url && (
                <img
                  src={selectedItem.s3Url}
                  alt={selectedItem.title}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
              )}
              {/* Gradient overlay */}
              <div
                className="absolute inset-0 z-10 pointer-events-none"
                style={{
                  backgroundImage: posterBackground(
                    selectedItem.id,
                    selectedItemColor,
                  ),
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-start gap-2 mb-2">
                <Icon
                  size={18}
                  className="text-slate-400 flex-shrink-0 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white leading-snug">
                    {selectedItem.title}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {selectedItem.premiereDate}
                  </p>
                </div>
              </div>

              {selectedItem.runtime && (
                <div className="mt-3 p-2 bg-slate-800/50 rounded">
                  <div className="text-xs text-slate-400 mb-1">Runtime</div>
                  <div className="text-sm font-semibold text-white">
                    {selectedItem.runtime} min
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedItem.synopsis && (
            <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
              <div className="text-xs text-slate-400 mb-2 font-semibold uppercase tracking-wide">
                Synopsis
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">
                {selectedItem.synopsis}
              </p>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-slate-700">
            <div className="text-xs text-slate-400 mb-3 font-semibold uppercase tracking-wide">
              Status
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusChange("UNWATCHED")}
                disabled={isUpdating}
                style={{
                  borderColor:
                    currentStatus === "UNWATCHED"
                      ? selectedItemColor
                      : "#475569",
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentStatus === "UNWATCHED"
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                Unwatched
              </button>
              <button
                onClick={() => handleStatusChange("IN_PROGRESS")}
                disabled={isUpdating}
                style={{
                  borderColor:
                    currentStatus === "IN_PROGRESS"
                      ? selectedItemColor
                      : "#475569",
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentStatus === "IN_PROGRESS"
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                In Progress
              </button>
              <button
                onClick={() => handleStatusChange("WATCHED")}
                disabled={isUpdating}
                style={{
                  borderColor:
                    currentStatus === "WATCHED" ? selectedItemColor : "#475569",
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentStatus === "WATCHED"
                    ? "text-white"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                Watched
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

McuDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  selectedItem: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["movie", "tv"]).isRequired,
    title: PropTypes.string.isRequired,
    seasonNumber: PropTypes.number,
    episodes: PropTypes.arrayOf(
      PropTypes.shape({
        globalId: PropTypes.string.isRequired,
        episodeNumber: PropTypes.number,
        title: PropTypes.string,
      }),
    ),
  }),
  selectedItemColor: PropTypes.string,
};
