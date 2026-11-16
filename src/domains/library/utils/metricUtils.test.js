import { describe, it, expect } from "vitest";
import { readingProgress } from "./metricUtils";

describe("readingProgress", () => {
  it("gives the percent read and whole days since starting", () => {
    const book = { currentPage: 100, pages: 400, startDate: "2026-11-01" };

    expect(readingProgress(book, "2026-11-15")).toEqual({ pct: 25, days: 14 });
  });

  it("counts calendar days across the fall-back night (a 25-hour day)", () => {
    const book = { currentPage: 0, pages: 100, startDate: "2026-10-31" };

    expect(readingProgress(book, "2026-11-02").days).toBe(2);
  });

  it("keeps the percent between 0 and 100", () => {
    expect(
      readingProgress({ currentPage: 500, pages: 400 }, "2026-11-15").pct,
    ).toBe(100);
  });

  it("is 0% with no page count, and has no day count without a start date", () => {
    expect(
      readingProgress({ currentPage: 10, pages: null }, "2026-11-15"),
    ).toEqual({
      pct: 0,
      days: null,
    });
  });
});
