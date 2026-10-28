import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import { LibraryProvider } from "./context/LibraryContext";

function LayoutContent() {
  return (
    <div className="flex flex-col w-full h-full">
      <Header />
      <main className="w-full p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto">
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
      <div className="h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col overflow-hidden">
        <LayoutContent />
      </div>
    </LibraryProvider>
  );
}
