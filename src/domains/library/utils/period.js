// Metrics "period": all time or one year, and how a year compares with the one before.
// Mirrors utility-hub-mobile's lib/library/utils/period.ts.
import { isoYear, todayIso } from "../../../lib/dates";

const finished = (books) =>
  books.filter((b) => b.status === "READ" && b.endDate);

/** Years with finished books, newest first, always including this year (for the picker). */
export function periodYears(books, today = todayIso()) {
  const years = new Set(finished(books).map((b) => isoYear(b.endDate)));
  years.add(isoYear(today));
  return [...years].sort((a, b) => b - a);
}

const round1 = (n) => Math.round(n * 10) / 10;

function summarize(list) {
  const pages = list.reduce((s, b) => s + (b.pages || 0), 0);
  const rated = list.filter((b) => b.rating);
  return {
    books: list.length,
    pages,
    avgPages: list.length ? Math.round(pages / list.length) : null,
    avgRating: rated.length
      ? round1(rated.reduce((s, b) => s + b.rating, 0) / rated.length)
      : null,
  };
}

const diff = (a, b) => (a == null || b == null ? null : a - b);

/**
 * Books, pages, average pages and average rating for all time (`year` null) or one year.
 * A year also gets `vs`, the change from the year before. For the current
 * year that's the year before up to the same date, so a year in
 * progress isn't measured against a whole one. `vs` is null when the year before has no
 * finished books.
 */
export function periodStats(books, year, today = todayIso()) {
  const done = finished(books);
  if (year == null) return { ...summarize(done), vs: null };

  const stats = summarize(done.filter((b) => isoYear(b.endDate) === year));
  const prevYear = year - 1;
  const prevAll = done.filter((b) => isoYear(b.endDate) === prevYear);
  if (prevAll.length === 0) return { ...stats, vs: null };

  const toDate = year === isoYear(today);
  const cutoff = `${prevYear}${today.slice(4)}`; // same month and day, last year
  const prev = summarize(
    toDate ? prevAll.filter((b) => b.endDate <= cutoff) : prevAll,
  );
  const ratingDiff = diff(stats.avgRating, prev.avgRating);
  return {
    ...stats,
    vs: {
      books: stats.books - prev.books,
      pages: stats.pages - prev.pages,
      avgPages: diff(stats.avgPages, prev.avgPages),
      avgRating: ratingDiff == null ? null : round1(ratingDiff),
    },
  };
}

/** A tile's change: "+3", "−900", "+0.1", "same"; null when there's nothing to compare. */
export function formatDelta(n, decimals = 0) {
  if (n == null) return null;
  if (n === 0) return "same";
  const abs = Math.abs(n).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${n > 0 ? "+" : "−"}${abs}`;
}
