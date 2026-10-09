import { describe, it, expect } from "vitest";
import { analyticsAttributes, analyticsItem, gaBootstrapScript, parseMeasurementId } from "./analytics";

describe("parseMeasurementId", () => {
  it("accepts GA4 measurement IDs only", () => {
    expect(parseMeasurementId("G-ABC123XYZ9")).toBe("G-ABC123XYZ9");
    expect(parseMeasurementId(" g-abc123xyz9 ")).toBe("G-ABC123XYZ9");
    expect(parseMeasurementId(undefined)).toBeNull();
    expect(parseMeasurementId("UA-12345-1")).toBeNull();
    expect(parseMeasurementId("G-1');alert(1)//")).toBeNull();
  });
});

describe("analyticsAttributes", () => {
  it("serialises params and drops empty values", () => {
    const attrs = analyticsAttributes("whatsapp_order_click", { item_id: "laptop-bag", colour: null, size: "" });
    expect(attrs["data-ga-event"]).toBe("whatsapp_order_click");
    expect(JSON.parse(attrs["data-ga-params"])).toEqual({ item_id: "laptop-bag" });
  });
});

describe("analyticsItem", () => {
  it("maps a product to a GA4 items entry", () => {
    expect(analyticsItem({ slug: "scrunchie", name: "Scrunchie", categoryName: "Scrunchies", price: 50 })).toEqual({
      item_id: "scrunchie",
      item_name: "Scrunchie",
      item_category: "Scrunchies",
      price: 50,
    });
  });
});

describe("gaBootstrapScript", () => {
  it("denies advertising storage and signals by default and configures the property", () => {
    const js = gaBootstrapScript("G-ABC123XYZ9");
    expect(js).toContain("ad_storage:'denied'");
    expect(js).toContain("ad_user_data:'denied'");
    expect(js).toContain("ad_personalization:'denied'");
    expect(js).toContain("allow_google_signals:false");
    expect(js).toContain(`gtag('config',"G-ABC123XYZ9"`);
  });
});
