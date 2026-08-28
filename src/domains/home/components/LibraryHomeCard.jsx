import { Book, BookOpen, CalendarDays, ArrowRight } from "lucide-react";
import { useBooks } from "../../library/hooks/useBooks";
import { parseLocalDate } from "../../library/utils/dateUtils";
import { UtilityCard } from "./UtilityCard";

export function LibraryHomeCard() {
  const { data: books = [], isPending, isError, error } = useBooks();

  if (isPending) {
    return (
      <UtilityCard
        icon={Book}
        title="Library"
        description="Track books, reading metrics, and what to read next"
        badgeLabel="Live"
        to="/library/inventory"
        className="lg:col-span-2"
      >
        <div className="mt-4 space-y-3 animate-pulse">
          <div className="h-12 bg-slate-100 rounded-lg" />
          <div className="h-4 bg-slate-100 rounded w-3/4" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
        </div>
      </UtilityCard>
    );
  }

  if (isError) {
    return (
      <UtilityCard
        icon={Book}
        title="Library"
        description="Track books, reading metrics, and what to read next"
        badgeLabel="Live"
        to="/library/inventory"
        className="lg:col-span-2"
      >
        <p className="text-sm text-red-500 mt-4">
          Failed to load library data
          {error?.message ? `: ${error.message}` : "."}
        </p>
      </UtilityCard>
    );
  }

  const totalBooks = books.length;
  const booksRead = books.filter((b) => b.status === "READ").length;
  const currentlyReadingBooks = books.filter((b) => b.status === "IN_PROGRESS");
  const percentageComplete =
    totalBooks > 0 ? Math.round((booksRead / totalBooks) * 100) : 0;

  const currentYear = new Date().getFullYear();
  const finishedBooks = books.filter((b) => b.status === "READ" && b.endDate);
  const booksThisYear = finishedBooks.filter(
    (b) => parseLocalDate(b.endDate).getFullYear() === currentYear,
  );
  const pagesThisYear = booksThisYear.reduce((s, b) => s + (b.pages || 0), 0);
  const avgPagesThisYear =
    booksThisYear.length > 0
      ? Math.round(pagesThisYear / booksThisYear.length)
      : 0;

  return (
    <UtilityCard
      icon={Book}
      title="Library"
      description="Track books, reading metrics, and what to read next"
      badgeLabel="Live"
      to="/library/inventory"
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-4">
        <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
        All-Time
      </div>
      <div className="grid grid-cols-3 mt-4 text-center">
        <div>
          <div className="text-lg font-bold text-slate-800">{booksRead}</div>
          <div className="text-[11px] text-slate-400">Books Read</div>
        </div>
        <div>
          <div className="text-lg font-bold text-slate-800">{totalBooks}</div>
          <div className="text-[11px] text-slate-400">Total Books</div>
        </div>
        <div>
          <div className="text-lg font-bold text-slate-800">
            {percentageComplete}%
          </div>
          <div className="text-[11px] text-slate-400">Read</div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 mt-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-4">
          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
          {currentYear} so far
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-lg font-bold text-slate-800">
              {booksThisYear.length}
            </div>
            <div className="text-[11px] text-slate-400">Books read</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800">
              {pagesThisYear.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400">Pages read</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-800">
              {avgPagesThisYear}
            </div>
            <div className="text-[11px] text-slate-400">Avg pages/book</div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 mt-4 pb-4">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          Currently reading
        </div>
        {currentlyReadingBooks.length > 0 ? (
          <div className="space-y-4">
            {currentlyReadingBooks.slice(0, 4).map((book) => {
              const pctRaw = book.pages
                ? (book.currentPage / book.pages) * 100
                : 0;
              const pct = Math.min(100, Math.max(0, Math.round(pctRaw || 0)));
              const days = book.startDate
                ? Math.max(
                    0,
                    Math.floor(
                      (new Date() - new Date(`${book.startDate}T00:00:00`)) /
                        86400000,
                    ),
                  )
                : null;
              return (
                <div key={book.id}>
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
                    <span className="text-xs font-medium text-blue-600 flex-shrink-0">
                      {pct}%
                    </span>
                  </div>
                </div>
              );
            })}
            {currentlyReadingBooks.length > 4 && (
              <div className="text-xs text-slate-400">
                +{currentlyReadingBooks.length - 4} more in progress
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            Nothing in progress right now.
          </p>
        )}
      </div>

      <div className="flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all mt-auto pt-4 border-t border-slate-100">
        Open Library
        <ArrowRight className="w-4 h-4" />
      </div>
    </UtilityCard>
  );
}
