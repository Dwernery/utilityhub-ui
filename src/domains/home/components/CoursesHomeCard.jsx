import {
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  Hourglass,
  ListChecks,
  Percent,
  PlayCircle,
} from "lucide-react";
import { useCourses } from "../../courses/hooks";
import { coursesHomeStats, percentLabel } from "../../courses/utils/stats";
import { CourseCover } from "../../courses/components/CourseCover";
import { ProgressBar } from "../../courses/components/ProgressBar";
import { LoadError } from "../../../components/LoadError";
import { RefreshNotice, UtilityCard, UtilityCardSkeleton } from "./UtilityCard";

/** A Lessons row, a Courses row, then up to 4 in-progress courses (like the Library and MCU tiles). Mirrors mobile's courses-home-card. */
export function CoursesHomeCard() {
  const {
    data: courses = [],
    isPending,
    isLoadingError,
    isRefetchError,
    error,
    refetch,
    isFetching,
  } = useCourses();
  const { overall, inProgress } = coursesHomeStats(courses);

  if (isPending) {
    return (
      <UtilityCard icon={GraduationCap} title="Courses" to="/courses">
        <UtilityCardSkeleton />
      </UtilityCard>
    );
  }

  if (isLoadingError) {
    return (
      <UtilityCard
        icon={GraduationCap}
        title="Courses"
        to="/courses"
        linked={false}
      >
        <LoadError
          what="courses"
          error={error}
          onRetry={() => refetch()}
          retrying={isFetching}
          card={false}
        />
      </UtilityCard>
    );
  }

  return (
    <UtilityCard
      icon={GraduationCap}
      title="Courses"
      to="/courses"
      notice={
        isRefetchError && (
          <RefreshNotice onRetry={() => refetch()} retrying={isFetching} />
        )
      }
    >
      <StatsRow icon={ListChecks} label="Lessons">
        <Stat icon={CheckCircle2} label="Done">
          {overall.completedLessons.toLocaleString()}
        </Stat>
        <Stat icon={Hourglass} label="Left">
          {(overall.totalLessons - overall.completedLessons).toLocaleString()}
        </Stat>
        <Stat icon={Percent} label="Complete">
          {percentLabel(overall.completedLessons, overall.totalLessons)}
        </Stat>
      </StatsRow>

      <div className="border-t border-slate-100 pt-2 mt-2">
        <StatsRow icon={GraduationCap} label="Courses">
          <Stat icon={CheckCircle2} label="Finished">
            {overall.coursesDone}
          </Stat>
          <Stat icon={PlayCircle} label="In progress">
            {overall.coursesInProgress}
          </Stat>
          <Stat icon={Clock} label="In queue">
            {overall.coursesNotStarted}
          </Stat>
        </StatsRow>
      </div>

      <div className="border-t border-slate-100 pt-2 mt-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          In progress
        </div>
        {inProgress.length > 0 ? (
          <div className="space-y-3">
            {inProgress.slice(0, 4).map((course) => {
              return (
                <div key={course.id} className="flex gap-3 items-center">
                  <CourseCover
                    course={course}
                    className="w-14 h-9 rounded-md flex-shrink-0 ring-1 ring-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    {/* The lesson count sits under the bar, so the title gets the whole line. */}
                    <div className="text-sm font-medium text-slate-700 truncate mb-1">
                      {course.title}
                    </div>
                    <ProgressBar
                      completed={course.completedLessons}
                      total={course.totalLessons}
                    />
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="text-xs text-slate-400 truncate tabular-nums">
                        {course.completedLessons}/{course.totalLessons} lessons
                      </span>
                      <span className="text-xs font-semibold text-slate-400 flex-shrink-0">
                        {percentLabel(
                          course.completedLessons,
                          course.totalLessons,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {inProgress.length > 4 && (
              <div className="text-xs text-slate-400">
                +{inProgress.length - 4} more in progress
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-400">
            {courses.length === 0
              ? "No courses yet."
              : "Nothing in progress right now."}
          </p>
        )}
      </div>
    </UtilityCard>
  );
}

/** A labelled row of three stats, like the Library tile's All-Time / year rows. */
function StatsRow({ icon: Icon, label, children }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-xs font-semibold text-slate-500 mb-3">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        {label}
      </div>
      <div className="grid grid-cols-3 text-center divide-x divide-slate-100">
        {children}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, children }) {
  return (
    <div>
      <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-800 tabular-nums">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
        <span>{children}</span>
      </div>
      <div className="text-[11px] text-slate-400">{label}</div>
    </div>
  );
}
