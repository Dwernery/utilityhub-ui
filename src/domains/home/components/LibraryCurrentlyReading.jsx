import { BookOpen } from "lucide-react";
import BookCover from "../../library/components/BookCover";

export function LibraryCurrentlyReading({ books }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3">
        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
        Currently reading
      </div>

      {books.length > 0 ? (
        <div className="space-y-3">
          {books.slice(0, 4).map((book) => 
            {const pctRaw = book.currentPage / book.pages * 100;
              const pct = Math.min(100, Math.max(0, Math.round(pctRaw || 0)));
              const days = book.startDate ? Math.max(0, Math.floor((new Date() - new Date(`${book.startDate}T00:00:00`)) / 86400000)) : null;

              return (
                <div key={book.id} className="flex gap-4 items-center">
                  <div className="w-10 h-15 rounded-md flex-shrink-0 overflow-hidden ring-1 ring-slate-200">
                    <BookCover book={book} className="w-full h-full" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-700 truncate">
                        {book.title}
                      </span>

                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {book.currentPage || 0}/{book.pages ?? "?"} pages
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="text-xs text-slate-400 truncate">
                        {book.authorName}
                        {days !== null ? ` · ${days}d` : ""}
                      </span>

                      <span className="text-xs font-medium text-slate-400 font-semibold flex-shrink-0">
                        {pct}%
                      </span>
                    </div>
                  </div>
                </div>
              );
          })}

          {books.length > 4 && (
            <div className="text-xs text-slate-400">
              +{books.length - 4} more in progress
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-400">Nothing in progress right now.</p>
      )}
    </div>
  );
}
