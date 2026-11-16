import { useSyncExternalStore } from "react";

// The access token every API request sends as "Authorization: Bearer <token>".
// Entered once per browser on the unlock screen and kept in localStorage.

const STORAGE_KEY = "utilityHub.apiToken";
const listeners = new Set();

/** The saved token, or null. Blocked storage (strict privacy modes) counts as none. */
export function getApiToken() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setApiToken(token) {
  localStorage.setItem(STORAGE_KEY, token);
  listeners.forEach((listener) => listener());
}

export function clearApiToken() {
  localStorage.removeItem(STORAGE_KEY);
  listeners.forEach((listener) => listener());
}

/**
 * Calls `listener` whenever the token changes, in this tab or another one
 * (so forgetting the token in one tab locks every tab).
 * @returns {() => void} unsubscribe
 */
export function subscribeApiToken(listener) {
  listeners.add(listener);
  const onOtherTab = (event) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onOtherTab);
  }
  return () => {
    listeners.delete(listener);
    if (typeof window !== "undefined") {
      window.removeEventListener("storage", onOtherTab);
    }
  };
}

/** The current token, re-rendering when it changes. */
export function useApiToken() {
  return useSyncExternalStore(subscribeApiToken, getApiToken, () => null);
}
