import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import BookCover from "../BookCover";
import StarRating from "../StarRating";
import Modal from "../Modal";
import { useBooks } from "../../hooks/useBooks";

export default function AuthorDetailModal({ author, onClose, onBookClick }) {
  const { data: books = [] } = useBooks();

  const authorBooks = books.filter((b) => b.authorName === author);
  const readBooks = authorBooks.filter((b) => b.status === "READ");
  const totalPages = readBooks.reduce((s, b) => s + (b.pages || 0), 0);
  const ratedBooks = readBooks.filter((b) => b.rating > 0);
  const avgRating = ratedBooks.length
    ? (
        ratedBooks.reduce((s, b) => s + b.rating, 0) / ratedBooks.length
      ).toFixed(1)
    : null;

  return (
    <Modal
      onClose={onClose}
      overlayClassName="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      panelClassName="bg-white w-full sm:rounded-xl sm:max-w-3xl max-h-[90vh] overflow-y-auto"
    >
      <div className="sticky top-0 bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-800 truncate">{author}</div>
          <div className="text-xs text-slate-500">
            {authorBooks.length} books · {readBooks.length} read
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-px bg-slate-100 border-b border-slate-100">
        {[
          ["Read", readBooks.length],
          ["Pages", totalPages.toLocaleString()],
          ["Avg ★", avgRating ?? "—"],
        ].map(([label, val]) => (
          <div key={label} className="bg-white px-4 py-3 text-center">
            <div className="text-lg font-bold text-slate-800">{val}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </div>
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {authorBooks.map((book) => (
          <button
            key={book.id}
            onClick={() => onBookClick(book)}
            className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
          >
            <div className="w-10 h-14 rounded flex-shrink-0 overflow-hidden">
              <BookCover book={book} className="w-full h-full" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-800 truncate">
                {book.title}
              </div>
              {book.seriesName && (
                <div className="text-xs text-blue-500 truncate">
                  {book.seriesName}
                </div>
              )}
              <div className="flex items-center gap-2 mt-1">
                {book.status === "READ" && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                )}
                {book.status === "IN_PROGRESS" && (
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-400 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  </div>
                )}
                {book.status === "UNREAD" && (
                  <Circle className="w-3.5 h-3.5 text-slate-300" />
                )}
                {book.rating > 0 && (
                  <StarRating value={book.rating} readonly size="sm" />
                )}
              </div>
            </div>
            <div className="text-xs text-slate-400 flex-shrink-0">
              {book.pages}p
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
