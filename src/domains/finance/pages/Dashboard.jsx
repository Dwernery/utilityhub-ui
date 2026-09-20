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
    <div className="flex flex-col lg:flex-row gap-4 lg:h-full lg:min-h-0">
      <div className="flex flex-col flex-1 min-w-0 gap-4 lg:min-h-0">
        <div className="flex-shrink-0">
          <HeroCard selectedYear={activeYear} />
        </div>
        <div className="h-64 sm:h-80 lg:h-auto lg:flex-1 lg:min-h-0">
          <Graph
            years={years}
            selectedYear={activeYear}
            onSelectYear={setSelectedYear}
          />
        </div>
      </div>
      <div className="w-full lg:w-[28rem] flex-shrink-0">
        <MonthlyTable selectedYear={activeYear} />
      </div>
    </div>
  );
}
