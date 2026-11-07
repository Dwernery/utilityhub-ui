import { Outlet } from "react-router-dom";
import { Header } from "./components/Header";

export function AppLayout() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <main className="w-full p-4 sm:px-6 md:px-6 pb-0 flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto flex flex-col lg:h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
