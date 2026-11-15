/**
 * Extracts a human-readable message from a failed API response.
 *
 * The API returns RFC 9457 problem details, e.g.
 *   { "status": 404, "detail": "Book not found: 42" }
 * and, for validation failures, an extra `errors` map of field -> message.
 * Falls back to the raw text for non-JSON responses (e.g. a proxy error page).
 */
export async function readErrorMessage(response) {
  const text = await response.text();
  try {
    const problem = JSON.parse(text);
    if (problem.errors) {
      return Object.entries(problem.errors)
        .map(([field, message]) => `${field}: ${message}`)
        .join(", ");
    }
    return problem.detail || problem.title || text;
  } catch {
    return text;
  }
}
