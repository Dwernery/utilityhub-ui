import { LoadingState } from "../../../components/LoadingState";
import { LoadError } from "../../../components/LoadError";
import { HeroCard } from "../components/HeroCard";
import { getYears } from "../utils/metrics";
import { useState, useMemo } from "react";
import { useNetWorthHistory } from "../hooks";
import { Graph } from "../components/Graph";
import { MonthlyTable } from "../components/MonthlyTable";
import { AccountsModal } from "../components/AccountsModal";

export function Dashboard() {
  const {
    data: netWorthHistory,
    isPending,
    isLoadingError,
    error,
    refetch,
    isFetching,
  } = useNetWorthHistory();

  const years = useMemo(() => getYears(netWorthHistory), [netWorthHistory]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [showAccounts, setShowAccounts] = useState(false);
  const activeYear = selectedYear ?? years?.[years.length - 1] ?? null;

  if (isPending) return <LoadingState what="net worth" />;
  if (isLoadingError) {
    return (
      <LoadError
        what="net worth history"
        error={error}
        onRetry={() => refetch()}
        retrying={isFetching}
      />
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:h-full lg:min-h-0 pb-16 md:pb-8 lg:pb-4">
      <div className="flex flex-col flex-1 min-w-0 gap-4 lg:min-h-0">
        <div className="flex-shrink-0">
          <HeroCard
            selectedYear={activeYear}
            onOpenAccounts={() => setShowAccounts(true)}
          />
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
      {showAccounts && <AccountsModal onClose={() => setShowAccounts(false)} />}
    </div>
  );
}
