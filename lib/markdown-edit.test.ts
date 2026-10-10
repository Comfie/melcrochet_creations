import { describe, it, expect } from "vitest";
import { applyMarkdown } from "./markdown-edit";

describe("applyMarkdown", () => {
  it("wraps the selection in bold and keeps it selected", () => {
    const r = applyMarkdown("a soft blanket", 2, 6, "bold");
    expect(r.value).toBe("a **soft** blanket");
    expect(r.value.slice(r.selectionStart, r.selectionEnd)).toBe("soft");
  });

  it("inserts an empty italic pair at the caret", () => {
    const r = applyMarkdown("hello ", 6, 6, "italic");
    expect(r.value).toBe("hello __");
    expect(r.selectionStart).toBe(7);
    expect(r.selectionEnd).toBe(7);
  });

  it("turns the current line into a heading", () => {
    const r = applyMarkdown("intro\nCare tips\nmore", 8, 8, "heading");
    expect(r.value).toBe("intro\n## Care tips\nmore");
    expect(r.selectionStart).toBe(11);
  });

  it("toggles a heading back off", () => {
    expect(applyMarkdown("## Care tips", 5, 5, "heading").value).toBe("Care tips");
  });

  it("prefixes every selected line as a list", () => {
    const text = "wool\ncotton\nbamboo";
    const r = applyMarkdown(text, 0, text.length, "list");
    expect(r.value).toBe("- wool\n- cotton\n- bamboo");
    expect(r.value.slice(r.selectionStart, r.selectionEnd)).toBe("wool\n- cotton\n- bamboo");
  });
});
