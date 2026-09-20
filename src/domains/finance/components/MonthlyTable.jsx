import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useNetWorthHistory } from "../hooks/useNetWorthHistory";
import { Currencyformatter } from "../utils/currency";
import { getEntryAssets, getEntryLiabilities } from "../utils/metrics";
import { MONTH_LABELS } from "../utils/metrics";
import { MonthlyDetailModal } from "./MonthlyDetailModal.jsx";

export function MonthlyTable({ selectedYear }) {
  const { data: netWorthHistory } = useNetWorthHistory();
  const [selectedMonth, setSelectedMonth] = useState(null);

  const monthlyData = useMemo(() => {
    const entries = (netWorthHistory ? Object.values(netWorthHistory) : [])
      .filter(
        (entry) => parseInt((entry?.date || "").split("-")[0]) === selectedYear,
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const byMonthIndex = new Map();
    entries.forEach((entry, idx) => {
      const totalAssets = getEntryAssets(entry);
      const totalLiabilities = getEntryLiabilities(entry);

      const netWorth = entry.netWorth || totalAssets - totalLiabilities;
      const prevEntry = entries[idx - 1];
      const prevNetWorth = prevEntry?.netWorth || 0;
      const change = prevEntry ? netWorth - prevNetWorth : 0;
      const changePercent =
        prevEntry && prevNetWorth !== 0 ? (change / prevNetWorth) * 100 : 0;

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
      });
    });

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
        },
    );
  }, [netWorthHistory, selectedYear]);

  return (
    <>
      <div className="w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col h-full">
        <div className="flex-1">
          <table className="w-full">
            <thead className="sticky top-0">
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-2 py-2 sm:px-4 sm:py-3 text-left text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-2 py-2 sm:px-4 sm:py-3 text-right text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Net Worth
                </th>
                <th className="px-2 py-2 sm:px-4 sm:py-3 text-right text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Change
                </th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((month, idx) => (
                <tr
                  key={idx}
                  onClick={() => month.hasData && setSelectedMonth(month)}
                  className={`border-b border-slate-100 transition-colors ${
                    month.hasData
                      ? "hover:bg-blue-50 cursor-pointer"
                      : "cursor-default"
                  } ${idx % 2 === 0 ? "bg-white" : "bg-slate-50"}`}
                >
                  <td className="px-2 py-2 sm:px-4 sm:py-3 text-xs sm:text-base font-semibold text-slate-700 flex items-center gap-1 sm:gap-2">
                    {month.month}
                    {month.hasData && (
                      <ChevronRight
                        className="text-slate-300 group-hover:text-blue-600 hidden sm:block"
                        size={16}
                      />
                    )}
                  </td>
                  {month.hasData ? (
                    <>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-right text-xs sm:text-base font-bold text-slate-800">
                        {Currencyformatter.format(month.netWorth)}
                      </td>
                      <td
                        className={`px-2 py-2 sm:px-4 sm:py-3 text-right font-semibold text-xs sm:text-sm ${
                          month.change >= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        <div>
                          {month.change >= 0 ? "+" : ""}
                          {Currencyformatter.format(month.change)}
                        </div>
                        <div className="text-[10px] sm:text-xs font-medium opacity-75">
                          ({month.change >= 0 ? "+" : ""}
                          {Math.abs(month.changePercent).toFixed(1)}%)
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-right text-xs sm:text-base font-semibold text-slate-300">
                        —
                      </td>
                      <td className="px-2 py-2 sm:px-4 sm:py-3 text-right font-semibold text-xs sm:text-sm text-slate-300">
                        <div>—</div>
                        <div className="text-[10px] sm:text-xs font-medium opacity-75">
                          —
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {selectedMonth && (
        <MonthlyDetailModal
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onClose={() => setSelectedMonth(null)}
        />
      )}
    </>
  );
}
