import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { Currencyformatter as currencyFormatter } from "../utils/currency.js";
import { useNetWorthHistory } from "../hooks/useNetWorthHistory.js";
import { getYearMetrics, getYearStats } from "../utils/metrics.js";

function StatItem({ label, value, valueClass = "text-white" }) {
  return (
    <div className="min-w-0">
      <div className="text-blue-200 text-[10px] md:text-xs uppercase tracking-wide font-medium mb-1">
        {label}
      </div>
      <div
        className={`font-semibold text-xs md:text-sm truncate ${valueClass}`}
      >
        {value}
      </div>
    </div>
  );
}

export function HeroCard({ selectedYear }) {
  let { data: netWorthHistory } = useNetWorthHistory();
  const [showDetails, setShowDetails] = useState(false);

  const { currentNetWorth, yoyChange, yoyPercentage } = getYearMetrics(
    netWorthHistory,
    selectedYear,
  );
  const {
    bestMonth,
    worstMonth,
    avgChange,
    avgChangePercent,
    highest,
    lowest,
  } = getYearStats(netWorthHistory, selectedYear);

  return (
    <div className="flex flex-col justify-between h-full bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl px-4 md:px-6 py-4 md:py-5 shadow-xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="text-blue-100" size={18} />
          <span className="text-blue-100 text-[10px] md:text-xs font-medium uppercase tracking-wide">
            Net Worth
          </span>
        </div>
        <div className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
          {currencyFormatter.format(currentNetWorth)}
        </div>
        <div className="flex items-center gap-2">
          {yoyChange >= 0 ? (
            <TrendingUp className="text-emerald-300" size={16} />
          ) : (
            <TrendingDown className="text-rose-300" size={16} />
          )}
          <span
            className={`text-xs md:text-sm lg:text-base font-semibold ${yoyChange >= 0 ? "text-emerald-300" : "text-rose-300"}`}
          >
            {currencyFormatter.format(yoyChange)} ({yoyChange >= 0 ? "+" : "-"}
            {Math.abs(yoyPercentage).toFixed(0)} % YoY)
          </span>
        </div>
      </div>
      <div className="mt-6 pt-4 border-t border-blue-500/40">
        <button
          type="button"
          onClick={() => setShowDetails((prev) => !prev)}
          className="flex md:hidden items-center justify-between w-full text-blue-200 text-[10px] uppercase tracking-wide font-medium"
        >
          <span>{showDetails ? "" : "Show details"}</span>
          <ChevronDown
            size={14}
            className={`transition-transform ${showDetails ? "rotate-180" : ""}`}
          />
        </button>
        <div
          className={`grid-cols-2 gap-x-4 gap-y-3 md:grid ${showDetails ? "grid" : "hidden"}`}
        >
          <StatItem
            label="Year High"
            value={currencyFormatter.format(highest)}
          />
          <StatItem label="Year Low" value={currencyFormatter.format(lowest)} />
          <StatItem
            label="Best Month"
            value={
              bestMonth
                ? `${bestMonth.month} +${currencyFormatter.format(bestMonth.change)}`
                : "—"
            }
            valueClass="text-emerald-300"
          />
          <StatItem
            label="Worst Month"
            value={
              worstMonth
                ? `${worstMonth.month} ${currencyFormatter.format(worstMonth.change)}`
                : "—"
            }
            valueClass="text-rose-300"
          />
          <StatItem
            label="Avg Monthly Change"
            value={currencyFormatter.format(avgChange)}
            valueClass={avgChange >= 0 ? "text-emerald-300" : "text-rose-300"}
          />
          <StatItem
            label="Avg Monthly Change %"
            value={`${avgChangePercent >= 0 ? "+" : "-"}${Math.abs(avgChangePercent).toFixed(1)}%`}
            valueClass={
              avgChangePercent >= 0 ? "text-emerald-300" : "text-rose-300"
            }
          />
        </div>
      </div>
    </div>
  );
}
