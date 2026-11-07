import { Link } from "react-router-dom";
import { DollarSign } from "lucide-react";
import { useNetWorthHistory } from "../../finance/hooks/useNetWorthHistory";
import { useTransactions } from "../../finance/hooks/useTransactions";
import { useMemo, useState, useEffect } from "react";
import { Currencyformatter } from "../../finance/utils/currency";
import { Graph } from "../../finance/components/Graph";

export function FinancesHomeCard() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const formatCurrency = (value) => {
    if (isMobile) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    }
    return Currencyformatter.format(value);
  };
  const {
    data: netWorthHistory = {},
    isPending,
    isError,
    error,
  } = useNetWorthHistory();

  const { data: transactions = [] } = useTransactions();
  const currentYear = new Date().getFullYear();

  // Get all entries for current year
  const entriesForYear = useMemo(() => {
    return Object.values(netWorthHistory)
      .filter((entry) => {
        const year = parseInt((entry?.date || "").split("-")[0]);
        return year === currentYear;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [netWorthHistory, currentYear]);

  // Get latest full month's entry (exclude current month)
  const latestFullMonthEntry = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;

    const fullMonthEntries = entriesForYear.filter((entry) => {
      const entryMonth = parseInt((entry?.date || "").split("-")[1]);
      return entryMonth !== currentMonth;
    });

    return fullMonthEntries.length > 0
      ? fullMonthEntries[fullMonthEntries.length - 1]
      : null;
  }, [entriesForYear]);

  // Get latest month's account breakdown
  const latestEntry = useMemo(() => {
    return entriesForYear.length > 0
      ? entriesForYear[entriesForYear.length - 1]
      : null;
  }, [entriesForYear]);

  // Calculate account changes
  const accountChanges = useMemo(() => {
    if (!latestEntry?.accounts || latestEntry.accounts.length === 0) {
      return [];
    }

    // Find the entry for the calendar month directly before latestEntry
    const [year, month] = latestEntry.date.split("-");
    const prevDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    prevDate.setMonth(prevDate.getMonth() - 1);

    const prevMonthDate = `${prevDate.getFullYear()}-${String(
      prevDate.getMonth() + 1,
    ).padStart(2, "0")}-01`;

    const prevEntry = Object.values(netWorthHistory).find(
      (entry) => entry.date === prevMonthDate,
    );

    return latestEntry.accounts
      .filter((account) => account.category !== "LIABILITY")
      .map((account) => {
        const accountKey = account.id || account.accountId;

        const prevAccount = prevEntry?.accounts?.find(
          (a) =>
            (a.id || a.accountId) === accountKey ||
            a.accountName === account.accountName,
        );

        if (!prevAccount) {
          return { ...account, change: null, percentChange: null };
        }

        const currentBalance = account.balance || 0;
        const prevBalance = prevAccount.balance || 0;
        const change = currentBalance - prevBalance;

        const percentChange =
          prevBalance !== 0 ? (change / prevBalance) * 100 : 0;

        return {
          ...account,
          change,
          percentChange,
        };
      });
  }, [latestEntry, netWorthHistory]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!latestFullMonthEntry) {
      return {
        netWorth: 0,
        dollarChange: 0,
        percentChange: 0,
        projectedNetWorth: 0,
        projectedPercentChange: 0,
      };
    }

    const netWorth = latestFullMonthEntry.netWorth;

    // Find previous year's end net worth for comparison
    const allEntries = Object.values(netWorthHistory).sort(
      (a, b) => new Date(a.date) - new Date(b.date),
    );

    const prevYearEndEntry = allEntries.find(
      (entry) => entry.date === `${currentYear - 1}-12-01`,
    );

    const prevYearEndNetWorth = prevYearEndEntry?.netWorth || netWorth;

    const dollarChange = netWorth - prevYearEndNetWorth;

    const percentChange =
      prevYearEndNetWorth !== 0
        ? (dollarChange / prevYearEndNetWorth) * 100
        : 0;

    // Calculate projected with unpaid income/expenses
    const baseNetWorth = latestEntry?.netWorth || netWorth;

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

    const projectedNetWorth = baseNetWorth + unpaidIncome - unpaidExpenses;

    const projectedPercentChange =
      netWorth !== 0 ? ((projectedNetWorth - netWorth) / netWorth) * 100 : 0;

    return {
      netWorth,
      dollarChange,
      percentChange,
      projectedNetWorth,
      projectedPercentChange,
    };
  }, [
    latestFullMonthEntry,
    latestEntry,
    netWorthHistory,
    transactions,
    currentYear,
  ]);

  if (isPending) {
    return (
      <Link
        to="/finances/dashboard"
        className="group bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col"
      >
        <div className="flex items-center mb-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50">
            <DollarSign className="w-[18px] h-[18px] text-blue-600" />
          </div>
          <h3 className="ml-3 text-base font-bold text-slate-800">Finances</h3>
        </div>

        <div className="mt-4 space-y-3 animate-pulse">
          <div className="h-48 bg-slate-100 rounded-lg" />
          <div className="h-4 bg-slate-100 rounded w-3/4" />
        </div>
      </Link>
    );
  }

  if (isError) {
    return (
      <Link
        to="/finances/dashboard"
        className="group bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col"
      >
        <div className="flex items-center mb-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50">
            <DollarSign className="w-[18px] h-[18px] text-blue-600" />
          </div>
          <h3 className="ml-3 text-base font-bold text-slate-800">Finances</h3>
        </div>

        <p className="text-sm text-red-500 mt-4">
          Failed to load finances data
          {error?.message ? `: ${error.message}` : "."}
        </p>
      </Link>
    );
  }

  const latestMonth = new Date().toLocaleString("default", {
    month: "long",
  });

  return (
    <Link
      to="/finances/dashboard"
      className="group bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col hover:border-blue-300 hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="flex items-center">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50">
          <DollarSign className="w-[18px] h-[18px] text-blue-600" />
        </div>

        <h3 className="ml-3 text-base font-bold text-slate-800">Finances</h3>

        <span className="text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full ml-auto text-green-600 bg-green-50">
          Live
        </span>
      </div>

      {/* Year Net Worth Header - Mobile Only */}
      <div className="md:hidden mt-3 mb-2">
        <div className="text-xs text-slate-500 font-semibold">
          {currentYear} Net Worth
        </div>
      </div>

      {/* Content: Graph left, Data right */}
      <div className="flex flex-col md:flex-row gap-3 flex-1 min-h-0">
        {/* Graph */}
        <div className="hidden md:block md:flex-1 md:min-w-0">
          <Graph
            years={[currentYear]}
            selectedYear={currentYear}
            onSelectYear={() => {}}
            flat
          />
        </div>

        {/* Data Sections */}
        <div className="flex-1 flex flex-col md:justify-start space-y-3">
          {/* Current Year Overview */}
          <div>
            <div className="hidden md:block text-xs text-slate-500 font-semibold mb-2">
              {currentYear} Net Worth
            </div>

            <div className="grid grid-cols-3 text-center md:divide-x divide-slate-100 gap-2">
              <div>
                <div className="text-base font-bold text-slate-800 tabular-nums">
                  {formatCurrency(stats.netWorth)}
                </div>
                <div className="text-[11px] text-slate-400">Net Worth</div>
              </div>

              <div>
                <div
                  className={`text-base font-bold tabular-nums ${
                    stats.dollarChange >= 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {`${stats.dollarChange >= 0 ? "+" : "-"}${formatCurrency(Math.abs(stats.dollarChange))}`}
                </div>
                <div className="text-[11px] text-slate-400">Change $</div>
              </div>

              <div>
                <div
                  className={`text-base font-bold tabular-nums ${
                    stats.percentChange >= 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {`${stats.percentChange >= 0 ? "+" : "-"}${Math.abs(stats.percentChange).toFixed(1)}%`}
                </div>
                <div className="text-[11px] text-slate-400">Change %</div>
              </div>
            </div>
          </div>

          {/* Projected Overview */}
          <div className="mt-0 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-500 font-semibold mb-2">
              Projected ({latestMonth})
            </div>

            <div className="grid grid-cols-3 text-center md:divide-x divide-slate-100 gap-2">
              <div>
                <div className="text-base font-bold text-slate-800 tabular-nums">
                  {formatCurrency(stats.projectedNetWorth)}
                </div>
                <div className="text-[11px] text-slate-400">Net Worth</div>
              </div>

              <div>
                <div
                  className={`text-base font-bold tabular-nums ${
                    stats.projectedNetWorth - stats.netWorth >= 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {`${stats.projectedNetWorth - stats.netWorth >= 0 ? "+" : "-"}${formatCurrency(Math.abs(stats.projectedNetWorth - stats.netWorth))}`}
                </div>
                <div className="text-[11px] text-slate-400">Change $</div>
              </div>

              <div>
                <div
                  className={`text-base font-bold tabular-nums ${
                    stats.projectedPercentChange >= 0
                      ? "text-emerald-600"
                      : "text-rose-600"
                  }`}
                >
                  {`${stats.projectedPercentChange >= 0 ? "+" : "-"}${Math.abs(stats.projectedPercentChange).toFixed(1)}%`}
                </div>
                <div className="text-[11px] text-slate-400">Change %</div>
              </div>
            </div>
          </div>

          {/* Account Breakdown */}
          {accountChanges && accountChanges.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="divide-y divide-slate-100">
                {accountChanges.map((account) => (
                  <div
                    key={account.id || account.accountId}
                    className="grid grid-cols-[0.8fr_1fr_1.4fr] items-center gap-3 py-2 text-sm last:pb-0"
                  >
                    {/* Account Name */}
                    <span className="text-slate-700 truncate text-left pr-2">
                      {account.accountName || "Unknown"}
                    </span>

                    {/* Balance */}
                    <div className="flex justify-end pr-2 min-w-0">
                      <span className="font-semibold text-slate-800 tabular-nums whitespace-nowrap">
                        {formatCurrency(account.balance || 0)}
                      </span>
                    </div>

                    {/* Change */}
                    <div className="flex justify-center min-w-0">
                      <div className="w-full max-w-[190px] flex justify-end items-center gap-1 tabular-nums whitespace-nowrap">
                        <span
                          className={`font-semibold ${
                            account.change === null || account.change === 0
                              ? "text-slate-400"
                              : account.change >= 0
                                ? "text-emerald-600"
                                : "text-rose-600"
                          }`}
                        >
                          {account.change === null || account.change === 0
                            ? "—"
                            : `${account.change >= 0 ? "+" : "-"}${formatCurrency(Math.abs(account.change))}`}
                        </span>

                        {account.percentChange !== null &&
                          account.percentChange !== 0 && (
                            <span
                              className={`font-semibold text-xs ${
                                account.percentChange >= 0
                                  ? "text-emerald-600"
                                  : "text-rose-600"
                              }`}
                            >
                              ({account.percentChange >= 0 ? "+" : "-"}
                              {Math.abs(account.percentChange).toFixed(1)}%)
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
