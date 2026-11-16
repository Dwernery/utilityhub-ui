import { API_URL } from "./config";
import { clearApiToken, getApiToken } from "./apiToken";

// Shared fetch wrapper for every domain API client. Mirrors utility-hub-mobile's
// src/lib/http.ts so the two clients build requests and report errors the same way.

/** The API refused the access token (HTTP 401): the user has to unlock again. */
export class UnauthorizedError extends Error {
  constructor(message = "Your access token was not accepted. Enter it again.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

const authorization = (token) =>
  token ? { Authorization: `Bearer ${token}` } : undefined;

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
  const token = getApiToken();
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      ...authorization(token),
      ...((body !== undefined || method !== "GET") && {
        "Content-Type": "application/json",
      }),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    // Forget the token so the unlock screen appears, but only if it's still the one
    // this request used: a slow, old request mustn't wipe a token just entered.
    if (getApiToken() === token) clearApiToken();
    throw new UnauthorizedError();
  }

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

/**
 * Tries a token against the API before it is saved, so a typo gets a clear message.
 * @returns {Promise<"valid" | "invalid">} rejects if the server can't be reached or fails
 */
export async function checkApiToken(token) {
  const response = await fetch(`${API_URL}/api/finance/accounts`, {
    headers: authorization(token),
  });
  if (response.status === 401) return "invalid";
  if (!response.ok) {
    throw new Error(`The server had a problem (status ${response.status})`);
  }
  return "valid";
}
