import { daysBetween, parseLocalDate, todayIso } from "../../../lib/dates";
import { byInventoryOrder } from "./series";

export const filterBooks = (books, normalizedSearch, statusFilter) => {
  const filteredBooks = books.filter((book) => {
    const title = String(book?.title ?? "").toLowerCase();
    const authorName = String(book?.authorName ?? "").toLowerCase();
    const series = String(book?.seriesName ?? "").toLowerCase();

    const matchesSearch =
      !normalizedSearch ||
      title.includes(normalizedSearch) ||
      authorName.includes(normalizedSearch) ||
      series.includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "ALL" || book.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  return filteredBooks;
};

/** Group books by author, authors A–Z; each author's books with each series together (see byInventoryOrder). */
export const groupBooks = (filteredBooks) => {
  const groups = {};
  filteredBooks.forEach((book) => {
    const authorName = book.authorName || "Unknown";
    groups[authorName] ??= [];
    groups[authorName].push(book);
  });

  return Object.fromEntries(
    Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([author, list]) => [author, list.sort(byInventoryOrder)]),
  );
};

export const calculateMetrics = (books, selectedReadingYear) => {
  const readBooks = books.filter((b) => b.status === "READ" && b.endDate);
  const byYear = {};
  readBooks.forEach((b) => {
    const y = parseLocalDate(b.endDate).getFullYear();
    if (!byYear[y])
      byYear[y] = { books: 0, pages: 0, rating: 0, ratingCount: 0 };
    byYear[y].books++;
    byYear[y].pages += b.pages || 0;
    if (b.rating) {
      byYear[y].rating += b.rating;
      byYear[y].ratingCount++;
    }
  });
  const allTimeBooks = readBooks.length;
  const allTimePages = readBooks.reduce((s, b) => s + (b.pages || 0), 0);
  const allTimeRatingSum = readBooks.reduce((s, b) => s + (b.rating || 0), 0);
  const allTimeRatingCount = readBooks.filter((b) => b.rating).length;
  const allTimeRating =
    allTimeRatingCount > 0
      ? (allTimeRatingSum / allTimeRatingCount).toFixed(1)
      : 0;
  const availableYears = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => b - a);
  const yearComparisons = availableYears.map((year, i) => {
    const curr = byYear[year];
    const prev = availableYears[i + 1] ? byYear[availableYears[i + 1]] : null;
    const booksDiff = prev !== null ? curr.books - prev.books : null;
    const pagesDiff = prev !== null ? curr.pages - prev.pages : null;
    const booksPercentChange =
      prev && prev.books > 0 ? (booksDiff / prev.books) * 100 : null;
    const pagesPercentChange =
      prev && prev.pages > 0 ? (pagesDiff / prev.pages) * 100 : null;

    return {
      year,
      books: curr.books,
      pages: curr.pages,
      rating: curr.rating,
      ratingCount: curr.ratingCount,
      booksDiff,
      pagesDiff,
      booksPercentChange,
      pagesPercentChange,
    };
  });
  const byMonth = {};
  const src = selectedReadingYear
    ? readBooks.filter(
        (b) => parseLocalDate(b.endDate).getFullYear() === selectedReadingYear,
      )
    : readBooks;
  src.forEach((b) => {
    const m = parseLocalDate(b.endDate).getMonth();
    if (!byMonth[m]) byMonth[m] = { books: 0, pages: 0 };
    byMonth[m].books++;
    byMonth[m].pages += b.pages || 0;
  });
  return {
    byYear,
    byMonth,
    allTimeBooks,
    allTimePages,
    allTimeRating,
    availableYears,
    yearComparisons,
  };
};

/** Percent through a book (0–100) and whole days since starting, for "currently reading" rows. */
export const readingProgress = (book, today = todayIso()) => {
  const raw = ((book.currentPage ?? 0) / (book.pages || 0)) * 100;
  const pct = Math.min(
    100,
    Math.max(0, Math.round(Number.isFinite(raw) ? raw : 0)),
  );
  const days = book.startDate
    ? Math.max(0, daysBetween(book.startDate, today))
    : null;
  return { pct, days };
};
