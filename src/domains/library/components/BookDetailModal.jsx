import { useLibrary } from "../context/LibraryContext";
import { X } from "lucide-react";
import StarRating from "./StarRating";
import BookCover from "./BookCover";
import EditBookForm from "./EditBookForm";

export default function BookDetailModal() {
  const {
    setIsEditingInDialog,
    selectedBook,
    setAuthor,
    isEditingInDialog,
    closeBookDialog,
  } = useLibrary();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={closeBookDialog}
    >
      <div
        className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {isEditingInDialog && <EditBookForm />}
        {!isEditingInDialog && (
          <div>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
              <div className="font-semibold text-slate-700 text-sm truncate pr-4">
                Book Details
              </div>
              <button
                onClick={closeBookDialog}
                className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            <div className="flex gap-4 px-4 pt-4 pb-3">
              <div className="w-20 h-28 rounded-lg flex-shrink-0 overflow-hidden shadow-md border border-slate-100">
                <BookCover book={selectedBook} className="w-full h-full" />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <h3 className="text-base font-bold text-slate-800 leading-snug">
                  {selectedBook.title}
                </h3>
                <button
                  onClick={() => {
                    closeBookDialog();
                    setAuthor(selectedBook.authorName);
                  }}
                  className="text-sm text-blue-600 hover:underline mt-0.5 text-left"
                >
                  {selectedBook.authorName}
                </button>
                {selectedBook.seriesName && (
                  <div className="mt-1.5">
                    <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                      {selectedBook.seriesName}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-4 pb-4">
              <div className="mt-3 flex items-center gap-2">
                <StarRating
                  value={selectedBook.rating || 0}
                  //   onChange={
                  //     selectedBook.status === "read"
                  //       ? (r) => {
                  //           const u = { ...selectedBook, rating: r };
                  //           setSelectedBook(u);
                  //           setBooks(
                  //             books.map((b) =>
                  //               b.id === selectedBook.id ? u : b,
                  //             ),
                  //           );
                  //         }
                  //       : null
                  //   }
                  readonly={selectedBook.status !== "READ"}
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 bg-slate-50 rounded-xl p-3">
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-0.5">Pages</div>
                  <div className="text-base font-bold text-slate-800">
                    {selectedBook.pages}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-0.5">Started</div>
                  <div className="text-base font-bold text-slate-800">
                    {selectedBook.startDate
                      ? new Date(selectedBook.startDate).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )
                      : "—"}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-400 mb-0.5">Finished</div>
                  <div className="text-base font-bold text-slate-800">
                    {selectedBook.endDate
                      ? new Date(selectedBook.endDate).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric", year: "numeric" },
                        )
                      : "—"}
                  </div>
                </div>
              </div>

              {selectedBook.isbn && (
                <div className="mt-2 text-xs text-slate-400">
                  ISBN: {selectedBook.isbn}
                </div>
              )}

              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setIsEditingInDialog(true)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  //   onClick={() => {
                  //     if (window.confirm("Delete this book?"))
                  //       deleteBook(selectedBook.id);
                  //   }}
                  className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
