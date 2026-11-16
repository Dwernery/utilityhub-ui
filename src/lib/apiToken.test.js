import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearApiToken,
  getApiToken,
  setApiToken,
  subscribeApiToken,
} from "./apiToken";

// Tests run in Node, which has no localStorage: give them a simple in-memory one.
beforeEach(() => {
  const store = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  });
});
afterEach(() => vi.unstubAllGlobals());

describe("API token storage", () => {
  it("is empty until a token is saved", () => {
    expect(getApiToken()).toBeNull();
  });

  it("saves, reads and forgets the token", () => {
    setApiToken("abc");
    expect(getApiToken()).toBe("abc");

    clearApiToken();
    expect(getApiToken()).toBeNull();
  });

  it("tells subscribers whenever the token changes", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeApiToken(listener);

    setApiToken("abc");
    clearApiToken();
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    setApiToken("def");
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("treats blocked storage (e.g. strict privacy mode) as no token", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => {
        throw new Error("SecurityError");
      },
    });

    expect(getApiToken()).toBeNull();
  });
});
