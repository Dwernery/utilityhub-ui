import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { useNetWorthHistory } from "../hooks";
import { currencyFormatter } from "../utils/currency";
import { buildMonthlyRows } from "../utils/monthly";
import { MonthlyDetailModal } from "./MonthlyDetailModal";

export function MonthlyTable({ selectedYear }) {
  const { data: netWorthHistory } = useNetWorthHistory();
  const [selectedMonth, setSelectedMonth] = useState(null);

  const monthlyData = useMemo(
    () => buildMonthlyRows(netWorthHistory, selectedYear),
    [netWorthHistory, selectedYear],
  );

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
              key={month.key}
              onClick={() =>
                (month.hasData || month.isCurrentMonth) &&
                setSelectedMonth(month)
              }
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
                    {currencyFormatter.format(month.netWorth)}
                  </div>
                  <div
                    className={`px-2 py-2 sm:px-4 text-right font-semibold text-xs sm:text-sm ${
                      month.change >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                    role="cell"
                  >
                    <div>
                      {month.change >= 0 ? "+" : ""}
                      {currencyFormatter.format(month.change)}
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
          date={selectedMonth.date}
          title={`${selectedMonth.month} ${selectedYear}`}
          onClose={() => setSelectedMonth(null)}
        />
      )}
    </>
  );
}
