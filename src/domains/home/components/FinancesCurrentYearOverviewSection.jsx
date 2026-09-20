import { BarChart3 } from "lucide-react";
import { Currencyformatter } from "../../finance/utils/currency.js";

export function FinancesCurrentYearOverviewSection({currentNetWorth, dollarChange}) {
  const getDollarChangeColor = (value) => {
    if (value === null || value === undefined) return "text-slate-600";
    return value >= 0 ? "text-emerald-600" : "text-rose-600";
  };

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1 font-semibold">
          <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
          Current Year
        </span>
      </div>

      <div className="grid grid-cols-2 text-center divide-x divide-slate-100">
        <div>
          <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-800">
            <span>
              {Currencyformatter.format(currentNetWorth)}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Net Worth</div>
        </div>

        <div>
          <div
            className={`flex items-center justify-center gap-1 text-lg font-bold ${getDollarChangeColor(dollarChange)}`}
          >
            <span>
             {`${dollarChange >= 0 ? "+" : "-"}${Currencyformatter.format(dollarChange)}`}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">Change $</div>
        </div>
      </div>
    </div>
  );
}
