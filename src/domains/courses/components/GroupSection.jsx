import { ChevronRight, Plus } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { percentLabel } from "../utils/stats";
import { CourseRow } from "./CourseRow";

/**
 * A group's header (name and summed stats) and, when open, its courses.
 * Clicking the header opens or closes it. `group` is null for the "Ungrouped"
 * section, which can't be edited or moved.
 */
export function GroupSection({
  section,
  onAddCourse,
  onEditCourse,
  onStep,
  searching,
  open,
  onToggle,
}) {
  const { group, courses, stats } = section;
  const name = group?.name ?? "Ungrouped";
  const bodyId = `course-group-${group?.id ?? "ungrouped"}`;

  return (
    <section
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
      aria-label={name}
    >
      {/* The button sits inside the heading (a heading can't go inside a button). */}
      <h2
        className={`flex items-center bg-slate-50 ${open ? "border-b border-slate-200" : ""}`}
      >
        <button
          type="button"
          onClick={onToggle}
          // While searching, every group with a match stays open.
          disabled={searching}
          aria-expanded={open}
          aria-controls={bodyId}
          title={
            searching ? "Clear the search to open or close groups" : undefined
          }
          className="flex-1 min-w-0 flex items-center gap-2 pl-3 pr-2 py-2 text-left cursor-pointer hover:bg-slate-100 disabled:cursor-default disabled:hover:bg-transparent focus:outline-none focus-visible:bg-blue-50"
        >
          <ChevronRight
            className={`w-4 h-4 flex-shrink-0 transition-transform duration-150 ${open ? "rotate-90" : ""} ${searching ? "text-slate-200" : "text-slate-400"}`}
          />
          <span className="font-semibold text-slate-800 text-sm truncate">
            {name}
          </span>
          <span
            className="text-xs text-slate-400 tabular-nums whitespace-nowrap"
            title={`${stats.coursesDone} of ${stats.courseCount} courses finished`}
          >
            {stats.coursesDone}/{stats.courseCount}
          </span>
          {stats.totalLessons > 0 && (
            <span className="ml-auto flex items-center gap-2 flex-shrink-0 pr-1">
              <span className="hidden sm:inline text-xs text-slate-500 tabular-nums whitespace-nowrap">
                {stats.completedLessons.toLocaleString()}/
                {stats.totalLessons.toLocaleString()}
              </span>
              <ProgressBar
                completed={stats.completedLessons}
                total={stats.totalLessons}
                className="h-1.5 w-16 sm:w-20"
              />
              <span className="text-xs font-semibold text-slate-500 tabular-nums w-8 text-right">
                {percentLabel(stats.completedLessons, stats.totalLessons)}
              </span>
            </span>
          )}
        </button>
      </h2>

      {open && (
        <div id={bodyId}>
          {courses.length > 0 ? (
            // Two across on wide screens, reading left to right. Each row draws its own
            // bottom line (and the left column a right one); -mb-px hides the last line,
            // which the card's edge already makes.
            <div className="grid lg:grid-cols-2 -mb-px">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="min-w-0 border-b border-slate-100 lg:odd:border-r"
                >
                  <CourseRow
                    course={course}
                    onEdit={onEditCourse}
                    onStep={onStep}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="px-3 py-3 flex items-center justify-between gap-2">
              <span className="text-sm text-slate-400">
                {searching ? "No matches in this group." : "No courses yet."}
              </span>
              {!searching && group && (
                <button
                  type="button"
                  onClick={() => onAddCourse(group.id)}
                  className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add a course
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
