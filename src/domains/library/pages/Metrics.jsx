import { BooksPerYearComparison } from "../components/metrics/BooksPerYearComparison";
import { BooksPerYearGraph } from "../components/metrics/BooksPerYearGraph";
import { CurrentlyReading } from "../components/metrics/CurrentlyReading";
import { LoadingState } from "../../../components/LoadingState";
import { LoadError } from "../../../components/LoadError";
import { useBooks } from "../hooks";
import { useMemo, useState } from "react";
import { calculateMetrics } from "../utils/metricUtils";
import { BooksPerYearDetails } from "../components/metrics/BooksPerYearDetails";

export function Metrics() {
  const [selectedReadingYear, setSelectedReadingYear] = useState(null);
  const [graphMetric, setGraphMetric] = useState("books");
  const {
    data: books = [],
    isPending,
    isLoadingError,
    error,
    refetch,
    isFetching,
  } = useBooks();
  const metrics = useMemo(
    () => calculateMetrics(books, selectedReadingYear),
    [books, selectedReadingYear],
  );

  if (isPending) return <LoadingState what="metrics" />;
  if (isLoadingError) {
    return (
      <LoadError
        what="books"
        error={error}
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }

  return (
    <div className="space-y-4">
      <CurrentlyReading books={books} />
      <div className="grid grid-cols-4 gap-3">
        {[
          ["Books", metrics.allTimeBooks],
          ["Pages", metrics.allTimePages.toLocaleString()],
          [
            "Avg pages",
            metrics.allTimeBooks > 0
              ? Math.round(metrics.allTimePages / metrics.allTimeBooks)
              : 0,
          ],
          ["Avg rating", metrics.allTimeRating],
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
