import { HeroCard } from "../components/HeroCard";
import { MonthlyDetailModal } from "../components/MonthlyDetailModal.jsx";
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
        <HeroCard selectedYear={activeYear} />
        <div className="lg:col-span-2">
          <Graph
            years={years}
            selectedYear={activeYear}
            onSelectYear={setSelectedYear}
          />
        </div>
      </div>
      <MonthlyTable
        selectedYear={activeYear}

      />

    </div>
  );
}
