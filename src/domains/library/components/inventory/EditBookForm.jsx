import { useState } from "react";
import { useLibrary } from "../../context/LibraryContext";
import { useBooks } from "../../hooks";
import { nextSeriesPosition, parseSeriesPosition } from "../../utils/series";
import { SearchableDropdown } from "../SearchableDropdown";
import { FileUploadInput } from "../FileUploadInput";
import { X } from "lucide-react";
import {
  useUpdateBook,
  useCreateAuthor,
  useCreateSeries,
  useS3Upload,
} from "../../hooks";
import { useToast } from "../../../../context/ToastContext";
import {
  isBookValid,
  BOOK_VALIDATION_MESSAGE,
} from "../../utils/bookValidation";

export function EditBookForm() {
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
  const [selectedFile, setSelectedFile] = useState(null);
  const { data: books = [] } = useBooks();
  // No series, no number. Choosing a different series suggests the next number in it.
  const withSeries = (b, name) => ({
    ...b,
    seriesName: name,
    seriesPosition: !name
      ? ""
      : name !== b.seriesName || !b.seriesPosition
        ? String(nextSeriesPosition(books, name))
        : b.seriesPosition,
  });

  const updateBookMutation = useUpdateBook();
  const createAuthor = useCreateAuthor();
  const createSeries = useCreateSeries();
  const s3Upload = useS3Upload();
  const addToast = useToast();

  const isSaving = updateBookMutation.isPending;
  const isBusy =
    isSaving ||
    createAuthor.isPending ||
    createSeries.isPending ||
    s3Upload.isUploading;

  const handleSaveBook = async () => {
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
      // No series, no number; "invalid" is caught below.
      seriesPosition: book.seriesName?.trim()
        ? parseSeriesPosition(book.seriesPosition)
        : null,
      status: book.status,
      startDate: book.startDate || null,
      endDate: book.endDate || null,
    });

    const current = normalize(draft);
    const original = selectedBook ? normalize(selectedBook) : null;
    if (current.seriesPosition === "invalid") {
      addToast("Book # must be a whole number from 1 to 999", "error");
      return;
    }

    const fields = [
      "title",
      "pages",
      "authorName",
      "seriesName",
      "seriesPosition",
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

    try {
      // Update book if there are changes
      if (Object.keys(payload).length > 1) {
        await new Promise((resolve, reject) => {
          updateBookMutation.mutate(payload, {
            onSuccess: () => resolve(),
            onError: reject,
          });
        });
      }

      // Upload file if selected
      if (selectedFile) {
        try {
          await s3Upload.uploadFile(selectedFile, draft.id, "cover");
          addToast(
            `Book "${draft.title.trim()}" updated and file uploaded`,
            "success",
          );
        } catch (uploadErr) {
          addToast(
            `Book updated, but file upload failed: ${uploadErr?.message || "Unknown error"}`,
            "warning",
          );
        }
      } else if (Object.keys(payload).length > 1) {
        addToast(`Book "${draft.title.trim()}" updated`, "success");
      } else {
        addToast("No changes to save", "info");
      }

      setIsEditingInDialog(false);
    } catch (err) {
      addToast(
        `Failed to update book: ${err?.message || "Unknown error"}`,
        "error",
      );
    }
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
            onChange={(v) => setDraft((b) => withSeries(b, v))}
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
                  setDraft((b) => withSeries(b, created));
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
        {draft.seriesName && (
          <div>
            <label
              htmlFor="edit-series-position"
              className="block text-xs font-medium text-slate-600 mb-1"
            >
              Book # in series
            </label>
            <input
              id="edit-series-position"
              type="number"
              min={1}
              max={999}
              step={1}
              inputMode="numeric"
              value={draft.seriesPosition ?? ""}
              disabled={isBusy}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  seriesPosition: e.target.value
                    .replace(/[^0-9]/g, "")
                    .slice(0, 3),
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:opacity-60"
            />
          </div>
        )}
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
        <FileUploadInput
          label="Update Book Cover or Document (Optional)"
          onFileSelected={setSelectedFile}
          selectedFile={selectedFile}
          isUploading={s3Upload.isUploading}
          uploadProgress={s3Upload.uploadProgress}
          disabled={isBusy}
          maxSizeMB={10}
        />
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
