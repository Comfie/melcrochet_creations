import { describe, it, expect } from "vitest";
import {
  collectionLead,
  diversePhotographed,
  photographedIn,
  secondaryImage,
  singularPiece,
  toCardProduct,
  type CatalogueProduct,
} from "./catalogue";

function product(overrides: Partial<CatalogueProduct> & { id: string }): CatalogueProduct {
  return {
    slug: overrides.id,
    name: `Product ${overrides.id}`,
    priceType: "FIXED",
    price: 100,
    currency: "ZAR",
    imageUrl: `https://res.cloudinary.com/x/image/upload/v1/${overrides.id}.jpg`,
    gallery: null,
    leadTime: null,
    featured: false,
    category: { name: "Hats", slug: "hats" },
    ...overrides,
  };
}

describe("secondaryImage", () => {
  it("returns the first gallery image that differs from the main image", () => {
    const p = product({
      id: "a",
      imageUrl: "https://img/main.jpg",
      gallery: [
        { url: "https://img/main.jpg", publicId: "main" },
        { url: "https://img/second.jpg", publicId: "second" },
      ],
    });
    expect(secondaryImage(p)).toBe("https://img/second.jpg");
  });

  it("returns null for a missing or malformed gallery", () => {
    expect(secondaryImage(product({ id: "a", gallery: null }))).toBeNull();
    expect(secondaryImage(product({ id: "a", gallery: "nope" }))).toBeNull();
  });
});

describe("toCardProduct", () => {
  it("maps category name and omits the hover image when there is no main image", () => {
    const card = toCardProduct(
      product({
        id: "a",
        imageUrl: null,
        gallery: [{ url: "https://img/x.jpg", publicId: "x" }],
      })
    );
    expect(card.categoryName).toBe("Hats");
    expect(card.hoverImageUrl).toBeNull();
  });
});

describe("photographedIn", () => {
  it("keeps only photographed products in the given categories, in order", () => {
    const list = [
      product({ id: "1", category: { name: "Bags", slug: "bags" } }),
      product({ id: "2", imageUrl: null }),
      product({ id: "3" }),
    ];
    expect(photographedIn(list, ["hats"]).map((p) => p.id)).toEqual(["3"]);
  });
});

describe("diversePhotographed", () => {
  it("prefers one product per category before repeating", () => {
    const list = [
      product({ id: "h1" }),
      product({ id: "h2" }),
      product({ id: "b1", category: { name: "Bags", slug: "bags" } }),
      product({ id: "x", imageUrl: null, category: { name: "Baskets", slug: "baskets" } }),
    ];
    expect(diversePhotographed(list, 3).map((p) => p.id)).toEqual(["h1", "b1", "h2"]);
  });
});

describe("singularPiece", () => {
  it("turns plural category names into natural singular nouns", () => {
    expect(singularPiece("Throw Blankets")).toBe("throw blanket");
    expect(singularPiece("Kids Dresses")).toBe("kids dress");
    expect(singularPiece("Scrunchies")).toBe("scrunchie");
    expect(singularPiece("Gift Sets")).toBe("gift set");
  });
});

describe("collectionLead", () => {
  const list = [
    product({ id: "kids-beanie-hat" }),
    product({ id: "adult-beanie-hat", imageUrl: null }),
    product({ id: "adult-ruffle-bucket-hat" }),
  ];

  it("prefers the first photographed preferred product", () => {
    const lead = collectionLead(list, {
      categorySlugs: ["hats"],
      leadProductSlugs: ["adult-beanie-hat", "adult-ruffle-bucket-hat"],
    });
    expect(lead?.id).toBe("adult-ruffle-bucket-hat");
  });

  it("falls back to catalogue order without preferences", () => {
    expect(collectionLead(list, { categorySlugs: ["hats"] })?.id).toBe("kids-beanie-hat");
  });

  it("returns null when nothing in the collection is photographed", () => {
    expect(collectionLead(list, { categorySlugs: ["bags"] })).toBeNull();
  });
});
