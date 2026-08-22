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
