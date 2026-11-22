import { FinancesHomeCard } from "../components/FinancesHomeCard";
import { LibraryHomeCard } from "../components/LibraryHomeCard";
import { McuHomeCard } from "../components/McuHomeCard";
import { CoursesHomeCard } from "../components/CoursesHomeCard";
import { useState } from "react";
import { Fingerprint, LogOut } from "lucide-react";
import { logout } from "../../../lib/http";
import { passkeysSupported } from "../../../lib/passkey";
import { SetUpTouchIdModal } from "../components/SetUpTouchIdModal";

const toolbarButton =
  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-700 hover:bg-slate-100 hover:cursor-pointer";

// Ends this browser's session (the cookie is cleared); the sign-in screen comes back.
function signOut() {
  if (window.confirm("Sign out on this device?")) {
    logout().catch(() => {
      // Couldn't reach the server: this tab is signed out anyway, though the
      // cookie stays valid until it expires.
    });
  }
}

export function Home() {
  const [settingUpTouchId, setSettingUpTouchId] = useState(false);

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
          <div className="ml-auto flex items-center gap-1">
            {passkeysSupported() && (
              <button
                type="button"
                onClick={() => setSettingUpTouchId(true)}
                title="Sign in with Touch ID on this computer"
                className={toolbarButton}
              >
                <Fingerprint className="w-3.5 h-3.5" />
                Set up Touch ID
              </button>
            )}
            <button
              type="button"
              onClick={signOut}
              title="Sign out on this device"
              className={toolbarButton}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
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
      {settingUpTouchId && (
        <SetUpTouchIdModal onClose={() => setSettingUpTouchId(false)} />
      )}
    </div>
  );
}
