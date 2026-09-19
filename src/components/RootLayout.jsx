import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function RootLayout() {
  const { pathname } = useLocation();
  const isFullBleed =
    pathname.startsWith("/mcu") ||
    pathname.startsWith("/finances") ||
    pathname.startsWith("/library");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const htmlEl = document.documentElement;
    if (isFullBleed) {
      htmlEl.classList.add("mcu-page");
    } else {
      htmlEl.classList.remove("mcu-page");
    }
  }, [isFullBleed]);

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
