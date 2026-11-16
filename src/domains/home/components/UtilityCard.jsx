import { Link } from "react-router-dom";

/**
 * A home-page tile. With `to` it links to that utility and shows "Live";
 * without it (a utility that isn't built yet) it's a plain card marked "Soon".
 * `linked={false}` keeps the "Live" badge but drops the link, for content
 * that has its own buttons (a link can't contain a button).
 */
export function UtilityCard({
  icon: Icon,
  title,
  to,
  linked = true,
  children,
}) {
  const isLink = Boolean(to) && linked;
  const Root = isLink ? Link : "div";
  return (
    <Root
      {...(isLink && { to })}
      className={`group bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col flex-1 h-full lg:self-start ${isLink ? "hover:border-blue-300 hover:shadow-md transition-all" : ""}`}
    >
      <div className="flex items-center mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50">
          <Icon className="w-[18px] h-[18px] text-blue-600" />
        </div>

        <h3 className="ml-3 text-base font-bold text-slate-800">{title}</h3>

        <span
          className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-1 rounded-full ml-auto ${to ? "text-green-600 bg-green-50" : "text-slate-500 bg-slate-100"}`}
        >
          {to ? "Live" : "Soon"}
        </span>
      </div>

      {children}
    </Root>
  );
}

/** The pulsing placeholder a tile shows while its first fetch is in flight. */
export function UtilityCardSkeleton() {
  return (
    <div className="mt-3 space-y-3 animate-pulse" role="status">
      <div className="h-12 bg-slate-100 rounded-lg" />
      <div className="h-4 bg-slate-100 rounded w-3/4" />
      <div className="h-4 bg-slate-100 rounded w-1/2" />
      <div className="h-4 bg-slate-100 rounded w-2/3" />
    </div>
  );
}
