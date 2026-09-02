import { ArrowRight, Clapperboard, Galaxy } from "lucide-react";
import { useMemo } from "react";
import { useMcuTracker } from "../../mcu/context/McuTrackerContext";
import { useMcuTrackerData } from "../../mcu/hooks/useMcuTrackerData";
import { normalizeTrackerData } from "../../mcu/utils/normalizeTrackerData";
import { combineStats, computeStats, percentage } from "../../mcu/utils/stats";
import { BREAKDOWN } from "../../mcu/utils/statConstants";
import { UtilityCard } from "./UtilityCard";

function ProgressSection({ label, stats }) {
  const pct = percentage(stats.done, stats.total);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
          <Galaxy className="w-3.5 h-3.5 text-slate-400" />
          {label}
        </span>
        <span className="text-xs text-slate-400">
          {stats.done}/{stats.total} ·{" "}
          <span className="font-semibold ">{pct}%</span>
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
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

export function McuHomeCard() {
  const { watched } = useMcuTracker();
  const { data } = useMcuTrackerData();
  const { phases, expandedCategories } = useMemo(
    () => normalizeTrackerData(data),
    [data],
  );

  const mcuStats = useMemo(
    () =>
      combineStats(phases.map((phase) => computeStats(phase.items, watched))),
    [phases, watched],
  );
  const expandedStats = useMemo(
    () =>
      combineStats(
        expandedCategories.map((category) =>
          computeStats(category.items, watched),
        ),
      ),
    [expandedCategories, watched],
  );
  const overallStats = useMemo(
    () => combineStats([mcuStats, expandedStats]),
    [mcuStats, expandedStats],
  );

  return (
    <UtilityCard
      icon={Clapperboard}
      title="MCU"
      badgeLabel="Live"
      to="/mcu/tracker"
    >
      <div className="mt-4 space-y-4">
        <ProgressSection label="Overall" stats={overallStats} />
        <div className="border-t border-slate-100 pt-4">
          <ProgressSection label="MCU Phases" stats={mcuStats} />
        </div>
        <div className="border-t border-slate-100 pt-4 pb-4">
          <ProgressSection label="Expanded Universe" stats={expandedStats} />
        </div>
      </div>

      <div className="flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:gap-2 transition-all mt-auto pt-4 border-t border-slate-100">
        Open Tracker
        <ArrowRight className="w-4 h-4" />
      </div>
    </UtilityCard>
  );
}
