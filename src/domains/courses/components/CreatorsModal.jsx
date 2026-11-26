import { useMemo, useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { Modal } from "../../../components/Modal";
import { useToast } from "../../../context/ToastContext";
import {
  useCourses,
  useCreators,
  useDeleteCreator,
  useRenameCreator,
} from "../hooks";

/**
 * Every creator with how many courses they have. Rename one (every course shows the
 * new name), or delete one that no course uses.
 */
export function CreatorsModal({ onClose }) {
  const { data: creators = [] } = useCreators();
  const { data: courses = [] } = useCourses();
  const renameCreator = useRenameCreator();
  const deleteCreator = useDeleteCreator();
  const addToast = useToast();
  // { id, name } while a creator's name is being edited
  const [editing, setEditing] = useState(null);

  const courseCounts = useMemo(() => {
    const counts = new Map();
    for (const c of courses) {
      counts.set(c.creatorName, (counts.get(c.creatorName) ?? 0) + 1);
    }
    return counts;
  }, [courses]);
  const busy = renameCreator.isPending || deleteCreator.isPending;

  const saveRename = () => {
    const name = editing.name.trim();
    const creator = creators.find((c) => c.id === editing.id);
    if (!name || name === creator?.name) {
      setEditing(null);
      return;
    }
    renameCreator.mutate(
      { id: editing.id, name },
      {
        onSuccess: () => {
          addToast(`Renamed to "${name}"`, "success");
          setEditing(null);
        },
        onError: (err) =>
          addToast(err?.message || "Couldn't rename the creator", "error"),
      },
    );
  };

  const remove = (creator) => {
    if (!window.confirm(`Delete the creator "${creator.name}"?`)) return;
    deleteCreator.mutate(creator.id, {
      onSuccess: () => addToast(`Deleted "${creator.name}"`, "success"),
      onError: (err) =>
        addToast(err?.message || "Couldn't delete the creator", "error"),
    });
  };

  return (
    <Modal
      onClose={busy ? () => {} : onClose}
      panelClassName="bg-white w-full max-w-md max-h-[80vh] flex flex-col rounded-xl border border-slate-200 shadow-2xl"
    >
      <div className="border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
        <h2 className="font-bold text-slate-800 text-lg">Creators</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {creators.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">
          No creators yet. Add one from a course&apos;s Creator field.
        </p>
      ) : (
        <ul className="overflow-y-auto divide-y divide-slate-100">
          {creators.map((creator) => {
            const count = courseCounts.get(creator.name) ?? 0;
            const isEditing = editing?.id === creator.id;
            return (
              <li
                key={creator.id}
                className="flex items-center gap-2 px-5 py-2 min-h-12"
              >
                {isEditing ? (
                  <form
                    className="flex-1 flex items-center gap-1"
                    onSubmit={(e) => {
                      e.preventDefault();
                      saveRename();
                    }}
                  >
                    <input
                      type="text"
                      value={editing.name}
                      onChange={(e) =>
                        setEditing({ ...editing, name: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          e.stopPropagation();
                          setEditing(null);
                        }
                      }}
                      maxLength={255}
                      autoFocus
                      // readOnly, not disabled: disabling drops focus, so after a
                      // refused name you couldn't just keep typing.
                      readOnly={busy}
                      aria-label={`New name for ${creator.name}`}
                      className="flex-1 min-w-0 px-2 py-1 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      aria-label="Save name"
                      className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      disabled={busy}
                      aria-label="Cancel rename"
                      className="p-1.5 rounded-md text-slate-400 hover:bg-slate-100 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <>
                    <span className="flex-1 min-w-0 text-sm text-slate-800 truncate">
                      {creator.name}
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap">
                      {count} {count === 1 ? "course" : "courses"}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditing({ id: creator.id, name: creator.name })
                      }
                      disabled={busy}
                      aria-label={`Rename ${creator.name}`}
                      title="Rename"
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(creator)}
                      disabled={busy || count > 0}
                      aria-label={`Delete ${creator.name}`}
                      title={
                        count > 0
                          ? "Give their courses another creator first"
                          : "Delete"
                      }
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-default"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
