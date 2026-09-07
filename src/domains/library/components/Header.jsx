import { ArrowLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useBooks } from "../hooks/useBooks";

export default function Header() {
  const location = useLocation();
  const { data: books = [] } = useBooks();

  const tabMapping = {
    "/library/inventory": "Inventory",
    "/library/metrics": "Metrics",
    "/library/randomize": "Randomize",
  };

  const activeTab = tabMapping[location.pathname] || "Inventory";
  const totalBooks = books.length;
  const booksRead = books.filter((b) => b.status === "READ").length;
  const percentageComplete =
    totalBooks > 0 ? Math.round((booksRead / totalBooks) * 100) : 0;

  return (
    <div className="mb-4 bg-white rounded-xl shadow-sm p-4 border border-slate-200">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
              aria-label="Home"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <h1 className="text-xl font-bold text-slate-800">My Books</h1>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-500">
              {booksRead}
              <span className="text-slate-400">/{totalBooks}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <div className="w-20 bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${percentageComplete}%` }}
                />
              </div>

              <span className="text-blue-600 font-semibold text-xs">
                {percentageComplete}%
              </span>
            </div>
          </div>
        </div>

        {/* Section navigation */}
        <div className="flex gap-1 border-b border-slate-200">
          {["Inventory", "Metrics", "Randomize"].map((label) => (
            <Link
              key={label}
              to={`/library/${label.toLowerCase()}`}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === label
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
