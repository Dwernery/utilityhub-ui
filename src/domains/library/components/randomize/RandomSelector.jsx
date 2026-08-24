import BookCover from "../BookCover.jsx";
import { Book, Shuffle, Play, RotateCcw } from "lucide-react";

export const RandomSelector = ({
  pick,
  counts,
  category,
  roll,
  seriesSizes,
  isSpinning,
  onStartReading,
}) => {
  const selectedBook = pick?.type === "series" ? pick.firstBook : pick;
  const booksInSeries = pick?.type === "series" ? (pick.books ?? []) : [];

  return (
    <>
      {!pick ? (
        <div className="bg-white rounded-xl border border-slate-200 py-12 text-center shadow-sm">
          <Shuffle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 mb-5">
            {counts[category]} {category === "standalone" ? "book" : "series"}
            {counts[category] !== 1 && category === "standalone" ? "s" : ""} to
            choose from
          </p>
          <button
            onClick={roll}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <Shuffle className="w-4 h-4" /> Pick for me
          </button>
        </div>
      ) : (
        <div
          className={`bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-opacity duration-200 ${isSpinning ? "opacity-40" : "opacity-100"}`}
        >
          <div className="flex gap-4 p-4">
            <div className="w-20 h-28 rounded-lg flex-shrink-0 overflow-hidden shadow-md border border-slate-100">
              <BookCover book={selectedBook} className="w-full h-full" />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="text-base font-bold text-slate-800 leading-snug">
                {pick.title}
              </h3>
              <h3 className="text-sm text-blue-600 mt-0.5 text-left">
                {pick.authorName}
              </h3>
              {pick.seriesName && (
                <div className="mt-1.5 flex flex-wrap gap-1.5 items-center">
                  <span className="text-xs text-slate-400">
                    {seriesSizes[pick.seriesName]} books in the series
                  </span>
                </div>
              )}
              <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                <Book className="w-3.5 h-3.5" />
                {pick.books
                  .reduce((sum, book) => sum + (book.pages || 0), 0)
                  .toLocaleString()}p
              </div>
            </div>
          </div>

          {booksInSeries.length > 0 && (
            <div className="px-4 pb-3">
              <div className="space-y-1.5">
                {booksInSeries.map((book, index) => (
                  <div
                    key={book.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm"
                  >
                    <span className="min-w-0 truncate text-slate-700">
                      {index + 1}. {book.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 px-4 pb-4">
            <button
              onClick={onStartReading}
              disabled={isSpinning}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-white" /> Start reading
            </button>
            <button
              onClick={roll}
              disabled={isSpinning}
              className="bg-slate-100 text-slate-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <RotateCcw
                className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`}
              />{" "}
              Reroll
            </button>
          </div>
        </div>
      )}
    </>
  );
};
