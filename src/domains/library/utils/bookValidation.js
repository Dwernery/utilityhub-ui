export function isBookValid(book) {
  return Boolean(
    book?.title?.trim() &&
    book?.authorName?.trim() &&
    book?.pages &&
    Number(book.pages) > 0 &&
    book?.isbn13?.trim(),
  );
}

export const BOOK_VALIDATION_MESSAGE =
  "Title, author, pages, and ISBN are required";
