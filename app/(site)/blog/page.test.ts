import { describe, it, expect } from "vitest";
import { metadata } from "./page";

describe("journal (blog index) metadata", () => {
  it("has a unique title and description", () => {
    expect(metadata.title).toBe("Journal — Crochet Stories, Care & Styling");
    expect(metadata.description).toContain("crochet");
  });
});
