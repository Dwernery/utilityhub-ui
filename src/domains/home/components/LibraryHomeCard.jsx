import { Book } from "lucide-react";
import { useBooks } from "../../library/hooks/useBooks";
import { parseLocalDate } from "../../library/utils/dateUtils";
import { UtilityCard } from "./UtilityCard";
import { LibraryStatsSection } from "./LibraryStatsSection";
import { LibraryCurrentlyReading } from "./LibraryCurrentlyReading";

export function LibraryHomeCard() {
  const { data: books = [], isPending, isError, error } = useBooks();

  /* Stat Calculations */
  const finishedBooks = books.filter((book) => book.status === "READ" && book.endDate);
  const allTimeRatedBooks = finishedBooks.filter((book) => book.rating);
  const allTimePages = finishedBooks.reduce((sum, book) => sum + (book.pages || 0), 0);
  const allTimeAvgRating = allTimeRatedBooks.length > 0 ? (allTimeRatedBooks.reduce((sum, book) => sum + (book.rating || 0), 0) / allTimeRatedBooks.length).toFixed(1): 0;
  const thisYearBooks = finishedBooks.filter((book) => parseLocalDate(book.endDate).getFullYear() === new Date().getFullYear());
  const thisYearPages = thisYearBooks.reduce((sum, book) => sum + (book.pages || 0),0);
  const thisYearRatedBooks = thisYearBooks.filter((book) => book.rating);
  const thisYearAvgRating = thisYearRatedBooks.length > 0 ? (thisYearRatedBooks.reduce((sum, book) => sum + (book.rating || 0),0) / thisYearRatedBooks.length).toFixed(1): 0;

  if (isPending) {
    return (
      <UtilityCard icon={Book} title="Library" to="/library/inventory">
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
      <UtilityCard icon={Book} title="Library" to="/library/inventory">
        <p className="text-sm text-red-500 mt-4">
          Failed to load library data
          {error?.message ? `: ${error.message}` : "."}
        </p>
      </UtilityCard>
    );
  }

  return (
    <UtilityCard icon={Book} title="Library" to="/library/inventory">
      <LibraryStatsSection
        label="All-Time"
        booksRead={finishedBooks.length}
        pages={allTimePages}
        avgRating={allTimeAvgRating}
      />

      <div className="border-t border-slate-100 pt-3 mt-3">
        <LibraryStatsSection
          label={new Date().getFullYear()}
          booksRead={thisYearBooks.length}
          pages={thisYearPages}
          avgRating={thisYearAvgRating}
        />
      </div>

      <div className="border-t border-slate-100 pt-3 mt-3">
        <LibraryCurrentlyReading books={books.filter((book) => book.status === "IN_PROGRESS")} />
      </div>
    </UtilityCard>
  );
}
