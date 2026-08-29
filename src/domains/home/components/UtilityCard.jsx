import { Link } from "react-router-dom";

/**
 * Shared card shell for the homepage's utility tiles.
 * Pass `to` for a "live" utility (renders as a clickable Link with a
 * highlighted badge); omit it for a "coming soon" placeholder tile.
 */
export function UtilityCard({
  icon: Icon,
  title,
  badgeLabel,
  to,
  className = "",
  children,
}) {
  const isLive = Boolean(to);

  const content = (
    <>
      <div className="flex items-center mb-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isLive ? "bg-blue-50" : "bg-slate-100"
          }`}
        >
          <Icon
            className={`w-5 h-5 ${isLive ? "text-blue-600" : "text-slate-400"}`}
          />
        </div>
        <h3
          className={`ml-3 text-base font-bold ${isLive ? "text-slate-800" : "text-slate-500"}`}
        >
          {title}
        </h3>
        {badgeLabel && (
          <span
            className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full ml-auto ${
              isLive
                ? "text-green-600 bg-green-50"
                : "text-slate-400 bg-slate-100"
            }`}
          >
            {badgeLabel}
          </span>
        )}
      </div>
      {children}
    </>
  );

  if (isLive) {
    return (
      <Link
        to={to}
        className={`group bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col flex-1 hover:border-blue-300 hover:shadow-md transition-all ${className}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div
      className={`bg-white/60 rounded-xl border border-dashed border-slate-300 p-5 flex flex-col flex-1 ${className}`}
    >
      {content}
    </div>
  );
}
