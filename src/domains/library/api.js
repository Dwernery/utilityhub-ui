import { requestJson, requestVoid } from "../../lib/http";

export function getBooks() {
  return requestJson("/api/library/books", {
    errorMessage: "Failed to fetch books",
  });
}

export function getAuthors() {
  return requestJson("/api/library/authors", {
    errorMessage: "Failed to fetch authors",
  });
}

export function getSeries() {
  return requestJson("/api/library/series", {
    errorMessage: "Failed to fetch series",
  });
}

export async function createAuthor(authorName) {
  await requestVoid("/api/library/authors", {
    method: "POST",
    body: { fullName: authorName },
    errorMessage: "Failed to create author",
  });
  return { name: authorName };
}

export async function createSeries(seriesName) {
  await requestVoid("/api/library/series", {
    method: "POST",
    body: { name: seriesName },
    errorMessage: "Failed to create series",
  });
  return { name: seriesName };
}

export function addBook({ title, pages, authorName, seriesName, isbn13 }) {
  return requestJson("/api/library/books", {
    method: "POST",
    body: {
      title,
      pages:
        pages === "" || pages === null || pages === undefined
          ? null
          : Number(pages),
      authorName,
      seriesName: seriesName || null,
      isbn13: isbn13 || null,
    },
    errorMessage: "Failed to create book",
    includeErrorDetail: true,
  });
}

export async function updateBook(data = {}) {
  const { id, ...fields } = data;
  if (!id) throw new Error("Missing book id for update");

  const payload = {};

  for (const [key, value] of Object.entries(fields)) {
    // Skip undefined fields so PATCH only sends things the caller intended to change
    if (value === undefined) continue;

    switch (key) {
      case "pages":
      case "rating":
        payload[key] = value === "" || value === null ? null : Number(value);
        break;
      case "currentPage":
        payload[key] = value === "" || value === null ? 0 : Number(value);
        break;
      case "seriesName":
      case "isbn13":
        payload[key] = value || null;
        break;
      default:
        // Dates: callers may explicitly pass null to clear a date
        payload[key] = value;
    }
  }

  await requestVoid(`/api/library/books/${id}`, {
    method: "PATCH",
    body: payload,
    errorMessage: "Failed to update book",
    includeErrorDetail: true,
  });
  return "Success";
}

/**
 * Get a presigned URL for uploading a file to S3.
 * @returns {Promise<{presignedUrl: string, s3Key: string}>}
 */
export function getPresignedUploadUrl(fileName, fileType) {
  const params = new URLSearchParams({ fileName, fileType });
  return requestJson(`/api/library/books/upload-url?${params}`, {
    errorMessage: "Failed to get upload URL",
    includeErrorDetail: true,
  });
}

/** Associate an uploaded S3 object with a book. */
export function attachFileToBook(bookId, s3Key, fileType = "cover") {
  return requestJson(`/api/library/books/${bookId}/attach-file`, {
    method: "POST",
    body: { s3Key, fileType },
    errorMessage: "Failed to attach file to book",
    includeErrorDetail: true,
  });
}

// NOTE: rating updates are handled via `updateBook({ id, rating })` (PATCH).

export async function deleteBook(id) {
  await requestVoid(`/api/library/books/${id}`, {
    method: "DELETE",
    errorMessage: "Failed to delete book",
    includeErrorDetail: true,
  });
  return "Success";
}
