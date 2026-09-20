import { Outlet } from "react-router-dom";
import { Header } from "./components/Header";

export function AppLayout() {
  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col overflow-hidden">
      <Header />
      <main className="w-full p-4 sm:p-6 pb-24 md:pb-6 flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto flex flex-col lg:h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
