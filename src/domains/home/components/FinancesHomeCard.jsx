import { UtilityCard } from "./UtilityCard";
import { DollarSign } from "lucide-react";
import { useNetWorthHistory } from "../../finance/hooks/useNetWorthHistory";
import { FinancesCurrentYearOverviewSection } from "./FinancesCurrentYearOverviewSection";
import { useMemo } from "react";

export function FinancesHomeCard() {
  const { data: netWorthHistory = {}, isPending, isError, error} = useNetWorthHistory();

  const stats = useMemo(() => {
    const entries = Object.values(netWorthHistory).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );

    if (entries.length === 0) {
      return {netWorth: 0, dollarChange: 0 }
    };

    const netWorth =  entries[entries.length - 1].netWorth;
    const prevYearEndNetWorth = entries.find((entry) => entry.date === `${new Date().getFullYear() - 1}-12-01`).netWorth;
    const dollarChange = netWorth - prevYearEndNetWorth;

    return { netWorth, dollarChange }
  }, [netWorthHistory]);

  if (isPending) {
    return (
      <UtilityCard icon={DollarSign} title="Finances" to="/finances/dashboard">
        <div className="mt-4 space-y-3 animate-pulse">
          <div className="h-12 bg-slate-100 rounded-lg" />
          <div className="h-4 bg-slate-100 rounded w-3/4" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
          <div className="h-4 bg-slate-100 rounded w-2/3" />
        </div>
      </UtilityCard>
    );
  }

  if (isError) {
    return (
      <UtilityCard icon={DollarSign} title="Finances" to="/finances/dashboard">
        <p className="text-sm text-red-500 mt-4">
          Failed to load finances data
          {error?.message ? `: ${error.message}` : "."}
        </p>
      </UtilityCard>
    );
  }

  return (
    <UtilityCard icon={DollarSign} title="Finances" to="/finances/dashboard">
      <FinancesCurrentYearOverviewSection
        currentNetWorth={stats.netWorth}
        dollarChange={stats.dollarChange}
      />

      {/* <div className="border-t border-slate-100 pt-3 mt-3">
        <FinancesCurrentMonthSection
          monthName={stats.currentMonth.name}
          dollarChange={stats.currentMonth.dollarChange}
          percentChange={stats.currentMonth.percentChange}
        />
      </div> */}

      {/* <div className="border-t border-slate-100 pt-3 mt-3">
        <FinancesPercentStatsSection
          label="Monthly Budget"
          yoyPercent={0}
          monthlyPercent={0}
        />
      </div> */}
    </UtilityCard>
  );
}
