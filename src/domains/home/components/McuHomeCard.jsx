import { ArrowRight, Clapperboard, Film, Sparkles, Tv } from "lucide-react";
import { EXPANDED, PHASES } from "../../mcu/data";
import { useMcuTracker } from "../../mcu/context/McuTrackerContext";
import { combineStats, computeStats, percentage } from "../../mcu/utils/stats";
import { UtilityCard } from "./UtilityCard";

const BREAKDOWN = [
  { key: "movies", doneKey: "moviesDone", label: "Movies", icon: Film },
  {
    key: "specials",
    doneKey: "specialsDone",
    label: "Specials",
    icon: Sparkles,
  },
  { key: "episodes", doneKey: "episodesDone", label: "Episodes", icon: Tv },
];

function ProgressSection({ label, stats }) {
  const pct = percentage(stats.done, stats.total);
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-slate-500">{label}</span>
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

  const mcuStats = combineStats(
    PHASES.map((phase) => computeStats(phase.items, watched)),
  );
  const expandedStats = combineStats(
    EXPANDED.map((category) => computeStats(category.items, watched)),
  );
  const overallStats = combineStats([mcuStats, expandedStats]);

  return (
    <UtilityCard
      icon={Clapperboard}
      title="MCU"
      description="Track Marvel and expanded universe progress"
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
