import { createContext, useContext, useState, useMemo } from "react";
import { useSeries } from "../hooks/useGetSeries";
import { useAuthors } from "../hooks/useGetAuthors";
const LibraryContext = createContext();

export function LibraryProvider({ children }) {
  const { data: authors = [] } = useAuthors();
  const { data: series = [] } = useSeries();
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedBookOriginal, setSelectedBookOriginal] = useState(null);
  const [author, setAuthor] = useState(null);
  const [isEditingInDialog, setIsEditingInDialog] = useState(false);
  const [customAuthors, setCustomAuthors] = useState([]);
  const [customSeries, setCustomSeries] = useState([]);

  const authorOptions = useMemo(
    () =>
      [
        ...new Set([...authors.map((a) => a.fullName), ...customAuthors]),
      ].sort(),
    [authors, customAuthors],
  );

  const seriesOptions = useMemo(
    () => [...new Set([...series.map((s) => s.name), ...customSeries])].sort(),
    [series, customSeries],
  );

  const openBookDialog = (book) => {
    setSelectedBook({ ...book });
    setSelectedBookOriginal({ ...book });
    setIsEditingInDialog(false);
  };
  const closeBookDialog = () => {
    setSelectedBook(null);
    setIsEditingInDialog(false);
    setSelectedBookOriginal(null);
  };

  return (
    <LibraryContext.Provider
      value={{
        selectedBook,
        selectedBookOriginal,
        setSelectedBook,
        author,
        setAuthor,
        isEditingInDialog,
        setIsEditingInDialog,
        openBookDialog,
        closeBookDialog,
        setSelectedBookOriginal,
        setCustomAuthors,
        setCustomSeries,
        seriesOptions,
        authorOptions,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLibrary() {
  return useContext(LibraryContext);
}
