export const BooksPerYearGraph = ({
  metrics,
  selectedReadingYear,
  setSelectedReadingYear,
  graphMetric,
  setGraphMetric,
}) => {
  const metricConfig = {
    books: {
      label: "Books per year",
      shortLabel: "Books",
      value: (yd) => yd.books,
      format: (n) => n,
    },
    pages: {
      label: "Pages per year",
      shortLabel: "Pages",
      value: (yd) => yd.pages,
      format: (n) => n.toLocaleString(),
    },
    rating: {
      label: "Avg rating per year",
      shortLabel: "Ratings",
      value: (yd) =>
        yd.ratingCount > 0 ? (yd.rating / yd.ratingCount).toFixed(1) : 0,
      format: (n) => n,
    },
  };

  const activeMetric = metricConfig[graphMetric] ?? metricConfig.books;
  const sorted = [...metrics.yearComparisons].sort((a, b) => a.year - b.year);
  const maxValue = Math.max(...sorted.map((y) => activeMetric.value(y)), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-4 pt-4 pb-3">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="font-semibold text-slate-800 text-sm">
          {activeMetric.label}
        </h2>
        <div className="inline-flex rounded-full bg-slate-100 p-0.5">
          {Object.entries(metricConfig).map(([key, config]) => {
            const isActive = graphMetric === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setGraphMetric(key)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  isActive
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {config.shortLabel}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="flex items-end gap-1.5 mb-1" style={{ height: 96 }}>
          {sorted.map((yd) => {
            const value = activeMetric.value(yd);
            const barH = Math.max(Math.round((value / maxValue) * 96), 4);
            const isSel = selectedReadingYear === yd.year;
            return (
              <button
                key={yd.year}
                onClick={() => setSelectedReadingYear(isSel ? null : yd.year)}
                className="flex-1 flex flex-col items-center justify-end gap-1 group h-full"
              >
                <span
                  className={`text-xs font-semibold leading-none ${
                    isSel
                      ? "text-blue-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                >
                  {activeMetric.format(value)}
                </span>
                <div
                  className={`w-full rounded-t transition-colors ${
                    isSel
                      ? "bg-blue-500"
                      : "bg-blue-200 group-hover:bg-blue-400"
                  }`}
                  style={{ height: barH }}
                />
              </button>
            );
          })}
        </div>
        <div className="flex gap-1.5">
          {sorted.map((yd) => (
            <button
              key={yd.year}
              onClick={() =>
                setSelectedReadingYear(
                  selectedReadingYear === yd.year ? null : yd.year,
                )
              }
              className={`flex-1 text-center text-xs truncate transition-colors ${
                selectedReadingYear === yd.year
                  ? "text-blue-600 font-semibold"
                  : "text-slate-400"
              }`}
            >
              {String(yd.year)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
