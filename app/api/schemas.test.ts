import { describe, it, expect } from "vitest";
import { productUpdateSchema } from "./products/schema";
import { testimonialUpdateSchema } from "./testimonials/schema";
import { blogPostUpdateSchema } from "./blog/schema";

// Edit forms send null for an optional field the admin emptied; undefined
// means "leave unchanged". Both must validate so a field can be cleared.
describe("update schemas allow clearing optional fields", () => {
  it("products: sizes, colours, lead time and care", () => {
    const parsed = productUpdateSchema.parse({ sizes: null, colours: null, leadTime: null, careInstructions: null });
    expect(parsed).toEqual({ sizes: null, colours: null, leadTime: null, careInstructions: null });
  });

  it("testimonials: location, product, photo and rating", () => {
    const parsed = testimonialUpdateSchema.parse({
      location: null,
      productName: null,
      imageUrl: null,
      imagePublicId: null,
      rating: null,
    });
    expect(parsed.rating).toBeNull();
    expect(parsed.imageUrl).toBeNull();
  });

  it("blog: excerpt, cover and YouTube link", () => {
    const parsed = blogPostUpdateSchema.parse({
      excerpt: null,
      coverImageUrl: null,
      coverImagePublicId: null,
      youtubeUrl: null,
    });
    expect(parsed.youtubeUrl).toBeNull();
  });

  it("still rejects invalid values", () => {
    expect(testimonialUpdateSchema.safeParse({ rating: 6 }).success).toBe(false);
    expect(blogPostUpdateSchema.safeParse({ youtubeUrl: "not a url" }).success).toBe(false);
  });
});
