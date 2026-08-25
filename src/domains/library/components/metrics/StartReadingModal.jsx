import { Search, X } from "lucide-react";
import BookCover from "../BookCover";
import Modal from "../Modal";
import { useState } from "react";
import { useStartReading } from "../../hooks/useStartReading";

export const StartReadingModal = ({ setShowAddCurrentlyReading, books }) => {
  const [currentlyReadingSearch, setCurrentlyReadingSearch] = useState("");
  const { startReading, isPending } = useStartReading();

  const handleStart = (book) => {
    startReading(book, {
      onSuccess: () => {
        setShowAddCurrentlyReading(false);
        setCurrentlyReadingSearch("");
      },
    });
  };

  return (
    <Modal
      onClose={() => setShowAddCurrentlyReading(false)}
      overlayClassName="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      panelClassName="bg-white w-full sm:rounded-xl sm:max-w-3xl max-h-[85vh] overflow-y-auto"
    >
      <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <h2 className="font-semibold text-slate-800">Start Reading</h2>
        <button
          onClick={() => {
            setShowAddCurrentlyReading(false);
            setCurrentlyReadingSearch("");
          }}
        >
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>
      <div className="p-4">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search title, author…"
            value={currentlyReadingSearch}
            onChange={(e) => setCurrentlyReadingSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          {books
            .filter((b) => b.status === "UNREAD")
            .filter(
              (b) =>
                !currentlyReadingSearch ||
                b.title
                  .toLowerCase()
                  .includes(currentlyReadingSearch.toLowerCase()) ||
                b.authorName
                  .toLowerCase()
                  .includes(currentlyReadingSearch.toLowerCase()),
            )
            .sort((a, b) => a.title.localeCompare(b.title))
            .map((book) => (
              <button
                key={book.id}
                onClick={() => handleStart(book)}
                disabled={isPending}
                className="w-full text-left flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-60 disabled:pointer-events-none"
              >
                <div className="w-9 h-12 rounded flex-shrink-0 overflow-hidden">
                  <BookCover book={book} className="w-full h-full" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {book.title}
                  </div>
                  <div className="text-xs text-slate-500">
                    {book.authorName}
                  </div>
                  {book.seriesName && (
                    <div className="text-xs text-blue-500 mt-0.5">
                      {book.seriesName}
                    </div>
                  )}
                </div>
              </button>
            ))}
        </div>
      </div>
    </Modal>
  );
};
