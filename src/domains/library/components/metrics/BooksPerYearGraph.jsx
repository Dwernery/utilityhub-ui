export const BooksPerYearGraph = ({
  metrics,
  selectedReadingYear,
  setSelectedReadingYear,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-4 pt-4 pb-3">
      <h2 className="font-semibold text-slate-800 mb-3 text-sm">
        Books per year
      </h2>
      {(() => {
        const CHART_H = 96;
        const maxBooks = Math.max(...metrics.yearComparisons.map((y) => y.books),1);
        const sorted = [...metrics.yearComparisons].sort((a, b) => a.year - b.year);
        return (
          <div>
            <div
              className="flex items-end gap-1.5 mb-1"
              style={{ height: CHART_H }}
            >
              {sorted.map((yd) => {
                const barH = Math.max(Math.round((yd.books / maxBooks) * CHART_H),4);
                const isSel = selectedReadingYear === yd.year;
                return (
                  <button
                    key={yd.year}
                    onClick={() =>
                      setSelectedReadingYear(isSel ? null : yd.year)
                    }
                    className="flex-1 flex flex-col items-center justify-end gap-1 group h-full"
                  >
                    <span
                      className={`text-xs font-semibold leading-none ${isSel ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}
                    >
                      {yd.books}
                    </span>
                    <div
                      className={`w-full rounded-t transition-colors ${isSel ? "bg-blue-500" : "bg-blue-200 group-hover:bg-blue-400"}`}
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
                  className={`flex-1 text-center text-xs truncate transition-colors ${selectedReadingYear === yd.year ? "text-blue-600 font-semibold" : "text-slate-400"}`}
                >
                  {String(yd.year)}
                </button>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
