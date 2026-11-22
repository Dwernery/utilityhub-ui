import { API_URL } from "./config";
import { setSessionState } from "./session";

// Shared fetch wrapper for every domain API client. Mirrors utility-hub-mobile's
// src/lib/http.ts so the two clients build requests and report errors the same way.
// The session travels as an HttpOnly cookie, which the browser adds by itself.

/** The API refused the session (HTTP 401): the user has to sign in again. */
export class UnauthorizedError extends Error {
  constructor(message = "Your session has ended. Sign in again.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

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
    credentials: "same-origin",
    headers:
      body !== undefined || method !== "GET"
        ? { "Content-Type": "application/json" }
        : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (response.status === 401) {
    setSessionState("signedOut"); // the sign-in screen appears
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

  setSessionState("signedIn");
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

/** Sign-in, sign-out and passkey calls: their errors are shown on the sign-in screen as they are. */
async function authRequest(path, body) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (!response.ok) {
    const message =
      response.status === 429
        ? "Too many attempts. Wait a few minutes and try again."
        : await readErrorMessage(response);
    const error = new Error(
      message || `The server had a problem (status ${response.status})`,
    );
    error.status = response.status;
    throw error;
  }
  return response.status === 204 ? null : response.json();
}

/**
 * Signs in with the password. On success the API sets the session cookie.
 * @returns {Promise<{deviceName: string, expiresAt: string}>}
 */
export async function login(password, deviceName) {
  const session = await authRequest("/api/auth/login", {
    password,
    deviceName,
  });
  setSessionState("signedIn");
  return session;
}

/** Signs this browser out: the API clears the cookie. */
export async function logout() {
  try {
    await authRequest("/api/auth/logout");
  } finally {
    setSessionState("signedOut");
  }
}

/**
 * Asks the API whether this browser's cookie is still a valid session.
 * @returns {Promise<boolean>} rejects if the server can't be reached or fails
 */
export async function checkSession() {
  const response = await fetch(`${API_URL}/api/auth/me`, {
    credentials: "same-origin",
  });
  if (response.status === 401) {
    setSessionState("signedOut");
    return false;
  }
  if (!response.ok) {
    throw new Error(`The server had a problem (status ${response.status})`);
  }
  setSessionState("signedIn");
  return true;
}

/** Passkey (Touch ID) steps; see lib/passkey.js. */
export const passkeyApi = {
  signInOptions: () => authRequest("/api/auth/passkey/options"),
  signIn: (challengeToken, credential, deviceName) =>
    authRequest("/api/auth/passkey/login", {
      challengeToken,
      credential,
      deviceName,
    }),
  registrationOptions: () => authRequest("/api/auth/passkey/register/options"),
  register: (challengeToken, credential) =>
    authRequest("/api/auth/passkey/register", { challengeToken, credential }),
};
