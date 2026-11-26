import { percent, progressFraction } from "../utils/stats";

/**
 * A thin bar for lessons done out of a total: green when done, indigo otherwise. Any
 * progress shows at least a sliver. Full width unless className sets a width.
 */
export function ProgressBar({ completed, total, className = "h-1.5" }) {
  const width = /(^|\s)w-/.test(className) ? "" : "w-full";
  const done = total > 0 && completed >= total;
  return (
    <div
      className={`${width} bg-slate-100 rounded-full overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={percent(completed, total)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-300 ${done ? "bg-emerald-500" : "bg-indigo-500"}`}
        style={{ width: `${progressFraction(completed, total) * 100}%` }}
      />
    </div>
  );
}
