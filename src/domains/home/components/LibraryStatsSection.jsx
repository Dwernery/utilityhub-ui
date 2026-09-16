import { Book, BookOpen, CalendarDays, Star } from "lucide-react";

export function LibraryStatsSection({label, booksRead,pages, avgRating}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
        <span className="flex items-center gap-1 font-semibold">
          <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
          {label}
        </span>
      </div>

      <div className="grid grid-cols-3 text-center divide-x divide-slate-100">
        <div>
          <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-800">
            <Book className="w-3.5 h-3.5 text-slate-400" />
            {booksRead}
          </div>
          <div className="text-[11px] text-slate-400">Books</div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-800">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            {pages.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400">Pages</div>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1 text-lg font-bold text-slate-800">
            <Star className="w-3.5 h-3.5 text-slate-400" />
            {avgRating}
          </div>
          <div className="text-[11px] text-slate-400">Avg Rating</div>
        </div>
      </div>
    </div>
  );
}
