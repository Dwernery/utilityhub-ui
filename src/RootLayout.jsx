import { Outlet, useLocation } from "react-router-dom";

export default function RootLayout() {
  const { pathname } = useLocation();
  // The MCU tracker is a full-bleed, edge-to-edge dark experience — it
  // manages its own background/spacing, so skip the shared light shell.
  const isFullBleed = pathname.startsWith("/mcu");

  if (isFullBleed) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <Outlet />
      </div>
    </div>
  );
}
