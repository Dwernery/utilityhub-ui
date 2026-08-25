import { CheckCircle2 } from "lucide-react";
import StarRating from "../StarRating";
import { formatDate, parseLocalDate } from "../../utils/dateUtils";

export const BooksPerYearDetails = ({
  metrics,
  selectedReadingYear,
  setSelectedReadingYear,
  books,
}) => {
  const filteredBooks = books.filter(
    (b) =>
      b.status === "READ" &&
      b.endDate &&
      parseLocalDate(b.endDate).getFullYear() === selectedReadingYear,
  );
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800 text-sm">
          {selectedReadingYear}
        </h2>
        <button
          onClick={() => setSelectedReadingYear(null)}
          className="text-xs text-slate-400 hover:text-slate-600"
        >
          Clear
        </button>
      </div>
      <div className="px-4 pt-3 pb-2">
        <div className="text-xs text-slate-400 mb-2">By month</div>
        <div className="space-y-1.5">
          {monthNames.map((month, idx) => {
            const md = metrics.byMonth[idx];
            const maxB = Math.max(
              ...Object.values(metrics.byMonth).map((m) => m?.books || 0),
              1,
            );
            const bw = md ? (md.books / maxB) * 100 : 0;
            return (
              <div key={month} className="flex items-center gap-2">
                <div className="w-7 text-xs text-slate-400">{month}</div>
                <div className="flex-1 bg-slate-100 rounded h-5 overflow-hidden">
                  {md && (
                    <div
                      className="bg-blue-400 h-full rounded flex items-center px-2 transition-all duration-300"
                      style={{ width: `${bw}%` }}
                    >
                      {bw > 20 && (
                        <span className="text-xs font-semibold text-white">
                          {md.books}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {md && bw <= 20 && (
                  <div className="text-xs text-slate-500 w-4">{md.books}</div>
                )}
                {!md && <div className="text-xs text-slate-300 w-4">—</div>}
              </div>
            );
          })}
        </div>
      </div>
      <div className="border-t border-slate-100">
        <div className="px-4 py-2 text-xs text-slate-400">
          {filteredBooks.length} books finished
        </div>
        <div className="divide-y divide-slate-100">
          {[...filteredBooks]
            .sort(
              (a, b) => parseLocalDate(b.endDate) - parseLocalDate(a.endDate),
            )
            .map((book) => {
              const days =
                book.startDate && book.endDate
                  ? Math.ceil(
                      (parseLocalDate(book.endDate) -
                        parseLocalDate(book.startDate)) /
                        86400000,
                    )
                  : null;
              return (
                <div
                  key={book.id}
                  className="px-4 py-2.5 flex items-center gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate">
                      {book.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">
                        {book.authorName}
                      </span>
                      {book.rating > 0 && (
                        <StarRating value={book.rating} readonly size="sm" />
                      )}
                    </div>
                    {(book.startDate || book.endDate) && (
                      <div className="text-xs text-slate-400 mt-1 truncate">
                        {formatDate(book.startDate)} —{" "}
                        {formatDate(book.endDate)}
                      </div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-slate-400">{book.pages}p</div>
                    {days !== null && (
                      <div className="text-xs text-slate-300">{days}d</div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
