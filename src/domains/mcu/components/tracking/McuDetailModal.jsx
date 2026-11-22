import { CopyPlus, Pencil, Trash2, X } from "lucide-react";
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
  nextSeasonDraft,
} from "../../utils/editing";
import { MODAL_TITLE } from "../../utils/constants";
import { McuItemForm } from "../editing/McuItemForm";
import {
  DetailHero,
  iconButton,
  MovieBody,
  SeasonBody,
} from "./McuDetailParts";

const PANEL =
  "bg-slate-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-700 shadow-2xl";

/**
 * Movie / special / season details, with edit, add-next-season and delete. The body
 * pieces are in McuDetailParts.jsx.
 */
export function McuDetailModal({
  isOpen,
  onClose,
  onSelect,
  selectedItem,
  selectedItemColor,
}) {
  const { data } = useMcuTrackerData();
  const deleteItem = useDeleteMcuItem();
  const deleteEpisode = useDeleteEpisode();
  const addToast = useToast();
  // "view" | "edit" | "next-season"
  const [mode, setMode] = useState("view");
  // The episode being edited (its id), "new" while adding one, or null.
  const [episodeEditing, setEpisodeEditing] = useState(null);

  if (!selectedItem || !isOpen) return null;

  // The raw record has the full premiere date and the domain, which the edit form needs.
  const raw = findRaw(data, selectedItem.globalId);
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
      await deleteItem.mutateAsync({
        kind: selectedItem.type === "tv" ? "show" : "movie",
        id: selectedItem.recordId,
      });
      addToast(`Deleted ${itemLabel}`, "success");
      onClose?.();
    } catch (err) {
      addToast(err.message || "Failed to delete", "error");
    }
  };

  const handleDeleteEpisode = async (episode) => {
    if (
      !confirm(`Delete episode ${episode.episodeNumber}, "${episode.title}"?`)
    )
      return;
    try {
      await deleteEpisode.mutateAsync(episode.id);
      addToast(`Deleted episode ${episode.episodeNumber}`, "success");
    } catch (err) {
      addToast(err.message || "Failed to delete episode", "error");
    }
  };

  if (mode !== "view" && raw) {
    const isNextSeason = mode === "next-season";
    return (
      <Modal onClose={() => setMode("view")} panelClassName={PANEL}>
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
            id={isNextSeason ? undefined : selectedItem.recordId}
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

  const isTv = selectedItem.type === "tv";

  return (
    <Modal onClose={onClose} panelClassName={PANEL}>
      <div className="sticky top-0 z-50 bg-slate-900 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="font-semibold text-slate-100 text-sm truncate pr-4">
          {MODAL_TITLE[isTv ? "tv" : "movie"]}
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
            onClick={onClose}
            className={`${iconButton} hover:bg-slate-800`}
            aria-label="Close"
          >
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      <div className="px-4 py-4">
        <DetailHero item={selectedItem} color={selectedItemColor} />
        {isTv ? (
          <SeasonBody
            item={selectedItem}
            color={selectedItemColor}
            editing={episodeEditing}
            onEditing={setEpisodeEditing}
            onDeleteEpisode={handleDeleteEpisode}
            deleting={deleteEpisode.isPending}
          />
        ) : (
          <MovieBody item={selectedItem} />
        )}
      </div>
    </Modal>
  );
}
