import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import { LibraryProvider } from "./context/LibraryContext";

function LayoutContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default function AppLayout() {
  return (
    <LibraryProvider>
      <LayoutContent />
    </LibraryProvider>
  );
}
