import { TvMinimalPlay } from "lucide-react";
import BookCover from "../../library/components/BookCover";

export function MCUCurrentlyWatching({ content }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-3">
        <TvMinimalPlay className="w-3.5 h-3.5 text-slate-400" />
        Currently Watching
      </div>

      {content.length > 0 ? (
        <div className="space-y-3">
          {content.slice(0, 4).map((item) => 
            {
              return (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-10 h-15 rounded-md flex-shrink-0 overflow-hidden ring-1 ring-slate-200">
                    <BookCover book={item} className="w-full h-full" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-sm font-medium text-slate-700 truncate">
                        {item.type === "MOVIE" ? item.title : item.showTitle}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${50}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <span className="text-xs text-slate-400 truncate">
                        {item.type === "MOVIE" ? "" : item.title}
                      </span>
                    </div>
                  </div>
                </div>
              );
          })}

          {content.length > 4 && (
            <div className="text-xs text-slate-400">
              +{content.length - 4} more in progress
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-slate-400">Nothing in progress right now.</p>
      )}
    </div>
  );
}
