import { describe, expect, it } from "vitest";
import { calendarSeason, getSeasonalCampaign, seasonalProducts, SUMMER_CAMPAIGN } from "./seasons";
import type { CatalogueProduct } from "./catalogue";

function product(id: string, name: string, slug: string, featured = false): CatalogueProduct {
  return { id, slug: id, name, category: { name: slug, slug }, imageUrl: `https://example.com/${id}.jpg`, featured, priceType: "FIXED", price: 100, currency: "ZAR", gallery: null, leadTime: null };
}

describe("South African seasonal merchandising", () => {
  it.each([
    [1, "summer"], [2, "summer"], [3, "autumn"], [4, "autumn"], [5, "autumn"], [6, "winter"],
    [7, "winter"], [8, "winter"], [9, "spring"], [10, "spring"], [11, "spring"], [12, "summer"],
  ])("resolves month %i in the southern hemisphere", (month, season) => {
    expect(calendarSeason(new Date(`2026-${String(month).padStart(2, "0")}-15T12:00:00Z`))).toBe(season);
  });

  it("switches at Johannesburg midnight, before the UTC month changes", () => {
    expect(calendarSeason(new Date("2026-05-31T21:59:59Z"))).toBe("autumn");
    expect(calendarSeason(new Date("2026-05-31T22:00:00Z"))).toBe("winter");
    expect(calendarSeason(new Date("2026-08-31T22:00:00Z"))).toBe("spring");
  });

  it("leads with summer in spring, then layers and winter wear as the year changes", () => {
    expect(getSeasonalCampaign(new Date("2026-11-12"), "auto").id).toBe("summer");
    expect(getSeasonalCampaign(new Date("2027-04-12"), "auto").id).toBe("autumn");
    expect(getSeasonalCampaign(new Date("2027-07-12"), "auto").id).toBe("winter");
  });

  it("allows an explicit campaign override and ignores unknown settings", () => {
    const winterDate = new Date("2027-07-12");
    expect(getSeasonalCampaign(winterDate, "summer")).toBe(SUMMER_CAMPAIGN);
    expect(getSeasonalCampaign(winterDate, "unknown").id).toBe("winter");
    expect(getSeasonalCampaign(winterDate, "spring").id).toBe("summer");
  });

  it("promotes suitable actual products without backfilling summer with blankets", () => {
    const products = [product("throw", "Chunky throw blanket", "throw-blankets", true), product("bag", "Everyday handbag", "bags"), product("bikini", "Pink crochet bikini", "custom-orders"), product("beanie", "Adult beanie hat", "hats", true), product("dress", "Orange floral dress", "custom-orders")];
    const before = [...products];
    expect(seasonalProducts(products, SUMMER_CAMPAIGN).map((p) => p.id)).toEqual(["bikini", "dress", "bag"]);
    expect(products).toEqual(before);
    expect(seasonalProducts([products[0]], SUMMER_CAMPAIGN)).toEqual([]);
    expect(seasonalProducts(products, SUMMER_CAMPAIGN, 1).map((p) => p.id)).toEqual(["bikini"]);
  });

  it("includes openwork summer cardigans while keeping chunky winter layers out", () => {
    const products = [product("openwork", "Red openwork tie-front cardigan", "adult-sweaters"), product("chunky", "Chunky winter cardigan", "adult-sweaters")];
    expect(seasonalProducts(products, SUMMER_CAMPAIGN).map((p) => p.id)).toEqual(["openwork"]);
  });

  it("brings warm items back for winter and excludes missing photographs", () => {
    const winter = getSeasonalCampaign(new Date("2027-07-12"), "auto");
    const products = [product("bikini", "Pink bikini", "custom-orders"), product("throw", "Chunky blanket", "throw-blankets"), { ...product("scarf", "Navy scarf", "gift-sets"), imageUrl: null }];
    expect(seasonalProducts(products, winter).map((p) => p.id)).toEqual(["throw"]);
  });
});
