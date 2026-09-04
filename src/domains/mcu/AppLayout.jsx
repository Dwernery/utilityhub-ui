import { Outlet } from "react-router-dom";
import { Header } from "./components/Header";

export function AppLayout() {
  return (
    <div className="min-h-screen text-slate-50 bg-slate-900">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
