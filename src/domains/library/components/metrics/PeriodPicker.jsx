/** "All time | 2026 | 2025 | …" pills that pick what the Metrics stats below describe (null = all time). */
export function PeriodPicker({ years, value, onChange }) {
  const options = [
    { key: "all", label: "All time", year: null },
    ...years.map((y) => ({ key: String(y), label: String(y), year: y })),
  ];
  return (
    <div
      role="tablist"
      aria-label="Period"
      className="flex gap-2 overflow-x-auto pb-0.5"
    >
      {options.map((o) => {
        const selected = o.year === value;
        return (
          <button
            key={o.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(o.year)}
            className={`shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium tabular-nums transition-colors cursor-pointer ${
              selected
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
