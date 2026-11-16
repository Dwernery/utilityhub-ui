import { FinancesHomeCard } from "../components/FinancesHomeCard";
import { LibraryHomeCard } from "../components/LibraryHomeCard";
import { McuHomeCard } from "../components/McuHomeCard";
import { CoursesHomeCard } from "../components/CoursesHomeCard";
import { Lock } from "lucide-react";
import { clearApiToken } from "../../../lib/apiToken";

// For a shared or borrowed computer: forgets the token, so the app is locked
// until it is entered again.
function lockThisDevice() {
  if (
    window.confirm(
      "Forget the access token on this device? You'll need to enter it again to use the app.",
    )
  ) {
    clearApiToken();
  }
}

export function Home() {
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
          <button
            type="button"
            onClick={lockThisDevice}
            title="Forget the access token on this device"
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 hover:cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            Lock
          </button>
        </div>
        <div className="mt-3 border-b border-slate-200" />
      </div>
      <div className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <LibraryHomeCard />
          <McuHomeCard />
          <CoursesHomeCard />
        </div>
        <FinancesHomeCard />
      </div>
    </div>
  );
}
