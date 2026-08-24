import { Plus } from "lucide-react";
import { useState } from "react";
import { StartReadingModal } from "./StartReadingModal";
import { useUpdateBook } from "../../hooks/useUpdateBook";
import { useToast } from "../../../../context/ToastContext";

export const CurrentlyReading = ({ books }) => {
  const [showAddCurrentlyReading, setShowAddCurrentlyReading] = useState(false);
  const updateBook = useUpdateBook();
  const addToast = useToast();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800 text-sm">
          Currently Reading
        </h2>
        <button
          onClick={() => setShowAddCurrentlyReading(true)}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-xs font-medium flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Start Reading
        </button>
      </div>
      {books.filter((b) => b.status === "IN_PROGRESS").length > 0 ? (
        <div className="divide-y divide-slate-100">
              {books
            .filter((b) => b.status === "IN_PROGRESS")
            .map((book) => {
              const pctRaw = book.pages ? (book.currentPage / book.pages) * 100 : 0;
              const pct = Math.min(100, Math.max(0, Math.round(pctRaw || 0)));
              const days = book.startDate
                ? Math.ceil((new Date() - new Date(book.startDate)) / 86400000)
                : null;
              return (
                <div key={book.id} className="px-4 py-3">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="min-w-0">
                      <div className="font-medium text-slate-800 text-sm truncate">
                        {book.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        {book.authorName}
                        {days !== null ? ` · ${days}d` : ""}
                      </div>
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => {
                          const endDate = new Date().toISOString().slice(0, 10);
                          updateBook.mutate(
                            {
                              id: book.id,
                              status: "READ",
                              endDate,
                              currentPage: book.pages,
                            },
                            {
                              onSuccess: () =>
                                addToast(`Marked ${book.title} as read`, "success"),
                              onError: (err) =>
                                addToast(
                                  `Failed to mark book read: ${err?.message || "Unknown error"}`,
                                  "error",
                                ),
                            },
                          );
                        }}
                        className="px-2.5 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded-md text-xs font-medium transition-colors"
                      >
                        Done
                      </button>
                      <button
                        onClick={() => {
                          updateBook.mutate(
                            {
                              id: book.id,
                              status: "UNREAD",
                              startDate: null,
                              endDate: null,
                              currentPage: 0,
                            },
                            {
                              onSuccess: () =>
                                addToast(`Removed ${book.title} from progress`, "success"),
                              onError: (err) =>
                                addToast(
                                  `Failed to remove book from progress: ${err?.message || "Unknown error"}`,
                                  "error",
                                ),
                            },
                          );
                        }}
                        className="px-2.5 py-1 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md text-xs font-medium transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <input
                      key={book.currentPage}
                      type="number"
                      defaultValue={book.currentPage}
                      onBlur={(e) => {
                        const next = Number(e.target.value) || 0;
                        if (next === book.currentPage) return;

                        updateBook.mutate(
                          { id: book.id, currentPage: next },
                          {
                            onSuccess: () =>
                              addToast(`Updated progress for ${book.title}`, "success"),
                            onError: (err) =>
                              addToast(
                                `Failed to update progress: ${err?.message || "Unknown error"}`,
                                "error",
                              ),
                          },
                        );
                      }}
                      className="w-14 px-2 py-0.5 border border-slate-200 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <span className="text-xs text-slate-400">
                      /{book.pages}
                    </span>
                    <span className="text-xs font-medium text-slate-500 w-8 text-right">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <p className="px-4 py-4 text-sm text-slate-400">
          No books in progress.
        </p>
      )}
      {showAddCurrentlyReading && (
        <StartReadingModal
          setShowAddCurrentlyReading={setShowAddCurrentlyReading}
          books={books}
        />
      )}
    </div>
  );
};
