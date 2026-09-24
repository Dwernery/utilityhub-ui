import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { useNetWorthHistory } from "../hooks/useNetWorthHistory";
import { Currencyformatter } from "../utils/currency";
import { getEntryAssets, getEntryLiabilities } from "../utils/metrics";
import { MONTH_LABELS, PRIOR_YEAR_ENDING_BALANCES } from "../utils/metrics";
import { MonthlyDetailModal } from "./MonthlyDetailModal.jsx";
import { NET_WORTH_HISTORY_KEY } from "../hooks/queryKeys.js";

export function MonthlyTable({ selectedYear }) {
  const queryClient = useQueryClient();
  const { data: netWorthHistory } = useNetWorthHistory();
  const [selectedMonth, setSelectedMonth] = useState(null);

  const handleRefreshData = async () => {
    await queryClient.invalidateQueries({ queryKey: NET_WORTH_HISTORY_KEY });
  };

  const monthlyData = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed

    const allEntries = netWorthHistory ? Object.values(netWorthHistory) : [];
    const entries = allEntries
      .filter((entry) => {
        const entryYear = parseInt((entry?.date || "").split("-")[0]);
        const entryMonth = parseInt((entry?.date || "").split("-")[1]);
        // Exclude current month entries from calculations
        if (entryYear === currentYear && entryMonth === currentMonth) {
          return false;
        }
        return parseInt((entry?.date || "").split("-")[0]) === selectedYear;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const byMonthIndex = new Map();
    entries.forEach((entry, idx) => {
      const totalAssets = getEntryAssets(entry);
      const totalLiabilities = getEntryLiabilities(entry);

      const netWorth = entry.netWorth || totalAssets - totalLiabilities;

      let prevNetWorth = 0;
      let change = 0;
      let changePercent = 0;

      const prevEntry = entries[idx - 1];
      if (prevEntry) {
        prevNetWorth = prevEntry.netWorth || 0;
        change = netWorth - prevNetWorth;
        changePercent = prevNetWorth !== 0 ? (change / prevNetWorth) * 100 : 0;
      } else {
        // For first entry in year (January), look at previous year's December
        const monthIndex = parseInt((entry.date || "").split("-")[1]) - 1;
        if (monthIndex === 0) {
          // Check if we have a hardcoded prior year balance
          if (PRIOR_YEAR_ENDING_BALANCES[selectedYear] !== undefined) {
            prevNetWorth = PRIOR_YEAR_ENDING_BALANCES[selectedYear];
            change = netWorth - prevNetWorth;
            changePercent =
              prevNetWorth !== 0 ? (change / prevNetWorth) * 100 : 0;
          } else {
            // Otherwise, try to look up previous year's December from API data
            const prevYearEntries = allEntries
              .filter(
                (e) =>
                  parseInt((e?.date || "").split("-")[0]) === selectedYear - 1,
              )
              .sort((a, b) => new Date(b.date) - new Date(a.date));

            if (prevYearEntries.length > 0) {
              prevNetWorth = prevYearEntries[0].netWorth || 0;
              change = netWorth - prevNetWorth;
              changePercent =
                prevNetWorth !== 0 ? (change / prevNetWorth) * 100 : 0;
            }
          }
        }
      }

      const monthIndex = parseInt((entry.date || "").split("-")[1]) - 1;

      byMonthIndex.set(monthIndex, {
        date: entry.date,
        month: MONTH_LABELS[monthIndex],
        assets: totalAssets,
        liabilities: totalLiabilities,
        netWorth,
        change,
        changePercent,
        accounts: entry.accounts || [],
        hasData: true,
        isCurrentMonth: false,
      });
    });

    // Add current month entries if they exist (for display only, not calculations)
    if (selectedYear === currentYear) {
      const currentMonthEntries = allEntries
        .filter((entry) => {
          const entryYear = parseInt((entry?.date || "").split("-")[0]);
          const entryMonth = parseInt((entry?.date || "").split("-")[1]);
          return entryYear === currentYear && entryMonth === currentMonth;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      if (currentMonthEntries.length > 0) {
        const entry = currentMonthEntries[0];
        const totalAssets = getEntryAssets(entry);
        const totalLiabilities = getEntryLiabilities(entry);
        const netWorth = entry.netWorth || totalAssets - totalLiabilities;

        // For current month, show change from last complete month
        let change = 0;
        let changePercent = 0;
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          const prevNetWorth = lastEntry.netWorth || 0;
          change = netWorth - prevNetWorth;
          changePercent =
            prevNetWorth !== 0 ? (change / prevNetWorth) * 100 : 0;
        }

        const monthIndex = currentMonth - 1;
        byMonthIndex.set(monthIndex, {
          date: entry.date,
          month: MONTH_LABELS[monthIndex],
          assets: totalAssets,
          liabilities: totalLiabilities,
          netWorth,
          change,
          changePercent,
          accounts: entry.accounts || [],
          hasData: true,
          isCurrentMonth: true,
        });
      }
    }

    // Always show all 12 months, even if the API hasn't reported them yet.
    return MONTH_LABELS.map(
      (month, monthIndex) =>
        byMonthIndex.get(monthIndex) || {
          date: null,
          month,
          assets: 0,
          liabilities: 0,
          netWorth: null,
          change: null,
          changePercent: null,
          accounts: [],
          hasData: false,
          isCurrentMonth: false,
        },
    );
  }, [netWorthHistory, selectedYear]);

  return (
    <>
      <div
        className="w-full bg-white rounded-2xl shadow-xl border border-slate-200 flex flex-col h-full overflow-hidden"
        role="table"
      >
        <div
          className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 flex-shrink-0"
          role="row"
        >
          <div
            className="px-2 py-2 sm:px-4  text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider"
            role="columnheader"
          >
            Month
          </div>
          <div
            className="px-2 py-2 sm:px-4  text-right text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider"
            role="columnheader"
          >
            Net Worth
          </div>
          <div
            className="px-2 py-2 sm:px-4  text-right text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider"
            role="columnheader"
          >
            Change
          </div>
        </div>
        <div className="flex-1 flex flex-col min-h-0" role="rowgroup">
          {monthlyData.map((month, idx) => (
            <div
              key={idx}
              onClick={() => month.hasData && setSelectedMonth(month)}
              role="row"
              className={`flex-1 min-h-0 grid grid-cols-3 border-b border-slate-100 transition-colors items-center overflow-hidden ${
                month.isCurrentMonth
                  ? "bg-yellow-100 hover:bg-yellow-200 cursor-pointer"
                  : month.hasData
                    ? "hover:bg-blue-50 cursor-pointer"
                    : "cursor-default"
              } ${!month.isCurrentMonth && idx % 2 === 0 ? "bg-white" : ""}`}
            >
              <div
                className="px-2 py-2 sm:px-4 text-xs sm:text-base font-semibold text-slate-700"
                role="cell"
              >
                <div className="flex items-center gap-1 sm:gap-2">
                  {month.month}
                  {month.hasData && (
                    <ChevronRight
                      className="text-slate-300 group-hover:text-blue-600 hidden sm:block"
                      size={16}
                    />
                  )}
                </div>
              </div>
              {month.hasData ? (
                <>
                  <div
                    className="px-2 py-2 sm:px-4 text-right text-xs sm:text-base font-bold text-slate-800"
                    role="cell"
                  >
                    {Currencyformatter.format(month.netWorth)}
                  </div>
                  <div
                    className={`px-2 py-2 sm:px-4 text-right font-semibold text-xs sm:text-sm ${
                      month.change >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                    role="cell"
                  >
                    <div>
                      {month.change >= 0 ? "+" : ""}
                      {Currencyformatter.format(month.change)}
                    </div>
                    <div className="text-[10px] sm:text-xs font-medium opacity-75">
                      ({month.change >= 0 ? "+" : "-"}
                      {Math.abs(month.changePercent).toFixed(1)}%)
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div
                    className="px-2 py-2 sm:px-4 text-right text-xs sm:text-base font-semibold text-slate-300"
                    role="cell"
                  >
                    —
                  </div>
                  <div
                    className="px-2 py-2 sm:px-4 text-right font-semibold text-xs sm:text-sm text-slate-300"
                    role="cell"
                  >
                    <div>—</div>
                    <div className="text-[10px] sm:text-xs font-medium opacity-75">
                      —
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      {selectedMonth && (
        <MonthlyDetailModal
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onClose={() => setSelectedMonth(null)}
          onRefresh={handleRefreshData}
        />
      )}
    </>
  );
}
