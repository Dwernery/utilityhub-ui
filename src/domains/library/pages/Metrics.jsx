import { BooksPerYearGraph } from "../components/metrics/BooksPerYearGraph";
import { CurrentlyReading } from "../components/metrics/CurrentlyReading";
import { GoalCard } from "../components/metrics/GoalCard";
import { LoadingState } from "../../../components/LoadingState";
import { LoadError } from "../../../components/LoadError";
import { useBooks } from "../hooks";
import { useMemo, useState } from "react";
import { calculateMetrics } from "../utils/metricUtils";
import { BooksPerYearDetails } from "../components/metrics/BooksPerYearDetails";
import { PeriodPicker } from "../components/metrics/PeriodPicker";
import { formatDelta, periodStats, periodYears } from "../utils/period";

export function Metrics() {
  // What the stats below "now" describe: all time (null) or one year.
  const [period, setPeriod] = useState(null);
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
    () => calculateMetrics(books, period),
    [books, period],
  );
  const years = useMemo(() => periodYears(books), [books]);
  const stats = useMemo(() => periodStats(books, period), [books, period]);

  const thisYear = new Date().getFullYear();

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
      {/* md+: on the same 4-column grid (and gap) as the stat tiles, so the edges line up:
          Currently Reading spans 3 tiles, the goal 1. Currently Reading takes the whole row
          if the goal isn't shown. Narrower: stacked. Like the iPhone app's 700pt layout. */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-3 md:last:col-span-4 min-w-0">
          <CurrentlyReading books={books} className="h-full" />
        </div>
        <GoalCard
          year={thisYear}
          done={metrics.byYear[thisYear]?.books ?? 0}
          className="min-w-0"
        />
      </div>
      {/* Everything below follows the picker: the tiles describe the period, then all time
          shows the per-year chart (click a bar to pick that year) and a year shows its months
          and books. Mirrors the iPhone app. */}
      <section aria-label="Reading stats" className="space-y-3">
        {/* A line separates "now" (above) from the history the picker drives (below). */}
        <hr className="border-slate-200" />

        <PeriodPicker years={years} value={period} onChange={setPeriod} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile
            label="Books"
            value={stats.books}
            change={stats.vs?.books}
          />
          <StatTile
            label="Pages"
            value={stats.pages.toLocaleString()}
            change={stats.vs?.pages}
          />
          <StatTile
            label="Avg pages"
            value={stats.avgPages ?? "—"}
            change={stats.vs?.avgPages}
            neutral
          />
          <StatTile
            label="Avg rating"
            value={stats.avgRating != null ? stats.avgRating.toFixed(1) : "—"}
            change={stats.vs?.avgRating}
            decimals={1}
          />
        </div>
        {period == null ? (
          <BooksPerYearGraph
            metrics={metrics}
            selectedReadingYear={null}
            setSelectedReadingYear={setPeriod}
            graphMetric={graphMetric}
            setGraphMetric={setGraphMetric}
          />
        ) : (
          <BooksPerYearDetails
            metrics={metrics}
            selectedReadingYear={period}
            books={books}
          />
        )}
      </section>
    </div>
  );
}

/**
 * One stat for the picked period, with its change from the year before when there is one.
 * Up is green and down is red, except for `neutral` stats (longer books aren't better).
 */
function StatTile({ label, value, change, decimals = 0, neutral = false }) {
  const delta = formatDelta(change ?? null, decimals);
  const tone =
    change == null || change === 0 || neutral
      ? "text-slate-400"
      : change > 0
        ? "text-green-600"
        : "text-red-500";
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-3 py-3 text-center shadow-sm">
      <div className="text-xl font-bold text-slate-800 tabular-nums">
        {value}
      </div>
      <div className="text-xs text-slate-400 mt-0.5">{label}</div>
      {delta && (
        <div className={`text-xs font-medium tabular-nums mt-1 ${tone}`}>
          {delta}
        </div>
      )}
    </div>
  );
}
