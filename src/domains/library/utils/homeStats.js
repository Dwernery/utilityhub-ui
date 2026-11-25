import { parseLocalDate } from "../../../lib/dates";

/**
 * Numbers for the home page's Library card. Mirrors utility-hub-mobile's
 * lib/library/utils/homeStats.ts.
 *
 * - booksRead / pages: finished books (READ with an end date)
 * - avgRating: one-decimal string, or null when none of them is rated
 */
function summarize(books) {
  const rated = books.filter((book) => book.rating);
  return {
    booksRead: books.length,
    pages: books.reduce((sum, book) => sum + (book.pages || 0), 0),
    avgRating:
      rated.length > 0
        ? (
            rated.reduce((sum, book) => sum + book.rating, 0) / rated.length
          ).toFixed(1)
        : null,
  };
}

/** All-time and this year's reading stats, plus the books in progress. */
export function libraryHomeStats(books, year = new Date().getFullYear()) {
  const finished = books.filter(
    (book) => book.status === "READ" && book.endDate,
  );
  const thisYear = finished.filter(
    (book) => parseLocalDate(book.endDate)?.getFullYear() === year,
  );
  return {
    allTime: summarize(finished),
    thisYear: summarize(thisYear),
    inProgress: books.filter((book) => book.status === "IN_PROGRESS"),
  };
}
