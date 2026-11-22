import { describe, it, expect } from "vitest";
import { posterBackground } from "./posterArt";

describe("posterBackground", () => {
  it("only uses valid CSS colors (no alpha suffix glued onto rgb())", () => {
    const css = posterBackground("movie:1", "#4C8DFF");
    expect(css).not.toMatch(/\)[0-9A-F]{2}\b/i);
    expect(css.match(/rgba\(\d+, \d+, \d+, 0\.\d+\)/g)).toHaveLength(3);
    expect(css).toContain("linear-gradient(150deg, #262b3a 0%, #171a22 100%)");
  });

  it("is deterministic per id", () => {
    expect(posterBackground("movie:1", "#4C8DFF")).toBe(
      posterBackground("movie:1", "#4C8DFF"),
    );
    expect(posterBackground("movie:1", "#4C8DFF")).not.toBe(
      posterBackground("movie:2", "#4C8DFF"),
    );
  });
});
