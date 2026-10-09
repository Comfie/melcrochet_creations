import { describe, it, expect } from "vitest";
import { metadata } from "./page";

describe("about page metadata", () => {
  it("has a unique title and description", () => {
    expect(metadata.title).toBe("Our Story — Founder Melissa Ruvimbo Buchirai");
    expect(metadata.description).toContain("Melissa");
  });
});
