import { describe, it, expect } from "vitest";
import { formatRelativeDate } from "./relative-date";

// 2026-10-09 15:00 in Johannesburg (UTC+2)
const now = new Date("2026-10-09T13:00:00Z");

describe("formatRelativeDate", () => {
  it("shows minutes for the last hour", () => {
    expect(formatRelativeDate(new Date("2026-10-09T12:59:40Z"), now)).toBe("Just now");
    expect(formatRelativeDate(new Date("2026-10-09T12:48:00Z"), now)).toBe("12 min ago");
  });

  it("shows hours earlier the same SA day", () => {
    expect(formatRelativeDate(new Date("2026-10-09T10:00:00Z"), now)).toBe("3 h ago");
  });

  it("uses South African day boundaries for Yesterday", () => {
    // 23:30 SA time on the 8th is 21:30 UTC.
    expect(formatRelativeDate(new Date("2026-10-08T21:30:00Z"), now)).toBe("Yesterday");
    // 00:30 SA time on the 9th (22:30 UTC on the 8th) is still today.
    expect(formatRelativeDate(new Date("2026-10-08T22:30:00Z"), now)).toBe("14 h ago");
  });

  it("shows a weekday within the last week, then a date", () => {
    expect(formatRelativeDate(new Date("2026-10-06T10:00:00Z"), now)).toMatch(/^Tue/);
    expect(formatRelativeDate(new Date("2026-09-20T10:00:00Z"), now)).toMatch(/^20 Sep/);
  });

  it("adds the year for older dates", () => {
    expect(formatRelativeDate(new Date("2025-12-01T10:00:00Z"), now)).toMatch(/2025/);
  });
});
