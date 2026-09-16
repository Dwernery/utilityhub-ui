import { LibraryHomeCard } from "../components/LibraryHomeCard";
import { MCUHomeCard } from "../components/MCUHomeCard";

export default function Home() {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="Project SHIELD" className="w-14 h-14" />
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-600">
              Personal Utility Suite
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
              Project SHIELD
            </h1>
            <p className="text-sm text-slate-500">
              Your personal command center
            </p>
          </div>
        </div>
        <div className="mt-5 border-b border-slate-200" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
        <LibraryHomeCard />
        <MCUHomeCard />
      </div>
    </div>
  );
}
