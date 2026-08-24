import BookCover from "../BookCover.jsx";

export const EligibleBooks = ({ category, pools, seriesGroups, pick }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-slate-100">
        <span className="text-xs font-medium text-slate-500">
          {category === "standalone"
            ? `All eligible books (${pools.standalone.length})`
            : `All eligible series (${seriesGroups[category].length})`}
        </span>
      </div>
      <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
        {category === "standalone"
          ? pools.standalone.map((book) => (
              <div
                key={book.id}
                className={`w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors ${pick?.id === book.id ? "bg-blue-50" : ""}`}
              >
                <div className="w-7 h-10 rounded flex-shrink-0 overflow-hidden">
                  <BookCover book={book} className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-sm font-medium truncate ${pick?.id === book.id ? "text-blue-700" : "text-slate-800"}`}
                  >
                    {book.title}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {book.authorName}
                  </div>
                </div>
                {pick?.id === book.id && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                )}
              </div>
            ))
          : seriesGroups[category].map(
              ({ series, representativeBook, totalInSeries }) => {
                const isSelected = pick?.seriesName === series;
                return (
                  <div
                    key={series}
                    className={`w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors ${isSelected ? "bg-blue-50" : ""}`}
                  >
                    <div className="w-7 h-10 rounded flex-shrink-0 overflow-hidden">
                      <BookCover
                        book={representativeBook}
                        className="w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium truncate ${isSelected ? "text-blue-700" : "text-slate-800"}`}
                      >
                        {series}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {representativeBook.authorName} · {totalInSeries} books
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                  </div>
                );
              },
            )}
      </div>
    </div>
  );
};
