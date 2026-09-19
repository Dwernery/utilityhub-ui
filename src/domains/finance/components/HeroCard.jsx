import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { Currencyformatter as currencyFormatter } from "../utils/currency.js";
import { useNetWorthHistory } from "../hooks/useNetWorthHistory.js";
import {
  getCurrentAssets,
  getCurrentNetWorth,
  getCurrentLiabilities,
  getPrevYearNetWorthChange,
} from "../utils/metrics.js";

export function HeroCard() {
  let { data: netWorthHistory } = useNetWorthHistory();
  const prevYearNetWorthChange = getPrevYearNetWorthChange(netWorthHistory);
  const currentNetWorth = getCurrentNetWorth(netWorthHistory);

  return (
    <div className="flex flex-col justify-between h-full bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl px-6 py-5 shadow-xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <DollarSign className="text-blue-100" size={20} />
          <span className="text-blue-100 text-xs font-medium uppercase tracking-wide">
            Net Worth
          </span>
        </div>
        <div className="text-4xl md:text-5xl font-bold text-white mb-2">
          {currencyFormatter.format(currentNetWorth)}
        </div>
        <div className="flex items-center gap-2">
          {prevYearNetWorthChange >= 0 ? (
            <TrendingUp className="text-emerald-300" size={18} />
          ) : (
            <TrendingDown className="text-rose-300" size={18} />
          )}
          <span
            className={`text-base font-semibold ${prevYearNetWorthChange >= 0 ? "text-emerald-300" : "text-rose-300"}`}
          >
            {currencyFormatter.format(prevYearNetWorthChange)} (
            {prevYearNetWorthChange >= 0 ? "+" : "-"}
            {Math.abs(
              (prevYearNetWorthChange /
                (currentNetWorth - prevYearNetWorthChange)) *
                100,
            ).toFixed(0)}{" "}
            % YoY)
          </span>
        </div>
      </div>
      <div className="flex gap-8 pt-4 mt-4 border-t border-blue-500">
        <div>
          <div className="text-blue-200 text-xs font-medium uppercase tracking-wide">
            Assets
          </div>
          <div className="text-emerald-300 font-bold text-lg">
            {getCurrentAssets(netWorthHistory)}
          </div>
        </div>
        <div>
          <div className="text-blue-200 text-xs font-medium uppercase tracking-wide">
            Liabilities
          </div>
          <div className="text-rose-300 font-bold text-lg">
            {getCurrentLiabilities(netWorthHistory)}
          </div>
        </div>
      </div>
    </div>
  );
}
