import { CheckCircle2, ExternalLink, Minus, Plus } from "lucide-react";
import { CourseCover } from "./CourseCover";
import { ProgressBar } from "./ProgressBar";
import { courseStatus } from "../utils/stats";

/**
 * One course in a compact row: cover, title and creator, then progress and −/+.
 * On narrow screens the progress bar drops under the title. Clicking the row
 * (anywhere but its buttons and link) opens the editor.
 */
export function CourseRow({ course, onEdit, onStep }) {
  const done = courseStatus(course) === "DONE";
  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn();
  };
  const count = (
    <span className="text-xs text-slate-500 tabular-nums whitespace-nowrap">
      {course.completedLessons}/{course.totalLessons}
    </span>
  );

  return (
    // Clicking anywhere on the row edits it. For keyboards and screen readers the title
    // is the button: a row-wide button couldn't contain the link and −/+ buttons.
    <div
      onClick={() => onEdit(course)}
      className="flex items-center gap-3 px-3 py-2 hover:bg-slate-50 cursor-pointer focus-within:bg-blue-50/40"
    >
      <CourseCover
        course={course}
        className="w-12 h-7 rounded flex-shrink-0 ring-1 ring-slate-200"
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={stop(() => onEdit(course))}
            className={`min-w-0 text-left text-sm leading-5 font-medium truncate cursor-pointer rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${done ? "text-slate-500" : "text-slate-800"}`}
            title={course.title}
            aria-label={`Edit ${course.title}`}
          >
            {course.title}
          </button>
          {done && (
            <CheckCircle2
              className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0"
              aria-label="Completed"
            />
          )}
          {course.url && (
            <a
              href={course.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-0.5 text-slate-400 hover:text-blue-600 flex-shrink-0"
              aria-label={`Open ${course.title}`}
              title="Open course"
            >
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <div className="text-xs leading-4 text-slate-400 truncate">
          {course.creatorName}
        </div>
        {/* Narrow screens: progress under the title. */}
        <div className="flex items-center gap-2 mt-1 sm:hidden">
          <ProgressBar
            completed={course.completedLessons}
            total={course.totalLessons}
            className="h-1"
          />
          {count}
        </div>
      </div>

      {/* Wider screens: progress in its own column. */}
      <div className="hidden sm:flex items-center gap-2 w-40 flex-shrink-0">
        <ProgressBar
          completed={course.completedLessons}
          total={course.totalLessons}
          className="h-1.5"
        />
        <span className="w-14 text-right">{count}</span>
      </div>

      <div className="flex items-center flex-shrink-0">
        <button
          type="button"
          onClick={stop(() => onStep(course, -1))}
          disabled={course.completedLessons <= 0}
          className="p-1 rounded-md text-slate-500 hover:bg-slate-200 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-default"
          aria-label={`One lesson fewer done in ${course.title}`}
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={stop(() => onStep(course, 1))}
          disabled={done}
          className="p-1 rounded-md text-indigo-600 hover:bg-indigo-50 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-default"
          aria-label={`One more lesson done in ${course.title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
