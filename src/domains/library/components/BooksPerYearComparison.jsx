import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";

export const BooksPerYearComparison = ({
  metrics,
  selectedReadingYear,
  setSelectedReadingYear,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100">
        <h2 className="font-semibold text-slate-800 text-sm">
          Year comparison
        </h2>
      </div>
      <div className="divide-y divide-slate-100">
        {[...metrics.yearComparisons]
          .sort((a, b) => b.year - a.year)
          .map((yd) => {
            const isSel = selectedReadingYear === yd.year;
            const hasDiff = yd.booksDiff !== null;

            const trendMetric = (value, formatter, label) => {
              const isPositive = value > 0;
              const isNegative = value < 0;
              const Icon = isPositive
                ? ArrowUpRight
                : isNegative
                  ? ArrowDownRight
                  : ArrowRight;
              const tone = isPositive
                ? "text-green-600"
                : isNegative
                  ? "text-red-500"
                  : "text-slate-400";

              return (
                <div className="flex min-w-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5">
                  <Icon className={`w-3 h-3 flex-shrink-0 ${tone}`} />
                  <span className={`text-[10px] font-semibold ${tone}`}>
                    {formatter(value)}
                  </span>
                  <span className="text-[9px] uppercase tracking-[0.12em] text-slate-400">
                    {label}
                  </span>
                </div>
              );
            };

            return (
              <button
                key={yd.year}
                onClick={() => setSelectedReadingYear(isSel ? null : yd.year)}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${isSel ? "bg-blue-50" : "hover:bg-slate-50"}`}
              >
                <span
                  className={`text-sm font-bold w-10 flex-shrink-0 ${isSel ? "text-blue-600" : "text-slate-700"}`}
                >
                  {yd.year}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3">
                    <span className="text-sm font-semibold text-slate-800">
                      {yd.books} books
                    </span>
                    <span className="text-xs text-slate-400">
                      {yd.pages.toLocaleString()} pages
                    </span>
                  </div>
                  {hasDiff ? (
                    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                      {trendMetric(
                        yd.booksDiff,
                        (value) => `${value > 0 ? "+" : ""}${value}`,
                        "bk",
                      )}
                      {trendMetric(
                        yd.pagesDiff,
                        (value) =>
                          `${value > 0 ? "+" : ""}${value.toLocaleString()}`,
                        "pg",
                      )}
                      {yd.booksPercentChange !== null &&
                        trendMetric(
                          yd.booksPercentChange,
                          (value) => `${value > 0 ? "+" : ""}${value}`,
                          "%",
                        )}
                    </div>
                  ) : (
                    <div className="text-xs mt-1 text-slate-300">
                      No prior year
                    </div>
                  )}
                </div>
                <ChevronDown
                  className={`w-4 h-4 flex-shrink-0 transition-transform ${isSel ? "rotate-180 text-blue-500" : "-rotate-90 text-slate-300"}`}
                />
              </button>
            );
          })}
      </div>
    </div>
  );
};
