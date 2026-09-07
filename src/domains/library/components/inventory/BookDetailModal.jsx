import { useState } from "react";
import { useLibrary } from "../../context/LibraryContext";
import { X } from "lucide-react";
import StarRating from "../StarRating";
import BookCover from "../BookCover";
import EditBookForm from "./EditBookForm";
import Modal from "../Modal";
import { useUpdateBook } from "../../hooks/useUpdateBook";
import { useDeleteBook } from "../../hooks/useDeleteBook";
import { useToast } from "../../../../context/ToastContext";
import { formatDate } from "../../utils/dateUtils";

export default function BookDetailModal() {
  const {
    setIsEditingInDialog,
    selectedBook,
    setAuthor,
    isEditingInDialog,
    closeBookDialog,
  } = useLibrary();
  const updateBookMutation = useUpdateBook();
  const deleteBookMutation = useDeleteBook();
  const addToast = useToast();
  // Optimistic rating shown while the mutation is in flight. Kept entirely
  // local (rather than written back into shared context state) so a rollback
  // can never resurrect a closed/different book dialog.
  const [optimisticRating, setOptimisticRating] = useState(null);

  const handleRatingChange = (nextRating) => {
    if (!selectedBook?.id) return;

    const bookId = selectedBook.id;
    const bookTitle = selectedBook.title;
    setOptimisticRating(nextRating);

    updateBookMutation.mutate(
      { id: bookId, rating: nextRating },
      {
        onSuccess: () => {
          addToast(`Rated "${bookTitle}" ${nextRating}/5`, "success");
        },
        onError: (err) => {
          addToast(
            `Failed to save rating: ${err?.message || "Unknown error"}`,
            "error",
          );
        },
        onSettled: () => {
          setOptimisticRating(null);
        },
      },
    );
  };

  const handleDeleteBook = () => {
    if (!selectedBook?.id) return;

    const confirmed = window.confirm(
      `Delete "${selectedBook.title}" from your library?`,
    );
    if (!confirmed) return;

    deleteBookMutation.mutate(selectedBook.id, {
      onSuccess: () => {
        addToast(`Deleted "${selectedBook.title}"`, "success");
        closeBookDialog();
      },
      onError: (err) => {
        addToast(
          `Failed to delete book: ${err?.message || "Unknown error"}`,
          "error",
        );
      },
    });
  };

  return (
    <Modal
      onClose={closeBookDialog}
      panelClassName="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 shadow-2xl"
    >
      {isEditingInDialog && <EditBookForm />}
      {!isEditingInDialog && (
        <div>
          <div className="sticky top-0 bg-white border-b border-slate-100 px-4 sm:px-5 py-3.5 flex items-center justify-between">
            <div className="font-bold text-slate-800 text-base sm:text-lg truncate pr-4">
              Book Details
            </div>
            <button
              onClick={closeBookDialog}
              className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 hover:cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          <div className="flex gap-4 sm:gap-6 px-4 sm:px-5 pt-5 sm:pt-6 pb-4">
            <div className="w-24 h-36 sm:w-32 sm:h-48 rounded-lg sm:rounded-xl flex-shrink-0 overflow-hidden shadow-sm ring-1 ring-slate-200">
              {" "}
              <BookCover book={selectedBook} className="w-full h-full " />
            </div>
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-tight">
                {" "}
                {selectedBook.title}
              </h3>
              <button
                onClick={() => {
                  closeBookDialog();
                  setAuthor(selectedBook.authorName);
                }}
                className="text-sm sm:text-base text-blue-600 hover:underline text-left mt-0.5"
              >
                {selectedBook.authorName}
              </button>
              {selectedBook.seriesName && (
                <span className="text-xs sm:text-sm text-blue-600 truncate">
                  {selectedBook.seriesName}
                </span>
              )}

              <div className="flex items-center gap-2 sm:gap-3 mt-2.5">
                <StarRating
                  value={optimisticRating ?? selectedBook.rating ?? 0}
                  onChange={handleRatingChange}
                  readonly={
                    selectedBook.status !== "READ" ||
                    updateBookMutation.isPending
                  }
                />

                {selectedBook.status === "READ" && (
                  <span className="inline-flex items-center rounded-full bg-green-50 px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-green-700 whitespace-nowrap">
                    ✓ Finished
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="px-4 pb-4">
            <div className="mt-1 grid grid-cols-3 divide-x divide-slate-200 bg-slate-50 rounded-xl sm:rounded-2xl px-1 sm:px-4 py-4 sm:py-5">
              <div className="text-center px-1 sm:px-2">
                <div className="text-xs sm:text-sm text-slate-500 mb-1">
                  Pages
                </div>
                <div className="text-xs sm:text-lg font-bold text-slate-800 whitespace-nowrap">
                  {selectedBook.pages}
                </div>
              </div>
              <div className="text-center px-1 sm:px-2">
                <div className="text-xs sm:text-sm text-slate-500 mb-1">
                  Started
                </div>
                <div className="text-xs sm:text-lg font-bold text-slate-800 whitespace-nowrap">
                  {formatDate(selectedBook.startDate)}
                </div>
              </div>
              <div className="text-center px-1 sm:px-2">
                <div className="text-xs sm:text-sm text-slate-500 mb-1">
                  Finished
                </div>
                <div className="text-xs sm:text-lg font-bold text-slate-800 whitespace-nowrap">
                  {formatDate(selectedBook.endDate)}
                </div>
              </div>
            </div>

            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-5 pt-4 sm:pt-5 border-t border-slate-100">
              <button
                onClick={() => setIsEditingInDialog(true)}
                disabled={deleteBookMutation.isPending}
                className="flex-1 bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
              >
                Edit Book
              </button>
              <button
                onClick={handleDeleteBook}
                className="bg-red-50 text-red-600 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold hover:bg-red-100 transition-colors disabled:opacity-60"
                disabled={deleteBookMutation.isPending}
              >
                {deleteBookMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
