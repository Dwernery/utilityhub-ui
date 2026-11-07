import { FinancesHomeCard } from "../components/FinancesHomeCard";
import { LibraryHomeCard } from "../components/LibraryHomeCard";
import { MCUHomeCard } from "../components/MCUHomeCard";
import { CoursesHomeCard } from "../components/CoursesHomeCard";

export default function Home() {
  return (
    <div className="pb-8 md:pb-6 lg:pb-0">
      <div className="mb-3">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Project SHIELD" className="w-12 h-12" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-800">
              Project SHIELD
            </h1>
            <p className="text-xs text-slate-500">
              Your personal command center
            </p>
          </div>
        </div>
        <div className="mt-3 border-b border-slate-200" />
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <LibraryHomeCard />
          <MCUHomeCard />
          <CoursesHomeCard />
        </div>
        <FinancesHomeCard />
      </div>
    </div>
  );
}
