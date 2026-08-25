import { API_URL } from "../../config";

export async function getBooks() {
  const response = await fetch(`${API_URL}/api/library/books`);

  if (!response.ok) {
    throw new Error("Failed to fetch books");
  }

  return response.json();
}

export async function getAuthors() {
  const response = await fetch(`${API_URL}/api/library/authors`);

  if (!response.ok) {
    throw new Error("Failed to fetch authors");
  }

  return response.json();
}

export async function getSeries() {
  const response = await fetch(`${API_URL}/api/library/series`);

  if (!response.ok) {
    throw new Error("Failed to fetch series");
  }

  return response.json();
}

export async function createAuthor(authorName) {
  const response = await fetch(`${API_URL}/api/library/authors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName: authorName }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create author (status ${response.status})`);
  }

  return { name: authorName };
}

export async function createSeries(seriesName) {
  const response = await fetch(`${API_URL}/api/library/series`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: seriesName }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create series (status ${response.status})`);
  }

  return { name: seriesName };
}

export async function addBook({
  title,
  pages,
  authorName,
  seriesName,
  isbn13,
}) {
  const response = await fetch(`${API_URL}/api/library/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title,
      pages:
        pages === "" || pages === null || pages === undefined
          ? null
          : Number(pages),
      authorName,
      seriesName: seriesName || null,
      isbn13: isbn13 || null,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to create book (status ${response.status}): ${errorText || "Unknown error"}`,
    );
  }

  return "Success";
}

export async function updateBook(data = {}) {
  const { id, ...fields } = data;

  if (!id) throw new Error("Missing book id for update");

  const payload = {};

  for (const [key, value] of Object.entries(fields)) {
    // Skip undefined fields so PATCH only sends things the caller intended to change
    if (value === undefined) continue;

    if (key === "pages") {
      payload.pages = value === "" || value === null ? null : Number(value);
      continue;
    }

    if (key === "currentPage") {
      payload.currentPage = value === "" || value === null ? 0 : Number(value);
      continue;
    }

    if (key === "seriesName") {
      payload.seriesName = value || null;
      continue;
    }

    if (key === "isbn13") {
      payload.isbn13 = value || null;
      continue;
    }

    if (key === "rating") {
      payload.rating = value === "" || value === null ? null : Number(value);
      continue;
    }

    // Dates: allow callers to explicitly pass null to clear a date, otherwise send as-is
    payload[key] = value;
  }

  const response = await fetch(`${API_URL}/api/library/books/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to update book (status ${response.status}): ${errorText || "Unknown error"}`,
    );
  }

  return "Success";
}

// NOTE: rating updates are handled via `updateBook({ id, rating })` (PATCH).

export async function deleteBook(id) {
  const response = await fetch(`${API_URL}/api/library/books/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to delete book (status ${response.status}): ${errorText || "Unknown error"}`,
    );
  }

  return "Success";
}
