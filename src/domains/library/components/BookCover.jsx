import { Book } from "lucide-react";
import { useState } from "react";

export default function BookCover({ book, className = "" }) {
  const [src, setSrc] = useState(null);

  if (src)
    return (
      <img
        src={src}
        alt={book.title}
        className={`object-cover ${className}`}
        onError={() => setSrc(null)}
      />
    );
  return (
    <div
      className={`bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center ${className}`}
    >
      <Book className="w-8 h-8 text-slate-400" />
    </div>
  );
}
