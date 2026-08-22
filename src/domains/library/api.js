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
