import { describe, it, expect } from "vitest";
import { metadata } from "./page";

describe("contact page metadata", () => {
  it("has a unique title and description", () => {
    expect(metadata.title).toBe("Contact Us");
    expect(metadata.description).toContain("WhatsApp");
  });
});
