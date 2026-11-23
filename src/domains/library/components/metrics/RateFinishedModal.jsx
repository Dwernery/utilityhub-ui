import { X } from "lucide-react";
import { Modal } from "../../../../components/Modal";
import { useToast } from "../../../../context/ToastContext";
import { useUpdateBook } from "../../hooks";
import { BookCover } from "../BookCover";
import { StarRating } from "../StarRating";

/**
 * Shown right after "Done" in Currently Reading, so rating a book doesn't take a trip to its
 * details. Like the iPhone app, which opens the book's sheet with the same prompt.
 */
export function RateFinishedModal({ book, onClose }) {
  const updateBook = useUpdateBook();
  const addToast = useToast();

  const rate = (rating) => {
    if (!rating) return;
    updateBook.mutate(
      { id: book.id, rating },
      {
        onSuccess: () => {
          addToast(`Rated "${book.title}" ${rating}/5`, "success");
          onClose();
        },
        onError: (err) =>
          addToast(
            `Failed to save rating: ${err?.message || "Unknown error"}`,
            "error",
          ),
      },
    );
  };

  return (
    <Modal
      onClose={onClose}
      panelClassName="bg-white w-full max-w-sm rounded-xl shadow-xl"
    >
      <div className="flex items-start justify-between px-4 pt-4">
        <h2 className="font-semibold text-slate-800">Finished! How was it?</h2>
        <button type="button" onClick={onClose} aria-label="Close">
          <X className="w-5 h-5 text-slate-400" />
        </button>
      </div>
      <div className="flex items-center gap-3 px-4 py-4">
        <div className="w-12 h-18 rounded-md flex-shrink-0 overflow-hidden shadow-sm ring-1 ring-slate-200">
          <BookCover book={book} className="w-full h-full" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-slate-800 truncate">
            {book.title}
          </div>
          <div className="text-xs text-slate-400 truncate mb-2">
            {book.authorName}
          </div>
          <StarRating
            value={updateBook.variables?.rating ?? 0}
            onChange={rate}
            readonly={updateBook.isPending}
          />
        </div>
      </div>
      <div className="px-4 pb-4 text-right">
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-medium text-slate-500 hover:text-slate-700 cursor-pointer"
        >
          Not now
        </button>
      </div>
    </Modal>
  );
}
