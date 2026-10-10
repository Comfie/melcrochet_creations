export type MarkdownAction = "bold" | "italic" | "heading" | "list";

interface EditResult {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

const WRAP = { bold: "**", italic: "_" } as const;
const PREFIX = { heading: "## ", list: "- " } as const;

/**
 * Applies a formatting button to a textarea's text — what the toolbar on
 * the blog editor uses so phones don't need the symbol keyboard.
 *  - bold/italic wrap the selection (or insert an empty pair for the caret)
 *  - heading/list prefix every selected line (toggling off if already there)
 */
export function applyMarkdown(text: string, start: number, end: number, action: MarkdownAction): EditResult {
  if (action === "bold" || action === "italic") {
    const mark = WRAP[action];
    const selected = text.slice(start, end);
    const value = text.slice(0, start) + mark + selected + mark + text.slice(end);
    return { value, selectionStart: start + mark.length, selectionEnd: end + mark.length };
  }

  const prefix = PREFIX[action];
  const lineStart = text.lastIndexOf("\n", start - 1) + 1;
  const nextBreak = text.indexOf("\n", end);
  const lineEnd = nextBreak === -1 ? text.length : nextBreak;
  const lines = text.slice(lineStart, lineEnd).split("\n");
  const allPrefixed = lines.every((line) => line.startsWith(prefix));
  const updated = lines.map((line) => (allPrefixed ? line.slice(prefix.length) : prefix + line));
  const delta = allPrefixed ? -prefix.length : prefix.length;
  const value = text.slice(0, lineStart) + updated.join("\n") + text.slice(lineEnd);
  return {
    value,
    selectionStart: Math.max(lineStart, start + delta),
    selectionEnd: Math.max(lineStart, end + delta * lines.length),
  };
}
