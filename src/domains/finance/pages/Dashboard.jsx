import { HeroCard } from "../components/HeroCard";
import { getYears } from "../utils/metrics.js";
import { useState, useMemo } from "react";
import { useNetWorthHistory } from "../hooks/useNetWorthHistory";
import { Graph } from "../components/Graph.jsx";
import { MonthlyTable } from "../components/MonthlyTable.jsx";

export function Dashboard() {
  let { data: netWorthHistory, isLoading } = useNetWorthHistory();

  const years = useMemo(() => getYears(netWorthHistory), [netWorthHistory]);
  const [selectedYear, setSelectedYear] = useState(null);
  const activeYear = selectedYear ?? years?.[years.length - 1] ?? null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">Loading...</div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4 items-start">
        <HeroCard />
        <div className="lg:col-span-2">
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
            {years?.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-5 py-1.5 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${activeYear === year ? "bg-blue-600 text-white shadow-lg" : "bg-white text-slate-700 hover:bg-slate-50 shadow-md border border-slate-200 hover:cursor-pointer"}`}
              >
                {year}
              </button>
            ))}
          </div>
          <Graph selectedYear={activeYear} />
        </div>
      </div>
      <MonthlyTable selectedYear={activeYear} />
    </div>
  );
}
