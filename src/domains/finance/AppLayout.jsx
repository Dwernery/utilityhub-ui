import { Outlet } from "react-router-dom";
import { Header } from "./components/Header";

export function AppLayout() {
  return (
    <div className="min-h-dvh flex flex-col">
      <div className="sticky top-0 z-30">
        <Header />
      </div>
      <main className="w-full p-4 sm:px-6 md:px-6 pb-0 flex-1">
        <div className="max-w-7xl mx-auto flex flex-col">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
