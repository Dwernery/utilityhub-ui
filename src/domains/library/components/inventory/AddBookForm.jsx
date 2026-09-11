import { useState } from "react";
import SearchableDropdown from "../SearchableDropdown";
import FileUploadInput from "../FileUploadInput";
import { useLibrary } from "../../context/LibraryContext";
import { useCreateAuthor } from "../../hooks/useCreateAuthor";
import { useCreateSeries } from "../../hooks/useCreateSeries";
import { useAddBook } from "../../hooks/useAddBook";
import { useS3Upload } from "../../hooks/useS3Upload";
import { useToast } from "../../../../context/ToastContext";
import {
  isBookValid,
  BOOK_VALIDATION_MESSAGE,
} from "../../utils/bookValidation";

export default function AddBookForm({ setShowAddForm }) {
  const { authorOptions, seriesOptions } = useLibrary();

  const [newBook, setNewBook] = useState({
    title: "",
    authorName: "",
    seriesName: "",
    pages: "",
    isbn13: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);

  const createAuthor = useCreateAuthor();
  const createSeries = useCreateSeries();
  const addBookMutation = useAddBook();
  const s3Upload = useS3Upload();
  const addToast = useToast();

  const isSaving = addBookMutation.isPending;
  const isBusy =
    isSaving ||
    createAuthor.isPending ||
    createSeries.isPending ||
    s3Upload.isUploading;

  const handleAddBook = async () => {
    if (!isBookValid(newBook)) {
      addToast(BOOK_VALIDATION_MESSAGE, "error");
      return;
    }

    try {
      // First, add the book
      const bookData = {
        title: newBook.title.trim(),
        authorName: newBook.authorName.trim(),
        seriesName: newBook.seriesName.trim(),
        pages: newBook.pages,
        isbn13: newBook.isbn13.trim(),
      };

      // Add the book and wait for success, capturing the response
      const bookResponse = await new Promise((resolve, reject) => {
        addBookMutation.mutate(bookData, {
          onSuccess: (response) => {
            resolve(response);
          },
          onError: (err) => {
            reject(err);
          },
        });
      });

      const bookId = bookResponse?.id;

      // If file is selected, upload it
      if (selectedFile && bookId) {
        try {
          await s3Upload.uploadFile(selectedFile, bookId, "cover");
          addToast(
            `Book "${newBook.title.trim()}" saved and file uploaded`,
            "success",
          );
        } catch (uploadErr) {
          addToast(
            `Book saved, but file upload failed: ${uploadErr?.message || "Unknown error"}`,
            "warning",
          );
        }
      } else {
        addToast(`Book "${newBook.title.trim()}" saved`, "success");
      }

      // Reset form
      setNewBook({
        title: "",
        authorName: "",
        seriesName: "",
        pages: "",
        isbn13: "",
      });
      setSelectedFile(null);
      setShowAddForm(false);
    } catch (err) {
      addToast(
        `Failed to save book: ${err?.message || "Unknown error"}`,
        "error",
      );
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          placeholder="Title *"
          value={newBook.title}
          disabled={isBusy}
          onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:opacity-60"
        />
        <input
          type="number"
          placeholder="Pages *"
          value={newBook.pages}
          disabled={isBusy}
          onChange={(e) => setNewBook({ ...newBook, pages: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:opacity-60"
        />
        <SearchableDropdown
          value={newBook.authorName}
          onChange={(v) => setNewBook({ ...newBook, authorName: v })}
          options={authorOptions}
          placeholder="Author *"
          disabled={isBusy}
          isAddingNew={createAuthor.isPending}
          onAddNew={(v) =>
            createAuthor.mutate(v, {
              onSuccess: (data) => {
                const name = data?.name || v;
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
          disabled={isBusy}
          isAddingNew={createSeries.isPending}
          onAddNew={(v) =>
            createSeries.mutate(v, {
              onSuccess: (data) => {
                const name = data?.name || v;
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
          placeholder="ISBN *"
          value={newBook.isbn13}
          disabled={isBusy}
          onChange={(e) => setNewBook({ ...newBook, isbn13: e.target.value })}
          className="px-3 py-2 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 sm:col-span-2 disabled:bg-slate-50 disabled:opacity-60"
        />
      </div>

      <FileUploadInput
        label="Book Cover or Document (Optional)"
        onFileSelected={setSelectedFile}
        selectedFile={selectedFile}
        isUploading={s3Upload.isUploading}
        uploadProgress={s3Upload.uploadProgress}
        onUploadError={(err) => {
          addToast(`File error: ${err?.message}`, "error");
        }}
        disabled={isBusy}
        maxSizeMB={10}
      />

      <div className="flex gap-2">
        <button
          onClick={handleAddBook}
          disabled={isBusy}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save"}
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
            setSelectedFile(null);
          }}
          disabled={isBusy}
          className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
