import { useLibrary } from "../context/LibraryContext";
import SearchableDropdown from "./SearchableDropdown";
import { X } from "lucide-react";
import { useUpdateBook } from "../hooks/useUpdateBook";
import { useToast } from "../../../context/ToastContext";

export default function EditBookForm() {
  const {
    closeBookDialog,
    selectedBook,
    setSelectedBook,
    setCustomAuthors,
    setCustomSeries,
    authorOptions,
    seriesOptions,
    setIsEditingInDialog,
  } = useLibrary();

  const updateBookMutation = useUpdateBook();
  const addToast = useToast();

  const handleSaveBook = () => {
    if (!selectedBook?.title?.trim() || !selectedBook?.authorName?.trim()) {
      addToast("Title and author are required", "error");
      return;
    }

    if (selectedBook.status === "IN_PROGRESS" && !selectedBook.startDate) {
      addToast("Start date is required when status is In-Progress", "error");
      return;
    }

    if (selectedBook.status === "READ") {
      if (!selectedBook.startDate) {
        addToast("Start date is required when status is Read", "error");
        return;
      }

      if (!selectedBook.endDate) {
        addToast("End date is required when status is Read", "error");
        return;
      }
    }

    updateBookMutation.mutate(
      {
        id: selectedBook.id,
        title: selectedBook.title.trim(),
        pages: selectedBook.pages,
        authorName: selectedBook.authorName.trim(),
        seriesName: selectedBook.seriesName?.trim() || "",
        isbn13: selectedBook.isbn || "",
        status: selectedBook.status,
        startDate: selectedBook.startDate || null,
        endDate: selectedBook.endDate || null,
      },
      {
        onSuccess: () => {
          addToast(`Book "${selectedBook.title.trim()}" updated`, "success");
          setIsEditingInDialog(false);
        },
        onError: (err) => {
          addToast(
            `Failed to update book: ${err?.message || "Unknown error"}`,
            "error",
          );
        },
      },
    );
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
              value={selectedBook[field] ?? ""}
              onChange={(e) =>
                setSelectedBook({
                  ...selectedBook,
                  [field]:
                    type === "number"
                      ? Number(e.target.value) || 0
                      : e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Author
          </label>
          <SearchableDropdown
            value={selectedBook.authorName}
            onChange={(v) =>
              setSelectedBook({ ...selectedBook, authorName: v })
            }
            options={authorOptions}
            placeholder="Author"
            onAddNew={(v) => {
              const name = v.trim();
              if (!name) return;
              setCustomAuthors((p) => [name, ...p]);
              setSelectedBook((b) => ({ ...b, authorName: name }));
            }}
            addNewLabel="Add author"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Series
          </label>
          <SearchableDropdown
            value={selectedBook.seriesName || ""}
            onChange={(v) =>
              setSelectedBook({ ...selectedBook, seriesName: v })
            }
            options={seriesOptions}
            placeholder="Series"
            onAddNew={(v) => {
              const name = v.trim();
              if (!name) return;
              setCustomSeries((p) => [name, ...p]);
              setSelectedBook((b) => ({ ...b, seriesName: name }));
            }}
            addNewLabel="Add series"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Status
          </label>
          <select
            value={selectedBook.status}
            onChange={(e) => {
              const nextStatus = e.target.value;
              setSelectedBook((current) => {
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
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
            <option value="IN_PROGRESS">In-Progress</option>
          </select>
        </div>
        {selectedBook.status !== "UNREAD" && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={selectedBook.startDate || ""}
              onChange={(e) =>
                setSelectedBook({
                  ...selectedBook,
                  startDate: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        {selectedBook.status === "READ" && (
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={selectedBook.endDate || ""}
              onChange={(e) =>
                setSelectedBook({
                  ...selectedBook,
                  endDate: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleSaveBook}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditingInDialog(false)}
            className="flex-1 bg-slate-100 text-slate-700 py-2 rounded-lg text-sm font-medium hover:bg-slate-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
