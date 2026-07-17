import { describe, it, expect } from "vitest";
import { metadata } from "./page";

describe("blog index metadata", () => {
  it("has a unique title and description", () => {
    expect(metadata.title).toBe("Blog");
    expect(metadata.description).toContain("crochet");
  });
});
