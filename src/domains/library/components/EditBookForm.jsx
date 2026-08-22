import { useLibrary } from "../context/LibraryContext";
import SearchableDropdown from "./SearchableDropdown";
import { X } from "lucide-react";

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
          ["Total Pages", "totalPages", "number"],
          ["ISBN", "isbn", "text"],
        ].map(([label, field, type]) => (
          <div key={field}>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {label}
            </label>
            <input
              type={type}
              value={selectedBook[field] || ""}
              onChange={(e) =>
                setSelectedBook({
                  ...selectedBook,
                  [field]:
                    type === "number"
                      ? parseInt(e.target.value) || 0
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
              value={selectedBook.author}
              onChange={(v) => setSelectedBook({ ...selectedBook, author: v })}
              options={authorOptions}
              placeholder="Author"
              onAddNew={(v) => setCustomAuthors((p) => [...p, v])}
              addNewLabel="Add author"
            />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Series
          </label>
          {
            <SearchableDropdown
              value={selectedBook.series}
              onChange={(v) => setSelectedBook({ ...selectedBook, series: v })}
              options={seriesOptions}
              placeholder="Series"
              onAddNew={(v) => setCustomSeries((p) => [...p, v])}
              addNewLabel="Add series"
            />
          }
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Status
          </label>
          <select
            value={selectedBook.status}
            onChange={(e) =>
              setSelectedBook({ ...selectedBook, status: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="UNREAD">Unread</option>
            <option value="READ">Read</option>
            <option value="IN-PROGRESS">In-Progress</option>
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
            //onClick={saveBookFromDialog}
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
