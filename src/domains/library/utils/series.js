// A book's place in its series. Mirrors utility-hub-mobile's lib/library/utils/series.ts.

/** "Mistborn #2", or just "Mistborn" without a number; null without a series. */
export function seriesLabel(book) {
  if (!book.seriesName) return null;
  return book.seriesPosition
    ? `${book.seriesName} #${book.seriesPosition}`
    : book.seriesName;
}

/** Series order: by number, then books without one in the order they were added. */
export function bySeriesOrder(a, b) {
  const pa = a.seriesPosition ?? Infinity;
  const pb = b.seriesPosition ?? Infinity;
  return pa !== pb ? pa - pb : Number(a.id) - Number(b.id);
}

/**
 * An author's books in Inventory: each series together (series A–Z, books in series order), then
 * standalone books A–Z by title.
 */
export function byInventoryOrder(a, b) {
  if (!!a.seriesName !== !!b.seriesName) return a.seriesName ? -1 : 1;
  if (a.seriesName && b.seriesName) {
    const bySeries = a.seriesName.localeCompare(b.seriesName);
    return bySeries !== 0 ? bySeries : bySeriesOrder(a, b);
  }
  return a.title.localeCompare(b.title);
}

/** The number a new book would get at the end of `series`: one past the highest so far. */
export function nextSeriesPosition(books, series) {
  const used = books
    .filter((b) => b.seriesName === series)
    .map((b) => b.seriesPosition ?? 0);
  return Math.min(999, Math.max(0, ...used) + 1);
}

/** The form's "Book #" text → the API value: '' is none; otherwise a whole number 1–999, or "invalid". */
export function parseSeriesPosition(text) {
  const t = String(text ?? "").trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isInteger(n) && n >= 1 && n <= 999 ? n : "invalid";
}
