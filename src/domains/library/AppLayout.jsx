import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import { LibraryProvider } from "./context/LibraryContext";

function LayoutContent() {
  return (
    <div className="flex flex-col w-full min-h-dvh">
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

export function AppLayout() {
  return (
    <LibraryProvider>
      <div className="min-h-dvh flex flex-col">
        <LayoutContent />
      </div>
    </LibraryProvider>
  );
}
