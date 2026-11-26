import { ArrowLeft } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { useCourses } from "./hooks";
import { percentLabel, sumStats } from "./utils/stats";
import { ProgressBar } from "./components/ProgressBar";

function Header() {
  const { data: courses = [] } = useCourses();
  const stats = sumStats(courses);

  return (
    <div className="w-full px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-slate-200 border-t-0 rounded-xl shadow-sm p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
              aria-label="Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-xl font-bold text-slate-800">My Courses</h1>
          </div>
          {stats.totalLessons > 0 && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500 tabular-nums">
                {stats.completedLessons.toLocaleString()}
                <span className="text-slate-400">
                  /{stats.totalLessons.toLocaleString()} lessons
                </span>
              </span>
              <div className="flex items-center gap-1.5">
                <ProgressBar
                  completed={stats.completedLessons}
                  total={stats.totalLessons}
                  className="h-1.5 w-20"
                />
                <span className="text-indigo-600 font-semibold text-xs tabular-nums">
                  {percentLabel(stats.completedLessons, stats.totalLessons)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function AppLayout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <div className="sticky top-0 z-30">
        <Header />
      </div>
      <main className="w-full p-4 sm:p-6 flex-1">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
