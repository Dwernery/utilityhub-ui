import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Home, Galaxy } from "lucide-react";
import { useMcuTracker } from "../context/McuTrackerContext";
import { combineStats, formatMinutes, percentage } from "../utils/stats";
import { categorySections, sagaSections } from "../utils/sections";
import { BREAKDOWN } from "../utils/constants";
import { AddContentButton } from "./editing/AddContentButton";

export function Header() {
  const { view, watched, phases, expandedCategories } = useMcuTracker();

  // The same sections the tracker shows, so Overall counts exactly what's listed.
  const stats = useMemo(() => {
    const sections =
      view === "phases"
        ? sagaSections(phases, watched)
        : categorySections(expandedCategories, watched);
    return combineStats(sections.map((s) => s.stats));
  }, [view, phases, expandedCategories, watched]);

  // Weighted by runtime, so a 3-hour movie moves the bar more than a 30-minute episode.
  const pct = percentage(stats.minutesDone, stats.minutes);
  const left = stats.minutes - stats.minutesDone;

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="pt-5 pb-4 mb-2 border-b border-slate-700">
        <div className="mx-auto">
          <div className="mb-3.5 flex justify-between items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight m-0">
              <Galaxy className="w-6 h-6 inline-block mr-2 " />
              MCU
              <span className="ml-2 text-slate-400 font-semibold">
                Watch Tracker
              </span>
            </h1>
            <div className="flex items-center gap-3">
              <AddContentButton />
              <Link
                to="/"
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors"
              >
                <Home className="w-3 h-3" />
                Home
              </Link>
            </div>
          </div>

          {/* Four equal boxes on wide screens. Narrower: Overall gets a full row and the three
              counts share the next (like the iPhone app). The view switch is in the tracker's
              search row, with the filter. */}
          <div className="grid grid-cols-3 lg:grid-cols-4 gap-2 mt-3.5">
            <div className="col-span-3 lg:col-span-1 flex flex-col justify-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-slate-400 truncate">
                  Overall
                </div>
                <div className="text-sm font-bold text-slate-50">{pct}%</div>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-500 shadow-[0_0_10px_rgba(139,124,246,0.35)] transition-[width] duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 tabular-nums">
                <span>
                  {formatMinutes(stats.minutesDone)} of{" "}
                  {formatMinutes(stats.minutes)}
                </span>
                <span>
                  {left > 0 ? `${formatMinutes(left)} to go` : "All caught up"}
                </span>
              </div>
            </div>

            {BREAKDOWN.map(({ key, doneKey, label, icon: Icon }) => {
              const total = stats[key];
              const done = stats[doneKey];
              return (
                <div
                  key={key}
                  className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2"
                >
                  <Icon className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[11px] text-slate-400 truncate">
                      {label}
                    </div>
                    <div className="text-sm font-bold text-slate-50">
                      {total > 0 ? `${done}/${total}` : "—"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
