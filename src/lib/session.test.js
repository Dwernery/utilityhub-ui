import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  describeThisDevice,
  getSessionState,
  resetSessionStateForTests,
  setSessionState,
  subscribeSession,
} from "./session";

// Tests run in Node, which has no localStorage: give them a simple in-memory one.
let store;
beforeEach(() => {
  store = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  });
  resetSessionStateForTests();
});
afterEach(() => vi.unstubAllGlobals());

describe("session state", () => {
  it("is unknown until the API has been asked", () => {
    expect(getSessionState()).toBe("unknown");
  });

  it("records signing in and out, and tells subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeSession(listener);

    setSessionState("signedIn");
    setSessionState("signedIn"); // no change, no notification
    setSessionState("signedOut");
    expect(getSessionState()).toBe("signedOut");
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    setSessionState("signedIn");
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("never stores anything secret, only a signed-in flag for other tabs", () => {
    setSessionState("signedIn");
    expect([...store.values()]).toEqual(["1"]);
    setSessionState("signedOut");
    expect([...store.values()]).toEqual(["0"]);
  });

  it("keeps working when storage is blocked (e.g. strict privacy mode)", () => {
    vi.stubGlobal("localStorage", {
      setItem: () => {
        throw new Error("SecurityError");
      },
    });

    setSessionState("signedIn");
    expect(getSessionState()).toBe("signedIn");
  });
});

describe("describeThisDevice", () => {
  it.each([
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
      "Web – Safari on macOS",
    ],
    [
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      "Web – Chrome on macOS",
    ],
    [
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0",
      "Web – Edge on Windows",
    ],
    ["", "Web – Browser"],
  ])("names %s", (userAgent, expected) => {
    expect(describeThisDevice(userAgent)).toBe(expected);
  });
});
