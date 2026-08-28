import {
  Plus,
  Search,
  User,
  CheckCircle2,
  Circle,
  ChevronDown,
} from "lucide-react";
import { useState, useMemo } from "react";
import StarRating from "../components/StarRating";
import { useLibrary } from "../context/LibraryContext";
import AddBookForm from "../components/inventory/AddBookForm";
import { useBooks } from "../hooks/useBooks";
import BookDetailModal from "../components/inventory/BookDetailModal";
import AuthorDetailModal from "../components/inventory/AuthorDetailModal";

export function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const { data: books = [], isPending, isError, error } = useBooks();
  const { openBookDialog, selectedBook, author, setAuthor } = useLibrary();
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredBooks = books.filter((book) => {
    const title = String(book?.title ?? "").toLowerCase();
    const authorName = String(book?.authorName ?? "").toLowerCase();
    const series = String(book?.seriesName ?? "").toLowerCase();

    return (
      !normalizedSearch ||
      title.includes(normalizedSearch) ||
      authorName.includes(normalizedSearch) ||
      series.includes(normalizedSearch)
    );
  });

  const bookGroups = useMemo(() => {
    const groups = {};
    filteredBooks.forEach((book) => {
      const authorName = book.authorName || "Unknown";
      groups[authorName] ??= [];
      groups[authorName].push(book);
    });

    return Object.fromEntries(
      Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)),
    );
  }, [filteredBooks]);

  if (isPending) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 py-14 text-center">
        <p className="text-sm text-slate-400">Loading books…</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-200 py-14 text-center">
        <p className="text-sm text-red-500">
          Failed to load books: {error?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-slate-200">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search title, author, series…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>
        <div className="text-xs text-slate-400">
          {filteredBooks?.length} books
        </div>
        {showAddForm && <AddBookForm setShowAddForm={setShowAddForm} />}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {Object.entries(bookGroups).map(([authorName, groupBooks]) => (
          <div key={authorName}>
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
              <button
                onClick={() => setAuthor(authorName)}
                className="flex items-center gap-1.5 font-semibold text-slate-800 text-sm hover:text-blue-600 transition-colors"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                {authorName}
              </button>
              <span className="text-xs text-slate-400">
                {groupBooks.filter((book) => book.status === "READ").length}/
                {groupBooks.length}
              </span>
            </div>
            {groupBooks.map((book, i) => (
              <div
                key={book.id}
                role="button"
                tabIndex={0}
                onClick={() => openBookDialog(book)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openBookDialog(book);
                  }
                }}
                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-blue-50 active:bg-blue-100 transition-colors cursor-pointer ${i < groupBooks.length - 1 ? "border-b border-slate-100" : ""}`}
              >
                <div className="flex-shrink-0">
                  {book.status === "READ" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  ) : book.status === "IN_PROGRESS" ? (
                    <div className="w-4 h-4 rounded-full border-2 border-blue-400 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                    </div>
                  ) : (
                    <Circle className="w-4 h-4 text-slate-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">
                    {book.title}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    {book.seriesName && (
                      <span className="text-xs text-blue-500 truncate">
                        {book.seriesName}
                      </span>
                    )}
                    {book.rating > 0 && (
                      <StarRating value={book.rating} readonly size="sm" />
                    )}
                  </div>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {book.pages} pages
                </span>
                <ChevronDown className="w-4 h-4 text-slate-300 flex-shrink-0 -rotate-90" />
              </div>
            ))}
          </div>
        ))}
        {filteredBooks.length === 0 && (
          <div className="text-center py-10 text-slate-400 text-sm">
            {searchTerm ? "No books found" : "Add your first book!"}
          </div>
        )}
      </div>
      {selectedBook && <BookDetailModal />}
      {author && (
        <AuthorDetailModal
          author={author}
          onClose={() => setAuthor(null)}
          onBookClick={(book) => {
            setAuthor(null);
            openBookDialog(book);
          }}
        />
      )}
    </>
  );
}
