const TIME_ZONE = "Africa/Johannesburg";

function dayKey(date: Date): string {
  return date.toLocaleDateString("en-CA", { timeZone: TIME_ZONE });
}

/**
 * Short, phone-friendly timestamps for admin lists:
 * "Just now", "12 min ago", "3 h ago", "Yesterday", "Mon", "12 Oct", "12 Oct 2025".
 * Day boundaries use South African time regardless of the device's zone.
 */
export function formatRelativeDate(input: string | Date, now: Date = new Date()): string {
  const date = typeof input === "string" ? new Date(input) : input;
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const today = dayKey(now);
  const yesterday = dayKey(new Date(now.getTime() - 86_400_000));
  const key = dayKey(date);

  if (key === today) return `${Math.floor(minutes / 60)} h ago`;
  if (key === yesterday) return "Yesterday";
  if (diffMs < 6 * 86_400_000) {
    return date.toLocaleDateString("en-ZA", { weekday: "short", timeZone: TIME_ZONE });
  }
  const sameYear =
    date.toLocaleDateString("en-ZA", { year: "numeric", timeZone: TIME_ZONE }) ===
    now.toLocaleDateString("en-ZA", { year: "numeric", timeZone: TIME_ZONE });
  return date.toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "short",
    ...(sameYear ? {} : { year: "numeric" }),
    timeZone: TIME_ZONE,
  });
}

/** Full timestamp for detail views, e.g. "12 Oct 2026, 14:05". */
export function formatFullDate(input: string | Date): string {
  const date = typeof input === "string" ? new Date(input) : input;
  return date.toLocaleString("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIME_ZONE,
  });
}
