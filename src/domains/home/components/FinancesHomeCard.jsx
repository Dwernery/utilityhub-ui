import { DollarSign } from "lucide-react";
import { useNetWorthHistory, useTransactions } from "../../finance/hooks";
import { lazy, Suspense, useMemo } from "react";
import { currencyFormatter } from "../../finance/utils/currency";
import { financeHomeSummary } from "../../finance/utils/homeSummary";
import { MONTH_LABELS } from "../../finance/utils/metrics";
import { isoMonth, previousMonthIso, todayIso } from "../../../lib/dates";
import { BREAKPOINTS, useMediaQuery } from "../../../lib/useMediaQuery";
import { LoadError } from "../../../components/LoadError";
import { RefreshNotice, UtilityCard } from "./UtilityCard";

// The chart library is ~45% of the app's code; load it only where the graph shows.
const Graph = lazy(() =>
  import("../../finance/components/Graph").then((m) => ({ default: m.Graph })),
);

// Phones drop the cents so the three-column stat rows fit.
const wholeDollarFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function FinancesHomeCard() {
  const isDesktop = useMediaQuery(BREAKPOINTS.md);
  const formatCurrency = (value) =>
    (isDesktop ? currencyFormatter : wholeDollarFormatter).format(value);

  const {
    data: netWorthHistory,
    isPending,
    isLoadingError,
    isRefetchError,
    error,
    refetch,
    isFetching,
  } = useNetWorthHistory();
  const transactionsQuery = useTransactions();
  const transactions = transactionsQuery.data;
  // Projected needs the unpaid transactions: hold it back until they load.
  const projectedPending = transactionsQuery.isPending;
  const projectedFailed = transactionsQuery.isLoadingError;
  const currentYear = new Date().getFullYear();
  const stats = useMemo(
    () => financeHomeSummary(netWorthHistory, transactions),
    [netWorthHistory, transactions],
  );

  if (isPending) {
    return (
      <UtilityCard icon={DollarSign} title="Finances" to="/finances/dashboard">
        <div className="space-y-3 animate-pulse" role="status">
          <div className="h-48 bg-slate-100 rounded-lg" />
          <div className="h-4 bg-slate-100 rounded w-3/4" />
        </div>
      </UtilityCard>
    );
  }

  if (isLoadingError) {
    return (
      <UtilityCard
        icon={DollarSign}
        title="Finances"
        to="/finances/dashboard"
        linked={false}
      >
        <LoadError
          what="finances"
          error={error}
          onRetry={() => refetch()}
          retrying={isFetching}
          card={false}
        />
      </UtilityCard>
    );
  }

  const today = todayIso();
  const latestMonth = MONTH_LABELS[isoMonth(today) - 1];
  // previousMonthIso, not setMonth(-1): on Mar 31 that gives "Feb 31" = Mar 3.
  const priorMonth = MONTH_LABELS[isoMonth(previousMonthIso(today)) - 1];

  const retryAll = () => {
    refetch();
    transactionsQuery.refetch();
  };
  const retrying = isFetching || transactionsQuery.isFetching;
  const notice = projectedFailed ? (
    <RefreshNotice
      message="Couldn’t load transactions, so Projected is missing."
      onRetry={retryAll}
      retrying={retrying}
    />
  ) : (
    (isRefetchError || transactionsQuery.isRefetchError) && (
      <RefreshNotice onRetry={retryAll} retrying={retrying} />
    )
  );

  // A projected figure: a pulsing bar while transactions load, a dash if they failed.
  const projected = (content) =>
    projectedPending ? (
      <span className="inline-block h-5 w-16 align-middle bg-slate-100 rounded animate-pulse" />
    ) : projectedFailed ? (
      <span className="text-slate-400">—</span>
    ) : (
      content
    );

  return (
    <UtilityCard
      icon={DollarSign}
      title="Finances"
      to="/finances/dashboard"
      notice={notice}
    >
      {/* Year Net Worth Header - Mobile Only */}
      <div className="md:hidden mb-2">
        <div className="text-xs text-slate-500 font-semibold">
          Current ({priorMonth})
        </div>
      </div>

      {/* Content: Graph left, Data right */}
      <div className="flex flex-col md:flex-row gap-3 flex-1 min-h-0">
        {/* Graph */}
        {/* Desktop only: phones never download the chart library for Home. */}
        {isDesktop && (
          <div className="md:flex-1 md:min-w-0">
            <Suspense fallback={<div className="h-full min-h-[200px]" />}>
              <Graph
                years={[currentYear]}
                selectedYear={currentYear}
                onSelectYear={() => {}}
                flat
              />
            </Suspense>
          </div>
        )}

        {/* Data Sections */}
        <div className="flex-1 flex flex-col md:justify-start space-y-3">
          {/* Current Year Overview */}
          <div>
            <div className="hidden md:block text-xs text-slate-500 font-semibold mb-2">
              Current ({priorMonth})
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
                  {projected(formatCurrency(stats.projectedNetWorth))}
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
                  {projected(
                    `${stats.projectedNetWorth - stats.netWorth >= 0 ? "+" : "-"}${formatCurrency(Math.abs(stats.projectedNetWorth - stats.netWorth))}`,
                  )}
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
                  {projected(
                    `${stats.projectedPercentChange >= 0 ? "+" : "-"}${Math.abs(stats.projectedPercentChange).toFixed(1)}%`,
                  )}
                </div>
                <div className="text-[11px] text-slate-400">Change %</div>
              </div>
            </div>
          </div>

          {/* Account Breakdown */}
          {stats.accountChanges.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="divide-y divide-slate-100">
                {stats.accountChanges.map((account) => (
                  <div
                    key={account.accountId}
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
    </UtilityCard>
  );
}
