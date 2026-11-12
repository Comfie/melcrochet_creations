import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import CrochetLessonsPage, { metadata } from "./page";
import { META_DESCRIPTION_MAX, TITLE_MAX } from "@/lib/seo";
import { SITE } from "@/lib/site";

const html = renderToStaticMarkup(<CrochetLessonsPage />);
const schemas = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  .map((match) => JSON.parse(match[1]));

describe("crochet lessons search visibility", () => {
  it("targets the local lesson search with canonical and share metadata", () => {
    expect(metadata.title).toBe("Crochet Lessons in Northwold, Johannesburg");
    expect(`${metadata.title} | ${SITE.shortName}`.length).toBeLessThanOrEqual(TITLE_MAX);
    expect(metadata.description).toContain("Northwold, Johannesburg");
    expect(metadata.description!.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
    expect(metadata.alternates?.canonical).toBe("/crochet-lessons");
    expect(metadata.robots).toBeUndefined();
    expect(metadata.openGraph).toMatchObject({ url: "/crochet-lessons", images: [{ alt: expect.stringContaining("two students") }] });
  });

  it("renders searchable lesson and location text without client JavaScript", () => {
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    expect(html).toContain("Crochet lessons.<br/>");
    expect(html).toContain("in-person classes for beginners");
    expect(html).toContain("Graceland One, Northwold");
  });

  it("describes the actual local service and both kit prices with correct billing units", () => {
    const service = schemas.find((item) => item["@type"] === "Service");
    expect(service.url).toBe(`${SITE.url}/crochet-lessons`);
    expect(service.provider.name).toBe(SITE.name);
    expect(service.availableChannel.serviceLocation.name).toBe("Graceland One, Northwold");
    expect(service.offers).toHaveLength(10);
    expect(service.offers[0]).toMatchObject({ price: 100, priceCurrency: "ZAR" });
    expect(service.offers[1]).toMatchObject({ price: 180 });
    expect(service.offers[2].priceSpecification).toMatchObject({ price: 280, unitText: "per person · full package" });
    expect(service.offers[8].priceSpecification).toMatchObject({ price: 200, unitText: "per hour" });
    expect(service.description).toContain("1 hour");
    expect(service).not.toHaveProperty("aggregateRating");
    expect(service).not.toHaveProperty("review");
  });

  it("includes the breadcrumb back to the canonical home page", () => {
    const breadcrumb = schemas.find((item) => item["@type"] === "BreadcrumbList");
    expect(breadcrumb.itemListElement.map((item: { item: string }) => item.item)).toEqual([
      SITE.url, `${SITE.url}/crochet-lessons`,
    ]);
  });
});
