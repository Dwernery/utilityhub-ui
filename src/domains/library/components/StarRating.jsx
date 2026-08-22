import { useState } from "react";
import { Star } from "lucide-react";

export default function StarRating({
  value = 0,
  onChange,
  readonly = false,
  size = "md",
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(n === value ? 0 : n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          className={readonly ? "cursor-default" : "cursor-pointer"}
        >
          <Star
            className={`${size === "sm" ? "w-3.5 h-3.5" : "w-5 h-5"} transition-colors ${n <= (hover || value) ? "fill-amber-400 text-amber-400" : "fill-none text-slate-300"}`}
          />
        </button>
      ))}
    </div>
  );
}
