import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Currencyformatter as currencyFormatter } from "../utils/currency.js";
import { useNetWorthHistory } from "../hooks/useNetWorthHistory.js";
import { getYearMetrics } from "../utils/metrics.js";

export function HeroCard({ selectedYear }) {
  let { data: netWorthHistory } = useNetWorthHistory();

  const {
    currentNetWorth,
    yoyChange,
    yoyPercentage,
    currentAssets,
    currentLiabilities,
  } = getYearMetrics(netWorthHistory, selectedYear);

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
      <div className="flex gap-6 md:gap-8 pt-3 md:pt-4 mt-3 md:mt-4 border-t border-blue-500">
        <div>
          <div className="text-blue-200 text-[10px] md:text-xs font-medium uppercase tracking-wide">
            Assets
          </div>
          <div className="text-emerald-300 font-bold text-xs md:text-sm lg:text-lg">
            {currencyFormatter.format(currentAssets)}
          </div>
        </div>
        <div>
          <div className="text-blue-200 text-[10px] md:text-xs font-medium uppercase tracking-wide">
            Liabilities
          </div>
          <div className="text-rose-300 font-bold text-xs md:text-sm lg:text-lg">
            {currencyFormatter.format(currentLiabilities)}
          </div>
        </div>
      </div>
    </div>
  );
}
