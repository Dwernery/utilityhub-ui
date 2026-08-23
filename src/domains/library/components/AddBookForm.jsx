import { useState } from "react";
import SearchableDropdown from "./SearchableDropdown";
import { useLibrary } from "../context/LibraryContext";
import { useCreateAuthor } from "../hooks/useCreateAuthor";
import { useCreateSeries } from "../hooks/useCreateSeries";
import { useAddBook } from "../hooks/useAddBook";
import { useToast } from "../../../context/ToastContext";

export default function AddBookForm({ setShowAddForm }) {
  const { setCustomAuthors, setCustomSeries, authorOptions, seriesOptions } =
    useLibrary();

  const [newBook, setNewBook] = useState({
    title: "",
    authorName: "",
    seriesName: "",
    pages: "",
    isbn13: "",
  });

  const handleAddBook = () => {
    if (
      !newBook.title.trim() ||
      !newBook.authorName.trim() ||
      !newBook.pages ||
      newBook.pages <= 0 ||
      !newBook.isbn13.trim()
    ) {
      addToast("Title, author, pages, and ISBN are required", "error");
      return;
    }

    addBookMutation.mutate(
      {
        title: newBook.title.trim(),
        authorName: newBook.authorName.trim(),
        seriesName: newBook.seriesName.trim(),
        pages: newBook.pages,
        isbn13: newBook.isbn13.trim(),
      },
      {
        onSuccess: () => {
          setNewBook({
            title: "",
            authorName: "",
            seriesName: "",
            pages: "",
            isbn13: "",
          });
          setShowAddForm(false);
          addToast(`Book "${newBook.title.trim()}" saved`, "success");
        },
        onError: (err) => {
          addToast(
            `Failed to save book: ${err?.message || "Unknown error"}`,
            "error",
          );
        },
      },
    );
  };

  const createAuthor = useCreateAuthor();
  const createSeries = useCreateSeries();
  const addBookMutation = useAddBook();
  const addToast = useToast();

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Title *"
          value={newBook.title}
          onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Pages *"
          value={newBook.pages}
          onChange={(e) => setNewBook({ ...newBook, pages: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <SearchableDropdown
          value={newBook.authorName}
          onChange={(v) => setNewBook({ ...newBook, authorName: v })}
          options={authorOptions}
          placeholder="Author *"
          onAddNew={(v) =>
            createAuthor.mutate(v, {
              onSuccess: (data) => {
                const name = data?.name || v;
                setCustomAuthors((p) => [name, ...p]);
                setNewBook((b) => ({ ...b, authorName: name }));
                addToast(`Author "${name}" created`, "success");
              },
              onError: (err) => {
                addToast(
                  `Failed to create author: ${err?.message || "Unknown error"}`,
                  "error",
                );
              },
            })
          }
          addNewLabel="Add author"
        />
        <SearchableDropdown
          value={newBook.seriesName}
          onChange={(v) => setNewBook({ ...newBook, seriesName: v })}
          options={seriesOptions}
          placeholder="Series (optional)"
          onAddNew={(v) =>
            createSeries.mutate(v, {
              onSuccess: (data) => {
                const name = data?.name || v;
                setCustomSeries((p) => [name, ...p]);
                setNewBook((b) => ({ ...b, seriesName: name }));
                addToast(`Series "${name}" created`, "success");
              },
              onError: (err) => {
                addToast(
                  `Failed to create series: ${err?.message || "Unknown error"}`,
                  "error",
                );
              },
            })
          }
          addNewLabel="Add series"
        />

        <input
          type="text"
          placeholder="ISBN (optional)"
          value={newBook.isbn13}
          onChange={(e) => setNewBook({ ...newBook, isbn13: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:col-span-2"
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleAddBook}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          Save
        </button>
        <button
          onClick={() => {
            setShowAddForm(false);
            setNewBook({
              title: "",
              authorName: "",
              seriesName: "",
              pages: "",
              isbn13: "",
            });
          }}
          className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
