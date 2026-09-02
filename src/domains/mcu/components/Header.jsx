import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Home, Galaxy } from "lucide-react";
import { useMcuTracker } from "../context/McuTrackerContext";
import { useMcuTrackerData } from "../hooks/useMcuTrackerData";
import { normalizeTrackerData } from "../utils/normalizeTrackerData";
import { combineStats, computeStats, percentage } from "../utils/stats";
import { VIEWS, BREAKDOWN } from "../utils/statConstants";

export function Header() {
  const { view, setView, watched } = useMcuTracker();
  const { data } = useMcuTrackerData();
  const { phases, expandedCategories } = useMemo(
    () => normalizeTrackerData(data),
    [data],
  );

  const stats = useMemo(() => {
    const items =
      view === "phases"
        ? phases.flatMap((p) => p.items)
        : view === "categories"
          ? expandedCategories.flatMap((c) => c.items)
          : [];
    return combineStats([computeStats(items, watched)]);
  }, [view, phases, expandedCategories, watched]);

  const pct = percentage(stats.done, stats.total);

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="pt-5 pb-4 mb-2 border-b border-slate-700">
        <div className="mx-auto">
          <div className="mb-3.5 flex justify-between ">
            <h1 className="text-2xl font-extrabold tracking-tight m-0">
              <Galaxy className="w-6 h-6 inline-block mr-2 " />
              MCU
              <span className="ml-2 text-slate-400 font-semibold">
                Watch Tracker
              </span>
            </h1>
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors w-fit"
            >
              <Home className="w-3 h-3" />
              Home
            </Link>
          </div>

          <div className="flex flex-col gap-2 mt-3.5">
            {/* Row 1: MCU / Expanded Universe Toggle */}
            <div className="flex items-center justify-center bg-slate-800 border border-slate-700 rounded-lg px-1.5 py-2">
              <div className="flex gap-0.5 bg-slate-900 rounded p-1">
                {VIEWS.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setView(key)}
                    className={`text-[10px] font-semibold py-1.5 px-3 rounded transition-all  ${
                      view === key
                        ? "bg-slate-700 text-slate-50 shadow-sm"
                        : "text-slate-400 hover:text-slate-300 cursor-pointer"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 2: All Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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

            {/* Row 3: Overall Percentage */}
            <div className="flex flex-col justify-center gap-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
