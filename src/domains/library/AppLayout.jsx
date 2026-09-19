import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import { LibraryProvider } from "./context/LibraryContext";

function LayoutContent() {
  return (
    <>
      <Header />
      <main className="w-full p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </>
  );
}

export function AppLayout() {
  return (
    <LibraryProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <LayoutContent />
      </div>
    </LibraryProvider>
  );
}
