/** "9 October 2026" — the journal's date style, in South African English. */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
