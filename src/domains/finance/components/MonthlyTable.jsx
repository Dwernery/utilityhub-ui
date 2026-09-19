import { useState, useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { useNetWorthHistory } from "../hooks/useNetWorthHistory";
import { Currencyformatter } from "../utils/currency";
import { getEntryAssets, getEntryLiabilities } from "../utils/metrics";
import { MONTH_LABELS } from "../utils/metrics";

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
      const change = prevEntry ? netWorth - (prevEntry.netWorth || 0) : 0;

      const monthIndex = parseInt((entry.date || "").split("-")[1]) - 1;

      return {
        date: entry.date,
        month: MONTH_LABELS[monthIndex],
        assets: totalAssets,
        liabilities: totalLiabilities,
        netWorth,
        change,
        accounts: entry.accounts || [],
      };
    });
  }, [netWorthHistory, selectedYear]);

  return (
    <div className="w-full bg-white rounded-2xl p-3 md:p-5 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-1.5 md:py-2 px-2 md:px-3 text-slate-500 font-semibold text-xs md:text-sm">
                Month
              </th>
              <th className="text-right py-1.5 md:py-2 px-2 md:px-3 text-slate-500 font-semibold text-xs md:text-sm">
                Assets
              </th>
              <th className="text-right py-1.5 md:py-2 px-2 md:px-3 text-slate-500 font-semibold text-xs md:text-sm">
                Liabilities
              </th>
              <th className="text-right py-1.5 md:py-2 px-2 md:px-3 text-slate-500 font-semibold text-xs md:text-sm">
                Net Worth
              </th>
              <th className="text-right py-1.5 md:py-2 px-2 md:px-3 text-slate-500 font-semibold text-xs md:text-sm">
                Change
              </th>
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {monthlyData.map((month, idx) => (
              <tr
                key={idx}
                onClick={() => setSelectedMonth(month)}
                className="border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition-all group"
              >
                <td className="py-1.5 md:py-2 px-2 md:px-3 text-slate-700 font-semibold group-hover:text-blue-700 text-xs md:text-sm">
                  {month.month}
                </td>
                <td className="py-1.5 md:py-2 px-2 md:px-3 text-right font-medium text-emerald-600 text-xs md:text-sm">
                  {Currencyformatter.format(month.assets)}
                </td>
                <td className="py-1.5 md:py-2 px-2 md:px-3 text-right font-medium text-rose-600 text-xs md:text-sm">
                  {Currencyformatter.format(month.liabilities)}
                </td>
                <td className="py-1.5 md:py-2 px-2 md:px-3 text-right font-bold text-slate-800 text-xs md:text-sm">
                  {Currencyformatter.format(month.netWorth)}
                </td>
                <td
                  className={`py-1.5 md:py-2 px-2 md:px-3 text-right font-semibold text-xs md:text-sm ${month.change >= 0 ? "text-emerald-600" : "text-rose-600"}`}
                >
                  <div className="flex items-center justify-end gap-1">
                    {month.change >= 0 ? "+" : "-"}
                    {Currencyformatter.format(Math.abs(month.change))}
                  </div>
                </td>
                <td className="py-1.5 md:py-2 px-2 md:px-3">
                  <ChevronRight
                    className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all"
                    size={18}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
