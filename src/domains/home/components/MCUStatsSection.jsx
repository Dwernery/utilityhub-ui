import { Galaxy } from "lucide-react";
import { BREAKDOWN } from "../../mcu/utils/statConstants";

export function MCUStatsSection({ label, stats }) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1 font-semibold">
          <Galaxy className="w-3.5 h-3.5 text-slate-400" />
          {label}
        </span>
      </div>

      <div className="grid grid-cols-3 text-center divide-x divide-slate-100">
        {BREAKDOWN.map(
          ({ key, doneKey, label: breakdownLabel, icon: Icon }) => (
            <div key={key}>
              <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-800">
                <Icon className="w-3.5 h-3.5 text-slate-400" />
                {stats[doneKey]}/{stats[key]}
              </div>
              <div className="text-[11px] text-slate-400">{breakdownLabel}</div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
