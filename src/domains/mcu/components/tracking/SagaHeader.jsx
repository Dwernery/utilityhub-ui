import { ChevronDown, ChevronRight } from "lucide-react";

export function SagaHeader({
  title,
  subtitle,
  color,
  percentage,
  expanded,
  onToggle,
}) {
  const clickable = typeof onToggle === "function";

  return (
    <div
      className={`flex justify-between items-center border-b-4 pb-3 mb-3.5 ${
        clickable ? "cursor-pointer select-none" : ""
      }`}
      style={{ borderColor: color }}
      onClick={onToggle}
      role={clickable ? "button" : undefined}
    >
      <div className="flex items-center gap-2">
        {clickable &&
          (expanded ? (
            <ChevronDown size={18} color={color} />
          ) : (
            <ChevronRight size={18} color={color} />
          ))}
        <div>
          <div
            className="text-lg font-extrabold tracking-tight"
            style={{
              color,
              textShadow: `0 0 24px ${color}66`,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="w-20 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-400 to-violet-400"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div
          className="text-lg font-extrabold min-w-[2.5rem] text-right"
          style={{ color }}
        >
          {percentage}%
        </div>
      </div>
    </div>
  );
}
