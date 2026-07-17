import { describe, it, expect } from "vitest";
import { metadata } from "./page";

describe("about page metadata", () => {
  it("has a unique title and description", () => {
    expect(metadata.title).toBe("About MelCrochet Gifted Hands");
    expect(metadata.description).toContain("Melissa");
  });
});
