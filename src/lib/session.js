import { useSyncExternalStore } from "react";

// Whether this browser is signed in. The session itself is an HttpOnly cookie that
// JavaScript can't read (so an injected script can't steal it); this module only
// tracks the state, so the app knows whether to show the sign-in screen.
//
//   "unknown"   just loaded: AuthGate asks the API (GET /api/auth/me)
//   "signedIn"  a request worked
//   "signedOut" the API said 401, or the user signed out
//
// A localStorage flag mirrors the state for one reason: other tabs get a "storage"
// event, so signing out in one tab signs out every tab. It holds no secret.

const STORAGE_KEY = "utilityHub.signedIn";
const listeners = new Set();
let state = "unknown";

export function getSessionState() {
  return state;
}

/** @param {"signedIn" | "signedOut"} next */
export function setSessionState(next) {
  if (next === state) return;
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, next === "signedIn" ? "1" : "0");
  } catch {
    // Blocked storage (strict privacy modes): only other tabs miss out.
  }
  listeners.forEach((listener) => listener());
}

/**
 * Calls `listener` whenever the state changes, in this tab or another one.
 * @returns {() => void} unsubscribe
 */
export function subscribeSession(listener) {
  listeners.add(listener);
  const onOtherTab = (event) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    // Another tab signed out: so did this one (it shares the cookie). Another tab
    // signed in: check again, the cookie is there now.
    state = event.newValue === "1" ? "unknown" : "signedOut";
    listener();
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

/** The current state, re-rendering when it changes. */
export function useSessionState() {
  return useSyncExternalStore(
    subscribeSession,
    getSessionState,
    () => "unknown",
  );
}

/** For tests only. */
export function resetSessionStateForTests() {
  state = "unknown";
}

/** A name for this browser, shown in "signed in as"; e.g. "Safari on macOS". */
export function describeThisDevice(
  userAgent = globalThis.navigator?.userAgent ?? "",
) {
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /Firefox\//.test(userAgent)
      ? "Firefox"
      : /Chrome\//.test(userAgent)
        ? "Chrome"
        : /Safari\//.test(userAgent)
          ? "Safari"
          : "Browser";
  const system = /iPhone|iPad/.test(userAgent)
    ? "iOS"
    : /Mac OS X/.test(userAgent)
      ? "macOS"
      : /Windows/.test(userAgent)
        ? "Windows"
        : /Android/.test(userAgent)
          ? "Android"
          : /Linux/.test(userAgent)
            ? "Linux"
            : null;
  return `Web – ${browser}${system ? ` on ${system}` : ""}`;
}
