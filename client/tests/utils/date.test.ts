import { describe, it, expect } from "vitest";
import { toUnixMillis, toDateInputValue, formatDate } from "../../src/utils/date";

describe("toUnixMillis", () => {
  it("converts a yyyy-mm-dd date string to a unix millisecond timestamp", () => {
    const result = toUnixMillis("2026-01-15");
    expect(result).toBe(Date.parse("2026-01-15"));
  });

  it("returns 0 for an unparsable string", () => {
    expect(toUnixMillis("not-a-date")).toBe(0);
  });

  // Regression: CreateTaskModal used to divide by 1000 (seconds) here while
  // everything else (the model default, formatDate) assumed milliseconds.
  it("does not scale the value down to seconds", () => {
    const ms = toUnixMillis("2026-01-15");
    expect(ms).toBeGreaterThan(1_000_000_000_000); // only true for a ms epoch, not seconds
  });
});

describe("toDateInputValue", () => {
  it("formats a millisecond timestamp as yyyy-mm-dd", () => {
    const iso = new Date(Date.UTC(2026, 0, 15)).toISOString();
    expect(toDateInputValue(iso)).toBe("2026-01-15");
  });

  it("returns an empty string for an empty input", () => {
    expect(toDateInputValue("")).toBe("");
  });

  it("returns an empty string for an unparsable input", () => {
    expect(toDateInputValue("not-a-date")).toBe("");
  });
});

describe("formatDate", () => {
  it("returns an em dash for an empty value", () => {
    expect(formatDate("")).toBe("—");
  });

  it("formats a valid ISO date into a readable string", () => {
    const iso = new Date(Date.UTC(2026, 0, 15)).toISOString();
    const formatted = formatDate(iso);
    expect(formatted).toContain("2026");
    expect(formatted).not.toBe("—");
  });
});
