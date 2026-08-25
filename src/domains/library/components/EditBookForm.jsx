import { useState } from "react";
import { useLibrary } from "../context/LibraryContext";
import SearchableDropdown from "./SearchableDropdown";
import { X } from "lucide-react";
import { useUpdateBook } from "../hooks/useUpdateBook";
import { useCreateAuthor } from "../hooks/useCreateAuthor";
import { useCreateSeries } from "../hooks/useCreateSeries";
import { useToast } from "../../../context/ToastContext";
import { isBookValid, BOOK_VALIDATION_MESSAGE } from "../utils/bookValidation";

export default function EditBookForm() {
  const {
    closeBookDialog,
    selectedBook,
    authorOptions,
    seriesOptions,
    setIsEditingInDialog,
  } = useLibrary();

  // Local editable draft, independent of the (cache-derived) selectedBook so
  // in-progress edits never leak into other consumers of the books cache.
  // The form only mounts while editing, so this initializer always reflects
  // the book as it was when "Edit" was clicked.
  const [draft, setDraft] = useState(() => ({ ...selectedBook }));

  const updateBookMutation = useUpdateBook();
  const createAuthor = useCreateAuthor();
  const createSeries = useCreateSeries();
  const addToast = useToast();

  const isSaving = updateBookMutation.isPending;
  const isBusy = isSaving || createAuthor.isPending || createSeries.isPending;

  const handleSaveBook = () => {
    if (!isBookValid(draft)) {
      addToast(BOOK_VALIDATION_MESSAGE, "error");
      return;
    }

    if (draft.status === "IN_PROGRESS" && !draft.startDate) {
      addToast("Start date is required when status is In-Progress", "error");
      return;
    }

    if (draft.status === "READ") {
      if (!draft.startDate) {
        addToast("Start date is required when status is Read", "error");
        return;
      }

      if (!draft.endDate) {
        addToast("End date is required when status is Read", "error");
        return;
      }
    }
    const payload = { id: draft.id };

    const norm = (v) => (v === "" ? null : v);

    const normalize = (book) => ({
      title: book.title?.trim(),
      pages:
        book.pages === "" || book.pages === null || book.pages === undefined
          ? null
          : Number(book.pages),
      authorName: book.authorName?.trim(),
      seriesName: norm(book.seriesName?.trim() || null),
      isbn13: norm(book.isbn13 || null),
      status: book.status,
      startDate: book.startDate || null,
      endDate: book.endDate || null,
    });

    const current = normalize(draft);
    const original = selectedBook ? normalize(selectedBook) : null;

    const fields = [
      "title",
      "pages",
      "authorName",
      "seriesName",
      "isbn13",
      "status",
      "startDate",
      "endDate",
    ];

    for (const f of fields) {
      const cur = current[f];
      const orig = original ? original[f] : undefined;
      const changed = orig === undefined ? true : cur !== orig;
      if (changed) payload[f] = cur;
    }

    // If nothing changed, just close the dialog
    if (Object.keys(payload).length <= 1) {
      setIsEditingInDialog(false);
      addToast("No changes to save", "info");
      return;
    }

    updateBookMutation.mutate(payload, {
      onSuccess: () => {
        addToast(`Book "${draft.title.trim()}" updated`, "success");
        setIsEditingInDialog(false);
      },
      onError: (err) => {
        addToast(
          `Failed to update book: ${err?.message || "Unknown error"}`,
          "error",
        );
      },
    });
  };

  return (
    <div>
      <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">Edit Book</h2>
        <button onClick={closeBookDialog}>
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>
      <div className="p-4 space-y-3">
        {[
          ["Title", "title", "text"],
          ["Pages", "pages", "number"],
          ["ISBN", "isbn13", "text"],
        ].map(([label, field, type]) => (
          <div key={field}>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {label}
            </label>
            <input
              type={type}
              value={draft[field] ?? ""}
              disabled={isBusy}
              onChange={(e) => setDraft({ ...draft, [field]: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:opacity-60"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Author
          </label>
          <SearchableDropdown
            value={draft.authorName}
            onChange={(v) => setDraft({ ...draft, authorName: v })}
            options={authorOptions}
            placeholder="Author"
            disabled={isBusy}
            isAddingNew={createAuthor.isPending}
            onAddNew={(v) => {
              const name = v.trim();
              if (!name) return;
              createAuthor.mutate(name, {
                onSuccess: (data) => {
                  const created = data?.name || name;
                  setDraft((b) => ({ ...b, authorName: created }));
                  addToast(`Author "${created}" created`, "success");
                },
                onError: (err) => {
                  addToast(
                    `Failed to create author: ${err?.message || "Unknown error"}`,
                    "error",
                  );
                },
              });
            }}
            addNewLabel="Add author"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Series
          </label>
          <SearchableDropdown
            value={draft.seriesName || ""}
            onChange={(v) => setDraft({ ...draft, seriesName: v })}
            options={seriesOptions}
            placeholder="Series"
            disabled={isBusy}
            isAddingNew={createSeries.isPending}
            onAddNew={(v) => {
              const name = v.trim();
              if (!name) return;
              createSeries.mutate(name, {
                onSuccess: (data) => {
                  const created = data?.name || name;
                  setDraft((b) => ({ ...b, seriesName: created }));
                  addToast(`Series "${created}" created`, "success");
                },
                onError: (err) => {
                  addToast(
                    `Failed to create series: ${err?.message || "Unknown error"}`,
                    "error",
                  );
                },
              });
            }}
            addNewLabel="Add series"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Status
          </label>
          <select
            value={draft.status}
            disabled={isBusy}
            onChange={(e) => {
              const nextStatus = e.target.value;
              setDraft((current) => {
                const updated = { ...current, status: nextStatus };

                if (nextStatus === "UNREAD") {
                  updated.startDate = null;
                  updated.endDate = null;
                } else if (nextStatus === "IN_PROGRESS") {
                  updated.endDate = null;
                }

                return updated;
              });
            }}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:opacity-60"
          >
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
            <option value="IN_PROGRESS">In-Progress</option>
          </select>
        </div>
        {draft.status !== "UNREAD" && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={draft.startDate || ""}
              disabled={isBusy}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  startDate: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:opacity-60"
            />
          </div>
        )}
        {draft.status === "READ" && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={draft.endDate || ""}
              disabled={isBusy}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  endDate: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:opacity-60"
            />
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSaveBook}
            disabled={isBusy}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            onClick={() => setIsEditingInDialog(false)}
            disabled={isBusy}
            className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
