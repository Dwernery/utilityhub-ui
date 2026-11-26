import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Modal } from "../../../components/Modal";
import { useToast } from "../../../context/ToastContext";
import {
  useCourses,
  useCreateGroup,
  useDeleteGroup,
  useGroups,
  useRenameGroup,
  useReorderGroups,
} from "../hooks";

const iconButton =
  "p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:cursor-default";

/**
 * Every group, in display order, with how many courses it has. Add a group, rename
 * one, move it up or down, or delete it (its courses move to Ungrouped).
 * Works like CreatorsModal.
 */
export function GroupsModal({ onClose }) {
  const { data: groups = [] } = useGroups();
  const { data: courses = [] } = useCourses();
  const createGroup = useCreateGroup();
  const renameGroup = useRenameGroup();
  const deleteGroup = useDeleteGroup();
  const reorderGroups = useReorderGroups();
  const addToast = useToast();
  // { id, name } while a group's name is being edited
  const [editing, setEditing] = useState(null);
  const [newName, setNewName] = useState("");

  const sorted = useMemo(
    () => [...groups].sort((a, b) => a.position - b.position || a.id - b.id),
    [groups],
  );
  const courseCounts = useMemo(() => {
    const counts = new Map();
    for (const c of courses) {
      if (c.groupId != null) {
        counts.set(c.groupId, (counts.get(c.groupId) ?? 0) + 1);
      }
    }
    return counts;
  }, [courses]);
  const busy =
    createGroup.isPending || renameGroup.isPending || deleteGroup.isPending;

  const add = () => {
    const name = newName.trim();
    if (!name) return;
    createGroup.mutate(name, {
      onSuccess: (group) => {
        setNewName("");
        // The API hands back the existing group when the name is taken.
        addToast(
          groups.some((g) => g.id === group.id)
            ? `"${group.name}" already exists`
            : `Group "${group.name}" added`,
          "success",
        );
      },
      onError: (err) =>
        addToast(err?.message || "Couldn't add the group", "error"),
    });
  };

  const saveRename = () => {
    const name = editing.name.trim();
    const group = groups.find((g) => g.id === editing.id);
    if (!name || name === group?.name) {
      setEditing(null);
      return;
    }
    renameGroup.mutate(
      { id: editing.id, name },
      {
        onSuccess: () => {
          addToast(`Renamed to "${name}"`, "success");
          setEditing(null);
        },
        onError: (err) =>
          addToast(err?.message || "Couldn't rename the group", "error"),
      },
    );
  };

  const move = (index, delta) => {
    const ids = sorted.map((g) => g.id);
    const to = index + delta;
    [ids[index], ids[to]] = [ids[to], ids[index]];
    reorderGroups.mutate(ids, {
      onError: (err) =>
        addToast(err?.message || "Couldn't reorder groups", "error"),
    });
  };

  const remove = (group) => {
    const count = courseCounts.get(group.id) ?? 0;
    const courses =
      count === 0
        ? ""
        : ` Its ${count === 1 ? "course" : `${count} courses`} will move to Ungrouped.`;
    if (!window.confirm(`Delete the group "${group.name}"?${courses}`)) return;
    deleteGroup.mutate(group.id, {
      onSuccess: () => addToast(`Deleted "${group.name}"`, "success"),
      onError: (err) =>
        addToast(err?.message || "Couldn't delete the group", "error"),
    });
  };

  return (
    <Modal
      onClose={busy ? () => {} : onClose}
      panelClassName="bg-white w-full max-w-md max-h-[80vh] flex flex-col rounded-xl border border-slate-200 shadow-2xl"
    >
      <div className="border-b border-slate-100 px-5 py-3.5 flex items-center justify-between">
        <h2 className="font-bold text-slate-800 text-lg">Groups</h2>
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <form
        className="flex items-center gap-2 px-5 py-3 border-b border-slate-100"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New group name"
          aria-label="New group name"
          maxLength={255}
          // readOnly, not disabled, so focus stays here after adding one.
          readOnly={createGroup.isPending}
          className="flex-1 min-w-0 px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={!newName.trim() || createGroup.isPending}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-default"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </form>

      {sorted.length === 0 ? (
        <p className="px-5 py-6 text-sm text-slate-500">
          No groups yet. Courses without a group show under Ungrouped.
        </p>
      ) : (
        <ul className="overflow-y-auto divide-y divide-slate-100">
          {sorted.map((group, index) => {
            const count = courseCounts.get(group.id) ?? 0;
            const isEditing = editing?.id === group.id;
            return (
              <li
                key={group.id}
                className="flex items-center gap-1 px-5 py-2 min-h-12"
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
                      readOnly={busy}
                      aria-label={`New name for ${group.name}`}
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
                      {group.name}
                    </span>
                    <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap mr-1">
                      {count} {count === 1 ? "course" : "courses"}
                    </span>
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={busy || index === 0}
                      aria-label={`Move ${group.name} up`}
                      title="Move up"
                      className={iconButton}
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={busy || index === sorted.length - 1}
                      aria-label={`Move ${group.name} down`}
                      title="Move down"
                      className={iconButton}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditing({ id: group.id, name: group.name })
                      }
                      disabled={busy}
                      aria-label={`Rename ${group.name}`}
                      title="Rename"
                      className={iconButton}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(group)}
                      disabled={busy}
                      aria-label={`Delete ${group.name}`}
                      title={
                        count > 0
                          ? "Delete (its courses move to Ungrouped)"
                          : "Delete"
                      }
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer disabled:opacity-30 disabled:cursor-default"
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
