import { useMemo } from "react";

export const RandomCategories = ({ category, setCategory, counts }) => {
  const categoryDefs = useMemo(
    () => [
      { id: "standalone", label: "Standalones", sub: null },
      { id: "short", label: "Short series", sub: "2–3 books" },
      { id: "long", label: "Long series", sub: "4+ books" },
    ],
    [],
  );

  return (
    <div className="grid grid-cols-3 gap-2">
      {categoryDefs.map(({ id, label, sub }) => (
        <button
          key={id}
          onClick={() => setCategory(id)}
          className={`rounded-xl border py-3 px-2 text-center transition-all duration-150 ${
            category === id
              ? "border-blue-400 bg-blue-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <div
            className={`text-2xl font-bold ${category === id ? "text-blue-600" : "text-slate-700"}`}
          >
            {counts[id]}
          </div>
          <div
            className={`text-xs font-medium mt-0.5 ${category === id ? "text-blue-700" : "text-slate-500"}`}
          >
            {label}
          </div>
          {sub && <div className="text-xs text-slate-400">{sub}</div>}
        </button>
      ))}
    </div>
  );
};
