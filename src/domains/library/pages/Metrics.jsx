import { BooksPerYearComparison } from "../components/metrics/BooksPerYearComparison";
import { BooksPerYearGraph } from "../components/metrics/BooksPerYearGraph";
import { CurrentlyReading } from "../components/metrics/CurrentlyReading";
import { useBooks } from "../hooks/useBooks";
import { useMemo, useState } from "react";
import { BooksPerYearDetails } from "../components/metrics/BooksPerYearDetails";
import { parseLocalDate } from "../utils/dateUtils";

export default function Metrics() {
  const { data: books = [], isPending, isError, error } = useBooks();
  const [selectedReadingYear, setSelectedReadingYear] = useState(null);
  const [graphMetric, setGraphMetric] = useState("books");

  const metrics = useMemo(() => {
    const readBooks = books.filter((b) => b.status === "READ" && b.endDate);
    const byYear = {};
    readBooks.forEach((b) => {
      const y = parseLocalDate(b.endDate).getFullYear();
      if (!byYear[y]) byYear[y] = { books: 0, pages: 0 };
      byYear[y].books++;
      byYear[y].pages += b.pages || 0;
    });
    const allTimeBooks = readBooks.length;
    const allTimePages = readBooks.reduce((s, b) => s + (b.pages || 0), 0);
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
        booksDiff,
        pagesDiff,
        booksPercentChange,
        pagesPercentChange,
      };
    });
    const byMonth = {};
    const src = selectedReadingYear
      ? readBooks.filter(
          (b) =>
            parseLocalDate(b.endDate).getFullYear() === selectedReadingYear,
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
      availableYears,
      yearComparisons,
    };
  }, [books, selectedReadingYear]);

  if (isPending) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 py-14 text-center">
        <p className="text-sm text-slate-400">Loading metrics…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl border border-red-200 py-14 text-center">
        <p className="text-sm text-red-500">
          Failed to load books: {error?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CurrentlyReading books={books} />
      <div className="grid grid-cols-3 gap-3">
        {[
          ["Books read", metrics.allTimeBooks],
          ["Pages", metrics.allTimePages.toLocaleString()],
          [
            "Avg pages",
            metrics.allTimeBooks > 0
              ? Math.round(metrics.allTimePages / metrics.allTimeBooks)
              : 0,
          ],
        ].map(([label, val]) => (
          <div
            key={label}
            className="bg-white rounded-xl border border-slate-200 px-3 py-3 text-center shadow-sm"
          >
            <div className="text-xl font-bold text-slate-800">{val}</div>
            <div className="text-xs text-slate-400 mt-0.5">{label}</div>
          </div>
        ))}
      </div>
      <BooksPerYearGraph
        metrics={metrics}
        selectedReadingYear={selectedReadingYear}
        setSelectedReadingYear={setSelectedReadingYear}
        graphMetric={graphMetric}
        setGraphMetric={setGraphMetric}
      />
      <BooksPerYearComparison
        metrics={metrics}
        selectedReadingYear={selectedReadingYear}
        setSelectedReadingYear={setSelectedReadingYear}
      />
      {selectedReadingYear !== null && (
        <BooksPerYearDetails
          metrics={metrics}
          selectedReadingYear={selectedReadingYear}
          setSelectedReadingYear={setSelectedReadingYear}
          books={books}
        />
      )}
    </div>
  );
}
