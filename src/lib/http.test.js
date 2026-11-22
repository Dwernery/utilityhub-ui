import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getSessionState, resetSessionStateForTests } from "./session";
import {
  UnauthorizedError,
  checkSession,
  login,
  logout,
  requestJson,
  requestVoid,
} from "./http";

const fetchMock = vi.fn();

beforeEach(() => {
  const store = new Map();
  vi.stubGlobal("localStorage", {
    getItem: (k) => store.get(k) ?? null,
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  });
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
  resetSessionStateForTests();
});
afterEach(() => vi.unstubAllGlobals());

const respond = (status, body = "") =>
  fetchMock.mockResolvedValueOnce(
    new Response(
      status === 204
        ? null
        : typeof body === "string"
          ? body
          : JSON.stringify(body),
      {
        status,
        headers: { "content-type": "application/json" },
      },
    ),
  );
const sentOptions = () => fetchMock.mock.calls[0][1];
const sentHeaders = () => new Headers(sentOptions().headers);
const sentBody = () => JSON.parse(sentOptions().body);

describe("requests", () => {
  it("let the browser send the session cookie, and never an Authorization header", async () => {
    respond(200, []);

    await requestJson("/api/library/books", { errorMessage: "x" });

    expect(sentOptions().credentials).toBe("same-origin");
    expect(sentHeaders().has("Authorization")).toBe(false);
    expect(getSessionState()).toBe("signedIn");
  });

  it("keep sending JSON's content type on writes", async () => {
    respond(204);

    await requestVoid("/api/library/books/1", {
      method: "DELETE",
      errorMessage: "x",
    });

    expect(sentHeaders().get("Content-Type")).toBe("application/json");
  });
});

describe("a 401 response", () => {
  it("signs out, so the sign-in screen comes back", async () => {
    respond(401, { status: 401, detail: "Your session has expired." });

    await expect(
      requestJson("/api/library/books", { errorMessage: "Failed to load" }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    expect(getSessionState()).toBe("signedOut");
  });
});

describe("other errors", () => {
  it("keep the session and report the status as before", async () => {
    respond(500, { status: 500, detail: "boom" });

    const error = await requestJson("/api/library/books", {
      errorMessage: "Failed to load books",
    }).catch((e) => e);

    expect(error).not.toBeInstanceOf(UnauthorizedError);
    expect(error.message).toBe("Failed to load books (status 500)");
    expect(getSessionState()).toBe("unknown");
  });
});

describe("login", () => {
  it("sends the password and device name, and counts as signed in", async () => {
    respond(200, {
      deviceName: "Web – Safari on macOS",
      expiresAt: "2027-01-01T00:00:00Z",
    });

    await login("hunter2", "Web – Safari on macOS");

    expect(fetchMock.mock.calls[0][0]).toBe("/api/auth/login");
    expect(sentBody()).toEqual({
      password: "hunter2",
      deviceName: "Web – Safari on macOS",
    });
    expect(getSessionState()).toBe("signedIn");
  });

  it("shows the server's reason for a wrong password", async () => {
    respond(401, { status: 401, detail: "Wrong password." });

    await expect(login("nope", "Mac")).rejects.toThrow("Wrong password.");
    expect(getSessionState()).toBe("unknown");
  });

  it("explains being rate limited", async () => {
    respond(429, { status: 429, detail: "Too many sign-in attempts." });

    await expect(login("nope", "Mac")).rejects.toThrow("Wait a few minutes");
  });
});

describe("logout", () => {
  it("asks the API to clear the cookie and signs out", async () => {
    respond(204);

    await logout();

    expect(fetchMock.mock.calls[0][0]).toBe("/api/auth/logout");
    expect(getSessionState()).toBe("signedOut");
  });

  it("signs out even if the server can't be reached", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

    await expect(logout()).rejects.toThrow(TypeError);
    expect(getSessionState()).toBe("signedOut");
  });
});

describe("checkSession", () => {
  it("reports a valid cookie", async () => {
    respond(200, { deviceName: "Mac" });

    await expect(checkSession()).resolves.toBe(true);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/auth/me");
    expect(getSessionState()).toBe("signedIn");
  });

  it("reports a missing or expired one", async () => {
    respond(401, { status: 401 });

    await expect(checkSession()).resolves.toBe(false);
    expect(getSessionState()).toBe("signedOut");
  });

  it("reports server trouble separately from being signed out", async () => {
    respond(502, "Bad Gateway");

    await expect(checkSession()).rejects.toThrow("status 502");
    expect(getSessionState()).toBe("unknown");
  });
});
