import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getApiToken, setApiToken } from "./apiToken";
import {
  UnauthorizedError,
  checkApiToken,
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
const sentHeaders = () => new Headers(fetchMock.mock.calls[0][1].headers);

describe("requests", () => {
  it("send the stored token as a Bearer token", async () => {
    setApiToken("s3cret");
    respond(200, []);

    await requestJson("/api/library/books", { errorMessage: "x" });

    expect(sentHeaders().get("Authorization")).toBe("Bearer s3cret");
  });

  it("keep sending JSON's content type on writes", async () => {
    setApiToken("s3cret");
    respond(204);

    await requestVoid("/api/library/books/1", {
      method: "DELETE",
      errorMessage: "x",
    });

    expect(sentHeaders().get("Authorization")).toBe("Bearer s3cret");
    expect(sentHeaders().get("Content-Type")).toBe("application/json");
  });

  it("send no Authorization header when there is no token", async () => {
    respond(401, { status: 401 });

    await expect(
      requestJson("/api/library/books", { errorMessage: "x" }),
    ).rejects.toThrow(UnauthorizedError);
    expect(sentHeaders().has("Authorization")).toBe(false);
  });
});

describe("a 401 response", () => {
  it("forgets the rejected token, so the unlock screen comes back", async () => {
    setApiToken("old");
    respond(401, { status: 401, detail: "The API token is not valid." });

    await expect(
      requestJson("/api/library/books", { errorMessage: "Failed to load" }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    expect(getApiToken()).toBeNull();
  });

  it("keeps a newer token entered while the old request was in flight", async () => {
    setApiToken("old");
    let reply;
    fetchMock.mockReturnValueOnce(new Promise((r) => (reply = r)));

    const request = requestJson("/api/library/books", { errorMessage: "x" });
    setApiToken("new"); // the user unlocks again before the old request answers
    reply(new Response("{}", { status: 401 }));

    await expect(request).rejects.toBeInstanceOf(UnauthorizedError);
    expect(getApiToken()).toBe("new");
  });
});

describe("other errors", () => {
  it("keep the token and report the status as before", async () => {
    setApiToken("s3cret");
    respond(500, { status: 500, detail: "boom" });

    const error = await requestJson("/api/library/books", {
      errorMessage: "Failed to load books",
    }).catch((e) => e);

    expect(error).not.toBeInstanceOf(UnauthorizedError);
    expect(error.message).toBe("Failed to load books (status 500)");
    expect(getApiToken()).toBe("s3cret");
  });
});

describe("checkApiToken", () => {
  it("accepts a token the API accepts, without saving it", async () => {
    respond(200, []);

    await expect(checkApiToken("candidate")).resolves.toBe("valid");
    expect(sentHeaders().get("Authorization")).toBe("Bearer candidate");
    expect(getApiToken()).toBeNull();
  });

  it("reports a token the API rejects", async () => {
    respond(401, { status: 401 });

    await expect(checkApiToken("wrong")).resolves.toBe("invalid");
  });

  it("reports server trouble separately from a wrong token", async () => {
    respond(502, "Bad Gateway");

    await expect(checkApiToken("candidate")).rejects.toThrow("status 502");
  });
});
