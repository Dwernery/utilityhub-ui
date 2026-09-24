import { UtilityCard } from "./UtilityCard";
import { DollarSign, TrendingUp } from "lucide-react";
import { useNetWorthHistory } from "../../finance/hooks/useNetWorthHistory";
import { useTransactions } from "../../finance/hooks/useTransactions";
import { FinancesCurrentYearOverviewSection } from "./FinancesCurrentYearOverviewSection";
import { useMemo } from "react";
import { Currencyformatter } from "../../finance/utils/currency";

export function FinancesHomeCard() {
  const {
    data: netWorthHistory = {},
    isPending,
    isError,
    error,
  } = useNetWorthHistory();

  const { data: transactions = [] } = useTransactions();

  const stats = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed

    // Filter out entries from the current month for "net worth" display
    const entriesForNetWorth = Object.values(netWorthHistory)
      .filter((entry) => {
        const entryYear = parseInt((entry?.date || "").split("-")[0]);
        const entryMonth = parseInt((entry?.date || "").split("-")[1]);
        return !(entryYear === currentYear && entryMonth === currentMonth);
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (entriesForNetWorth.length === 0) {
      return { netWorth: 0, dollarChange: 0, projectedNetWorth: 0 };
    }

    const netWorth = entriesForNetWorth[entriesForNetWorth.length - 1].netWorth;
    const prevYearEndNetWorth = entriesForNetWorth.find(
      (entry) => entry.date === `${new Date().getFullYear() - 1}-12-01`,
    ).netWorth;
    const dollarChange = netWorth - prevYearEndNetWorth;

    // Get current month net worth for projection baseline
    const allEntries = Object.values(netWorthHistory).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );
    const currentMonthEntries = allEntries.filter((entry) => {
      const entryYear = parseInt((entry?.date || "").split("-")[0]);
      const entryMonth = parseInt((entry?.date || "").split("-")[1]);
      return entryYear === currentYear && entryMonth === currentMonth;
    });

    const currentMonthNetWorth =
      currentMonthEntries.length > 0
        ? currentMonthEntries[currentMonthEntries.length - 1].netWorth
        : netWorth;

    // Calculate projected net worth including unpaid income/expenses
    let unpaidIncome = 0;
    let unpaidExpenses = 0;

    transactions.forEach((transaction) => {
      if (!transaction.paid) {
        if (transaction.transactionType === "INCOME") {
          unpaidIncome += transaction.amount;
        } else if (transaction.transactionType === "EXPENSE") {
          unpaidExpenses += transaction.amount;
        }
      }
    });

    const projectedNetWorth =
      currentMonthNetWorth + unpaidIncome - unpaidExpenses;

    return { netWorth, dollarChange, projectedNetWorth };
  }, [netWorthHistory, transactions]);

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

      <div className="border-t border-slate-100 pt-3 mt-3">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
            Projected ({new Date().toLocaleString("default", { month: "long" })}
            )
          </span>
        </div>

        <div className="grid grid-cols-2 text-center divide-x divide-slate-100">
          <div>
            <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-800">
              <span>{Currencyformatter.format(stats.projectedNetWorth)}</span>
            </div>
            <div className="text-[11px] text-slate-400">
              Net Worth
            </div>
          </div>

          <div>
            <div
              className={`flex items-center justify-center gap-1 text-lg font-bold ${
                stats.projectedNetWorth - stats.netWorth >= 0
                  ? "text-emerald-600"
                  : "text-rose-600"
              }`}
            >
              <span>
                {`${stats.projectedNetWorth - stats.netWorth >= 0 ? "+" : "-"}${Currencyformatter.format(Math.abs(stats.projectedNetWorth - stats.netWorth))}`}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">Change $</div>
          </div>
        </div>
      </div>
    </UtilityCard>
  );
}
