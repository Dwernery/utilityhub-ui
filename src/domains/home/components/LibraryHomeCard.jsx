import { Book } from "lucide-react";
import { useBooks } from "../../library/hooks";
import { parseLocalDate } from "../../../lib/dates";
import { UtilityCard, UtilityCardSkeleton } from "./UtilityCard";
import { LoadError } from "../../../components/LoadError";
import { LibraryStatsSection } from "./LibraryStatsSection";
import { LibraryCurrentlyReading } from "./LibraryCurrentlyReading";

export function LibraryHomeCard() {
  const {
    data: books = [],
    isPending,
    isLoadingError,
    error,
    refetch,
    isFetching,
  } = useBooks();

  /* Stat Calculations */
  const finishedBooks = books.filter(
    (book) => book.status === "READ" && book.endDate,
  );
  const allTimeRatedBooks = finishedBooks.filter((book) => book.rating);
  const allTimePages = finishedBooks.reduce(
    (sum, book) => sum + (book.pages || 0),
    0,
  );
  const allTimeAvgRating =
    allTimeRatedBooks.length > 0
      ? (
          allTimeRatedBooks.reduce((sum, book) => sum + (book.rating || 0), 0) /
          allTimeRatedBooks.length
        ).toFixed(1)
      : 0;
  const thisYearBooks = finishedBooks.filter(
    (book) =>
      parseLocalDate(book.endDate).getFullYear() === new Date().getFullYear(),
  );
  const thisYearPages = thisYearBooks.reduce(
    (sum, book) => sum + (book.pages || 0),
    0,
  );
  const thisYearRatedBooks = thisYearBooks.filter((book) => book.rating);
  const thisYearAvgRating =
    thisYearRatedBooks.length > 0
      ? (
          thisYearRatedBooks.reduce(
            (sum, book) => sum + (book.rating || 0),
            0,
          ) / thisYearRatedBooks.length
        ).toFixed(1)
      : 0;

  if (isPending) {
    return (
      <UtilityCard icon={Book} title="Library" to="/library/inventory">
        <UtilityCardSkeleton />
      </UtilityCard>
    );
  }

  if (isLoadingError) {
    return (
      <UtilityCard
        icon={Book}
        title="Library"
        to="/library/inventory"
        linked={false}
      >
        <LoadError
          what="library"
          error={error}
          onRetry={() => refetch()}
          retrying={isFetching}
          card={false}
        />
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

      <div className="border-t border-slate-100 pt-2 mt-2">
        <LibraryStatsSection
          label={new Date().getFullYear()}
          booksRead={thisYearBooks.length}
          pages={thisYearPages}
          avgRating={thisYearAvgRating}
        />
      </div>

      <div className="border-t border-slate-100 pt-2 mt-2">
        <LibraryCurrentlyReading
          books={books.filter((book) => book.status === "IN_PROGRESS")}
        />
      </div>
    </UtilityCard>
  );
}
