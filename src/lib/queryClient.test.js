import { describe, expect, it } from "vitest";
import { UnauthorizedError } from "./http";
import { queryClient } from "./queryClient";

const retry = queryClient.getDefaultOptions().queries.retry;

describe("query retries", () => {
  it("retry an ordinary failure once", () => {
    expect(retry(0, new Error("network"))).toBe(true);
    expect(retry(1, new Error("network"))).toBe(false);
  });

  it("never retry a rejected session: it would just be rejected again", () => {
    expect(retry(0, new UnauthorizedError())).toBe(false);
  });
});
