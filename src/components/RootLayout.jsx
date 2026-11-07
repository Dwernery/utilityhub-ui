import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function RootLayout() {
  const { pathname } = useLocation();
  const isFullBleed =
    pathname.startsWith("/mcu") ||
    pathname.startsWith("/finances") ||
    pathname.startsWith("/library");
  const isMcuPage = pathname.startsWith("/mcu");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const htmlEl = document.documentElement;
    if (isMcuPage) {
      htmlEl.classList.add("mcu-page");
    } else {
      htmlEl.classList.remove("mcu-page");
    }
  }, [isMcuPage]);

  if (isFullBleed) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen pt-3 px-4 sm:px-5 lg:px-4">
      <div className="max-w-[96rem] mx-auto">
        <Outlet />
      </div>
    </div>
  );
}
