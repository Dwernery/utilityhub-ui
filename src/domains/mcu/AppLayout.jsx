import { Outlet } from "react-router-dom";
import { Header } from "./components/Header";

export function AppLayout() {
  return (
    <div className="fixed inset-0 flex flex-col text-slate-50 bg-slate-900 overflow-y-auto">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
