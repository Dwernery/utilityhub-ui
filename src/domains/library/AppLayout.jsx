import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import { LibraryProvider } from "./context/LibraryContext";
import { useLibrary } from "./context/LibraryContext";
import BookDetailModal from "./components/BookDetailModal";
import AuthorDetailModal from "./components/AuthorDetailModal";

function LayoutContent() {
  const { selectedBook, author, setAuthor, openBookDialog } = useLibrary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <Header />
        <main>
          <Outlet />
        </main>
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
    </div>
  );
}

export default function AppLayout() {
  return (
    <LibraryProvider>
      <LayoutContent />
    </LibraryProvider>
  );
}
