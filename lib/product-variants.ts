/** Parses the comma-separated `colours`/`sizes` text columns into a list. */
export function parseVariantList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}
