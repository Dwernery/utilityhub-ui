import { useState } from "react";
import { useToast } from "../../../../context/ToastContext";
import { useDeleteGoal, useGoals, useSetGoal } from "../../hooks";
import { goalProgress } from "../../utils/pace";

/**
 * This year's reading goal: "18 of 25 books · 2 ahead of pace", or a prompt to set one.
 * Hidden while goals load, or if they can't be loaded. Mirrors the iPhone app's goal card.
 */
export function GoalCard({ year, done, className = "" }) {
  const { data: goals, isSuccess } = useGoals();
  const setGoal = useSetGoal();
  const deleteGoal = useDeleteGoal();
  const addToast = useToast();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  if (!isSuccess) return null;

  const goal = goals.find((g) => g.year === year);
  const busy = setGoal.isPending || deleteGoal.isPending;

  const startEditing = () => {
    setText(goal ? String(goal.target) : "");
    setEditing(true);
  };

  const save = (e) => {
    e.preventDefault();
    const target = Number(text);
    if (!Number.isInteger(target) || target < 1 || target > 1000) {
      addToast("Enter a number of books from 1 to 1000", "warning");
      return;
    }
    if (target === goal?.target) return setEditing(false);
    setGoal.mutate(
      { year, target },
      {
        onSuccess: () => {
          addToast(`${year} goal: ${target} books`, "success");
          setEditing(false);
        },
        onError: (err) =>
          addToast(
            `Failed to save goal: ${err?.message || "Unknown error"}`,
            "error",
          ),
      },
    );
  };

  const remove = () =>
    deleteGoal.mutate(year, {
      onSuccess: () => {
        addToast(`Removed the ${year} goal`, "success");
        setEditing(false);
      },
      onError: (err) =>
        addToast(
          `Failed to remove goal: ${err?.message || "Unknown error"}`,
          "error",
        ),
    });

  const card = `bg-white rounded-xl shadow-sm border border-slate-200 px-4 py-3 ${className}`;

  if (editing) {
    return (
      <form
        onSubmit={save}
        className={`${card} flex flex-wrap items-center gap-2`}
      >
        <label htmlFor="reading-goal" className="text-sm text-slate-700">
          Books to finish in {year}
        </label>
        <input
          id="reading-goal"
          type="number"
          min={1}
          max={1000}
          autoFocus
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setEditing(false)}
          disabled={busy}
          className="w-20 px-2 py-1 border border-slate-300 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={busy}
          className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 text-xs font-medium disabled:opacity-60"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-xs font-medium text-slate-500 hover:text-slate-700 px-2"
        >
          Cancel
        </button>
        {goal && (
          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="ml-auto text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-60"
          >
            Remove goal
          </button>
        )}
      </form>
    );
  }

  if (!goal) {
    return (
      <div className={`${card} flex items-center justify-between`}>
        <span className="text-sm text-slate-500">
          No {year} reading goal yet.
        </span>
        <button
          type="button"
          onClick={startEditing}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          Set goal
        </button>
      </div>
    );
  }

  const progress = goalProgress(done, goal.target, year);
  const good = ["met", "ahead", "onPace"].includes(progress.status);
  // Narrow (stacked): two rows, "2026 Goal  18 of 25 · 2 ahead of pace   Edit" and a thin bar.
  // md+ (beside Currently Reading): a ring with "18 / 25" inside and the status under it.
  return (
    <div className={`${card} md:flex md:flex-col`}>
      <div className="flex items-baseline gap-2">
        <h2 className="font-semibold text-slate-800 text-sm shrink-0">
          {year} Goal
        </h2>
        <span className="md:hidden flex-1 min-w-0 truncate text-sm text-slate-500 tabular-nums">
          {done} of {goal.target} ·{" "}
          <span className={good ? "text-green-600" : "text-slate-500"}>
            {progress.label}
          </span>
        </span>
        <button
          type="button"
          onClick={startEditing}
          className="ml-auto text-xs font-medium text-blue-600 hover:text-blue-700 cursor-pointer shrink-0"
        >
          Edit
        </button>
      </div>
      <div className="md:hidden bg-slate-100 rounded-full h-1 mt-2">
        <div
          className="bg-blue-500 h-full rounded-full transition-all"
          style={{ width: `${progress.pct}%` }}
        />
      </div>
      {/* A ring fills the space under the title whatever height Currently Reading gives the row. */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center gap-2 pt-3">
        <ProgressRing value={progress.pct / 100}>
          <span className="text-xl font-bold text-slate-800 tabular-nums">
            {done}
            <span className="text-sm font-normal text-slate-400">
              {" "}
              / {goal.target}
            </span>
          </span>
        </ProgressRing>
        <span
          className={`text-xs tabular-nums ${good ? "text-green-600" : "text-slate-500"}`}
        >
          {progress.label}
        </span>
      </div>
    </div>
  );
}

/** Circular progress (0–1) from 12 o'clock, with `children` centered inside. */
function ProgressRing({ value, size = 96, stroke = 8, children }) {
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, value));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-slate-100"
        />
        {clamped > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference * clamped} ${circumference}`}
            className="stroke-blue-500 transition-[stroke-dasharray] duration-300"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
