import {
  TrendingUp,
  DollarSign,
  BarChart3,
  Target,
  ArrowLeft,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const location = useLocation();

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "income-expenses", label: "Income & Expenses", icon: DollarSign },
    { id: "income-history", label: "Income History", icon: TrendingUp },
    { id: "ai-assistant", label: "AI Assistant", icon: Target },
  ];
  const activeTab =
    navItems.find((item) => `/finances/${item.id}` === location.pathname)?.id ||
    "dashboard";

  return (
    <>
      <div className="w-full px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <nav className="bg-white border border-slate-200 border-t-0 rounded-xl shadow-sm hidden md:block">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to="/"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                  aria-label="Home"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="h-8 w-1 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
                <h1 className="whitespace-nowrap text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Finances
                </h1>
              </div>

              <div className="flex items-center min-w-0">
                <div className="flex gap-1 min-w-0">
                  {navItems.map(({ id, label, icon: Icon }) => (
                    <Link
                      key={id}
                      to={`/finances/${id}`}
                      className={`flex items-center gap-1.5 px-2.5 lg:px-4 py-2 rounded-lg font-medium text-sm lg:text-base whitespace-nowrap transition-all ${
                        activeTab === id
                          ? "bg-blue-600 text-white shadow-md"
                          : "text-slate-600 hover:bg-slate-100 hover:cursor-pointer"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="hidden sm:inline">{label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden w-full px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-slate-200 border-t-0 rounded-xl shadow-sm">
            <div className="flex items-center justify-between px-4 h-14">
              <div className="flex items-center gap-2">
                <Link
                  to="/"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                  aria-label="Home"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="h-6 w-1 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  My Finances
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40">
        <div className="flex">
          {navItems.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            return (
              <Link
                key={id}
                to={`/finances/${id}`}
                className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors relative ${active ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
              >
                <Icon size={22} />
                <span className="text-[10px] font-medium">
                  {label.split(" ")[0]}
                </span>
                {active && (
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};
