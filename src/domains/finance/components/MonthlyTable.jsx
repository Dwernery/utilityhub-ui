import { useMemo, useState } from "react";
import { ChevronRight, TrendingUp, TrendingDown } from "lucide-react";
import { useNetWorthHistory } from "../hooks/useNetWorthHistory";
import { Currencyformatter } from "../utils/currency";
import { getEntryAssets, getEntryLiabilities } from "../utils/metrics";
import { MONTH_LABELS } from "../utils/metrics";
import { MonthlyDetailModal } from "./MonthlyDetailModal.jsx";

export function MonthlyTable({ selectedYear }) {
  const { data: netWorthHistory } = useNetWorthHistory();
  const [selectedMonth, setSelectedMonth] = useState(null);

  const monthlyData = useMemo(() => {
    if (!netWorthHistory || Object.keys(netWorthHistory).length === 0) {
      return [];
    }

    const entries = Object.values(netWorthHistory)
      .filter(
        (entry) => parseInt((entry?.date || "").split("-")[0]) === selectedYear,
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    return entries.map((entry, idx) => {
      const totalAssets = getEntryAssets(entry);
      const totalLiabilities = getEntryLiabilities(entry);

      const netWorth = entry.netWorth || totalAssets - totalLiabilities;
      const prevEntry = entries[idx - 1];
      const prevNetWorth = prevEntry?.netWorth || 0;
      const change = prevEntry ? netWorth - prevNetWorth : 0;
      const changePercent =
        prevEntry && prevNetWorth !== 0 ? (change / prevNetWorth) * 100 : 0;

      const monthIndex = parseInt((entry.date || "").split("-")[1]) - 1;

      return {
        date: entry.date,
        month: MONTH_LABELS[monthIndex],
        assets: totalAssets,
        liabilities: totalLiabilities,
        netWorth,
        change,
        changePercent,
        accounts: entry.accounts || [],
      };
    });
  }, [netWorthHistory, selectedYear]);

  return (
    <>
      <div className="w-full bg-white rounded-2xl p-3 md:p-5 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
          {monthlyData.map((month, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedMonth(month);
              }}
              className="w-full text-left rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 p-3 transition-all group hover:cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-500 font-semibold text-xs uppercase tracking-wide group-hover:text-blue-700">
                  {month.month}
                </span>
                <ChevronRight
                  className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all"
                  size={16}
                />
              </div>
              <div className="text-slate-800 font-bold text-sm md:text-base mb-1">
                {Currencyformatter.format(month.netWorth)}
              </div>
              <div
                className={`flex items-center gap-1 text-xs md:text-sm font-semibold ${month.change >= 0 ? "text-emerald-600" : "text-rose-600"}`}
              >
                {month.change >= 0 ? (
                  <TrendingUp size={14} />
                ) : (
                  <TrendingDown size={14} />
                )}
                {month.change >= 0 ? "+" : "-"}
                {Currencyformatter.format(Math.abs(month.change))}
                <span className="text-slate-400 font-medium">
                  ({month.change >= 0 ? "+" : "-"}
                  {Math.abs(month.changePercent).toFixed(1)}%)
                </span>
              </div>
            </button>
          ))}
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
