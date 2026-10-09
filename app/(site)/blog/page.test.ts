import { describe, it, expect } from "vitest";
import { metadata } from "./page";

describe("journal (blog index) metadata", () => {
  it("has a unique title and description", () => {
    expect(metadata.title).toBe("Journal");
    expect(metadata.description).toContain("crochet");
  });
});
