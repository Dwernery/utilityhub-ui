import { Book, BookOpen, CalendarDays, Star } from "lucide-react";
import { useBooks } from "../../library/hooks/useBooks";
import { parseLocalDate } from "../../library/utils/dateUtils";
import { UtilityCard } from "./UtilityCard";
import BookCover from "../../library/components/BookCover";

function LibraryStatsSection({
  label,
  booksRead,
  totalBooks,
  pages,
  avgRating,
  showProgress = false,
}) {
  const pct = totalBooks > 0 ? Math.round((booksRead / totalBooks) * 100) : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1 font-semibold">
          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
          {label}
        </span>

        {showProgress && (
          <span className="text-xs text-slate-400">
            {booksRead}/{totalBooks} ·{" "}
            <span className="font-semibold">{pct}%</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 text-center divide-x divide-slate-100">
        <div>
          <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-800">
            <Book className="w-3.5 h-3.5 text-slate-400" />
            {booksRead}
          </div>
          <div className="text-[11px] text-slate-400">Books</div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-800">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            {pages.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">Pages</div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-800">
            <Star className="w-3.5 h-3.5 text-slate-400" />
            {avgRating}
          </div>
          <div className="text-[11px] text-slate-400">Avg Rating</div>
        </div>
      </div>
    </div>
  );
}

function CurrentlyReadingSection({ books }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3">
        <BookOpen className="w-3.5 h-3.5 text-slate-400" />
        Currently reading
      </div>

      {books.length > 0 ? (
        <div className="space-y-3">
          {books.slice(0, 4).map((book) => {
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

                    <span className="text-xs font-medium text-blue-600 flex-shrink-0">
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

export function LibraryHomeCard() {
  const { data: books = [], isPending, isError, error } = useBooks();

  if (isPending) {
    return (
      <UtilityCard
        icon={Book}
        title="Library"
        badgeLabel="Live"
        to="/library/inventory"
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
        badgeLabel="Live"
        to="/library/inventory"
      >
        <p className="text-sm text-red-500 mt-4">
          Failed to load library data
          {error?.message ? `: ${error.message}` : "."}
        </p>
      </UtilityCard>
    );
  }

  const currentlyReadingBooks = books.filter(
    (book) => book.status === "IN_PROGRESS",
  );

  const finishedBooks = books.filter(
    (book) => book.status === "READ" && book.endDate,
  );

  // All-Time
  const allTimeBooksRead = finishedBooks.length;

  const allTimePages = finishedBooks.reduce(
    (sum, book) => sum + (book.pages || 0),
    0,
  );

  const allTimeRatedBooks = finishedBooks.filter((book) => book.rating);

  const allTimeAvgRating =
    allTimeRatedBooks.length > 0
      ? (
          allTimeRatedBooks.reduce((sum, book) => sum + (book.rating || 0), 0) /
          allTimeRatedBooks.length
        ).toFixed(1)
      : 0;

  // Current Year
  const currentYear = new Date().getFullYear();

  const booksThisYear = finishedBooks.filter(
    (book) => parseLocalDate(book.endDate).getFullYear() === currentYear,
  );

  const pagesThisYear = booksThisYear.reduce(
    (sum, book) => sum + (book.pages || 0),
    0,
  );

  const thisYearRatedBooks = booksThisYear.filter((book) => book.rating);

  const thisYearAvgRating =
    thisYearRatedBooks.length > 0
      ? (
          thisYearRatedBooks.reduce(
            (sum, book) => sum + (book.rating || 0),
            0,
          ) / thisYearRatedBooks.length
        ).toFixed(1)
      : 0;

  return (
    <UtilityCard
      icon={Book}
      title="Library"
      badgeLabel="Live"
      to="/library/inventory"
    >
      <LibraryStatsSection
        label="All-Time"
        booksRead={allTimeBooksRead}
        totalBooks={books.length}
        pages={allTimePages}
        avgRating={allTimeAvgRating}
        showProgress
      />

      <div className="border-t border-slate-100 pt-3 mt-3">
        <LibraryStatsSection
          label={currentYear}
          booksRead={booksThisYear.length}
          totalBooks={booksThisYear.length}
          pages={pagesThisYear}
          avgRating={thisYearAvgRating}
        />
      </div>

      <div className="border-t border-slate-100 pt-3 mt-3">
        <CurrentlyReadingSection books={currentlyReadingBooks} />
      </div>
    </UtilityCard>
  );
}
