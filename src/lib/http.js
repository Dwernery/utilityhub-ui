import { API_URL } from "./config";

// Shared fetch wrapper for every domain API client. Mirrors utility-hub-mobile's
// src/lib/http.ts so the two clients build requests and report errors the same way.

/**
 * Extracts a human-readable message from a failed response. The API returns RFC 9457
 * problem details (`{ status, detail, errors? }`), where `errors` maps field -> message
 * for validation failures. Falls back to the raw text otherwise (e.g. a proxy error page).
 */
async function readErrorMessage(response) {
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

/**
 * @param {string} path API path, e.g. "/api/library/books"
 * @param {object} options
 * @param {"GET"|"POST"|"PUT"|"PATCH"|"DELETE"} [options.method="GET"]
 * @param {unknown} [options.body] serialized as JSON when present
 * @param {string} options.errorMessage message used when the server returns a non-2xx status
 * @param {boolean} [options.includeErrorDetail] append the server's problem detail to the error
 */
async function send(
  path,
  { method = "GET", body, errorMessage, includeErrorDetail },
) {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers:
      body !== undefined || method !== "GET"
        ? { "Content-Type": "application/json" }
        : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    if (includeErrorDetail) {
      const errorText = await readErrorMessage(response);
      throw new Error(
        `${errorMessage} (status ${response.status}): ${errorText || "Unknown error"}`,
      );
    }
    throw new Error(`${errorMessage} (status ${response.status})`);
  }

  return response;
}

/** Request that must return JSON. */
export async function requestJson(path, options) {
  const response = await send(path, options);
  return response.json();
}

/** Request whose response body is optional JSON; resolves `{ success: true }` when there's none. */
export async function requestMaybeJson(path, options) {
  const response = await send(path, options);
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }
  return { success: true };
}

/** Request whose response body is ignored. */
export async function requestVoid(path, options) {
  await send(path, options);
}
