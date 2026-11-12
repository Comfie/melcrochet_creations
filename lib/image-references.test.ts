import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/prisma", () => ({ default: {
  product: { findMany: vi.fn().mockResolvedValue([]) },
  testimonial: { findMany: vi.fn().mockResolvedValue([]) },
  blogPost: { findMany: vi.fn().mockResolvedValue([]) },
} }));
import { referencedPublicIds } from "./image-references";
import { PREPARED_PHOTOS } from "./prepared-photos";

describe("prepared image references", () => {
  it("keeps permanent library photos even before a product uses them", async () => {
    const photo = PREPARED_PHOTOS[0];
    const used = await referencedPublicIds([photo.publicId, "melcrochet/unused-upload"]);
    expect([...used]).toEqual([photo.publicId]);
  });
});
