import { CopyPlus, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Modal } from "../../../../components/Modal";
import { useToast } from "../../../../context/ToastContext";
import {
  useDeleteEpisode,
  useDeleteMcuItem,
  useMcuTrackerData,
} from "../../hooks";
import {
  draftFromRaw,
  findRaw,
  KIND_LABELS,
  nextEpisodeNumber,
  nextSeasonDraft,
  parseGlobalId,
} from "../../utils/editing";
import { McuItemForm } from "../editing/McuItemForm";
import { EpisodeForm } from "../editing/EpisodeForm";
import { useMcuTracker } from "../../context/McuTrackerContext";
import { useChangeStatus } from "../../useChangeStatus";
import { getStatus, nextStatus } from "../../utils/stats";
import { TYPE_META } from "../../utils/constants";
import { posterBackground } from "../../utils/posterArt";
import { MODAL_TITLE, MODAL_LABELS, STATUS } from "../../utils/statConstants";

const iconButton =
  "p-1.5 rounded-lg transition-colors flex-shrink-0 cursor-pointer disabled:opacity-50";

export function McuDetailModal({
  isOpen,
  onClose,
  onSelect,
  selectedItem,
  selectedItemColor,
}) {
  const { watched } = useMcuTracker();
  const { change, isPending: isUpdating } = useChangeStatus();
  const { data } = useMcuTrackerData();
  const deleteItem = useDeleteMcuItem();
  const deleteEpisode = useDeleteEpisode();
  const addToast = useToast();
  // "view" | "edit" | "next-season"
  const [mode, setMode] = useState("view");
  // The episode being edited (its id), "new" while adding one, or null.
  const [episodeEditing, setEpisodeEditing] = useState(null);

  if (!selectedItem || !isOpen) return null;

  const raw = findRaw(data, selectedItem.globalId);
  const rawEpisodes = raw?.kind === "show" ? raw.episodes : [];
  const rawEpisodeFor = (globalId) =>
    rawEpisodes.find((e) => e.globalId === globalId);
  const itemId = parseGlobalId(selectedItem.globalId)?.id;
  const itemLabel =
    selectedItem.type === "tv"
      ? `${selectedItem.title} season ${selectedItem.seasonNumber}`
      : selectedItem.title;

  const handleDelete = async () => {
    const episodes = selectedItem.episodes?.length ?? 0;
    const message =
      selectedItem.type === "tv" && episodes > 0
        ? `Delete ${itemLabel} and its ${episodes} episode${episodes === 1 ? "" : "s"}? This can't be undone.`
        : `Delete ${itemLabel}? This can't be undone.`;
    if (!confirm(message)) return;
    try {
      await deleteItem.mutateAsync(selectedItem.globalId);
      addToast(`Deleted ${itemLabel}`, "success");
      onClose?.();
    } catch (err) {
      addToast(err.message || "Failed to delete", "error");
    }
  };

  const handleDeleteEpisode = async (episode) => {
    const rawEpisode = rawEpisodeFor(episode.globalId);
    if (!rawEpisode) return;
    if (
      !confirm(`Delete episode ${episode.episodeNumber}, "${episode.title}"?`)
    )
      return;
    try {
      await deleteEpisode.mutateAsync(rawEpisode.id);
      addToast(`Deleted episode ${episode.episodeNumber}`, "success");
    } catch (err) {
      addToast(err.message || "Failed to delete episode", "error");
    }
  };

  if (mode !== "view" && raw) {
    const isNextSeason = mode === "next-season";
    return (
      <Modal
        onClose={() => setMode("view")}
        panelClassName="bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-700 shadow-2xl"
      >
        <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
          <div className="font-semibold text-slate-100 text-sm truncate pr-4">
            {isNextSeason
              ? `Add ${selectedItem.title} season ${selectedItem.seasonNumber + 1}`
              : `Edit ${KIND_LABELS[draftFromRaw(raw).kind]}`}
          </div>
          <button
            onClick={() => setMode("view")}
            className={`${iconButton} hover:bg-slate-800`}
            aria-label="Cancel"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        <div className="px-4 py-4">
          <McuItemForm
            initial={isNextSeason ? nextSeasonDraft(raw) : draftFromRaw(raw)}
            id={isNextSeason ? undefined : itemId}
            hasPoster={!isNextSeason && !!selectedItem.s3Url}
            onCancel={() => setMode("view")}
            onSaved={(globalId) => {
              setMode("view");
              // A new season is a different item: show it instead.
              if (isNextSeason) onSelect?.(globalId);
            }}
          />
        </div>
      </Modal>
    );
  }

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
    change(selectedItem.id, newStatus);
  };

  // Episodes cycle UNWATCHED -> IN_PROGRESS -> WATCHED -> UNWATCHED
  const handleEpisodeStatusChange = (episodeGlobalId) =>
    change(episodeGlobalId, nextStatus(watched[episodeGlobalId]), {
      episode: true,
    });

  const Icon = TYPE_META[selectedItem.type].icon;

  return (
    <Modal
      onClose={closeModal}
      panelClassName="bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-700 shadow-2xl"
    >
      <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="font-semibold text-slate-100 text-sm truncate pr-4">
          {MODAL_TITLE[selectedItem.type] || MODAL_TITLE.movie}
        </div>
        <div className="flex items-center gap-1">
          {raw && (
            <>
              <button
                onClick={() => setMode("edit")}
                className={`${iconButton} hover:bg-slate-800`}
                title="Edit"
                aria-label="Edit"
              >
                <Pencil className="w-4 h-4 text-slate-300" />
              </button>
              {isTv && (
                <button
                  onClick={() => setMode("next-season")}
                  className={`${iconButton} hover:bg-slate-800`}
                  title="Add next season"
                  aria-label="Add next season"
                >
                  <CopyPlus className="w-4 h-4 text-slate-300" />
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={deleteItem.isPending}
                className={`${iconButton} hover:bg-rose-950`}
                title="Delete"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
              </button>
            </>
          )}
          <button
            onClick={closeModal}
            className={`${iconButton} hover:bg-slate-800`}
            aria-label="Close"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
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

          {raw && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wide">
                  Episodes
                </div>
                <button
                  onClick={() => setEpisodeEditing("new")}
                  disabled={episodeEditing === "new"}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 cursor-pointer"
                >
                  <Plus size={14} />
                  Add episode
                </button>
              </div>
              {episodeEditing === "new" && (
                <div className="mb-2">
                  <EpisodeForm
                    showId={itemId}
                    nextNumber={nextEpisodeNumber(rawEpisodes)}
                    onDone={() => setEpisodeEditing(null)}
                  />
                </div>
              )}
              {selectedItem.episodes.length === 0 &&
                episodeEditing !== "new" && (
                  <p className="text-sm text-slate-500 italic">
                    No episodes yet. Add them one at a time.
                  </p>
                )}
              <div className="space-y-1.5">
                {selectedItem.episodes.map((episode, episodeIndex) => {
                  const episodeStatus =
                    getStatus(watched, episode.globalId) || "UNWATCHED";
                  const isWatched = episodeStatus === "WATCHED";
                  const rawEpisode = rawEpisodeFor(episode.globalId);
                  if (rawEpisode && episodeEditing === rawEpisode.id) {
                    return (
                      <EpisodeForm
                        key={episode.globalId}
                        showId={itemId}
                        episode={rawEpisode}
                        nextNumber={episode.episodeNumber}
                        onDone={() => setEpisodeEditing(null)}
                      />
                    );
                  }
                  return (
                    <div
                      key={episode.globalId ?? episodeIndex}
                      className="group flex items-center gap-3 p-2 rounded hover:bg-slate-800/50 transition-colors"
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
                          <span className="text-slate-500 mr-2 tabular-nums">
                            {episode.episodeNumber}.
                          </span>
                          {episode.title}
                          {episode.runtime && (
                            <span className="text-slate-500 ml-2">
                              • {episode.runtime} min
                            </span>
                          )}
                        </div>
                      </div>
                      {rawEpisode && (
                        <div className="flex gap-0.5 opacity-60 group-hover:opacity-100 focus-within:opacity-100">
                          <button
                            onClick={() => setEpisodeEditing(rawEpisode.id)}
                            className={`${iconButton} hover:bg-slate-700`}
                            title="Edit episode"
                            aria-label={`Edit episode ${episode.episodeNumber}`}
                          >
                            <Pencil className="w-3.5 h-3.5 text-slate-300" />
                          </button>
                          <button
                            onClick={() => handleDeleteEpisode(episode)}
                            disabled={deleteEpisode.isPending}
                            className={`${iconButton} hover:bg-rose-950`}
                            title="Delete episode"
                            aria-label={`Delete episode ${episode.episodeNumber}`}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                          </button>
                        </div>
                      )}
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
