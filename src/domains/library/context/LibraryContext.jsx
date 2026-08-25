import { createContext, useContext, useState, useMemo } from "react";
import { useSeries } from "../hooks/useSeries";
import { useAuthors } from "../hooks/useAuthors";
import { useBooks } from "../hooks/useBooks";
const LibraryContext = createContext();

export function LibraryProvider({ children }) {
  const { data: authors = [] } = useAuthors();
  const { data: series = [] } = useSeries();
  const { data: books = [] } = useBooks();
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [author, setAuthor] = useState(null);
  const [isEditingInDialog, setIsEditingInDialog] = useState(false);

  // Always derive the selected book from the books query cache so the
  // dialog reflects the latest server state instead of a stale, manually
  // managed copy that can drift out of sync (or get corrupted on a
  // rollback race after the modal has been closed).
  const selectedBook = useMemo(
    () =>
      selectedBookId == null
        ? null
        : (books.find((b) => b.id === selectedBookId) ?? null),
    [books, selectedBookId],
  );

  const authorOptions = useMemo(
    () => [...new Set(authors.map((a) => a.fullName))].sort(),
    [authors],
  );

  const seriesOptions = useMemo(
    () => [...new Set(series.map((s) => s.name))].sort(),
    [series],
  );

  const openBookDialog = (book) => {
    setSelectedBookId(book.id);
    setIsEditingInDialog(false);
  };
  const closeBookDialog = () => {
    setSelectedBookId(null);
    setIsEditingInDialog(false);
  };

  const value = useMemo(
    () => ({
      selectedBook,
      author,
      setAuthor,
      isEditingInDialog,
      setIsEditingInDialog,
      openBookDialog,
      closeBookDialog,
      seriesOptions,
      authorOptions,
    }),
    [selectedBook, author, isEditingInDialog, seriesOptions, authorOptions],
  );

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLibrary() {
  return useContext(LibraryContext);
}
