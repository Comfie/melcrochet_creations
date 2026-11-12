import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import SummerCollectionPage, { metadata } from "./page";
import { META_DESCRIPTION_MAX, TITLE_MAX } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { SUMMER_CAMPAIGN, getSeasonalCampaign } from "@/lib/seasons";
import Hero from "@/components/home/Hero";
import SeasonalEdit from "@/components/home/SeasonalEdit";

describe("seasonal collection pages", () => {
  it("keeps the permanent summer page indexable with local search metadata", () => {
    expect(metadata.alternates?.canonical).toBe("/summer-collection");
    expect(metadata.robots).toBeUndefined();
    expect(metadata.description!.length).toBeLessThanOrEqual(META_DESCRIPTION_MAX);
    expect(`${metadata.title} | ${SITE.shortName}`.length).toBeLessThanOrEqual(TITLE_MAX);
    const html = renderToStaticMarkup(<SummerCollectionPage />);
    expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    for (const piece of SUMMER_CAMPAIGN.pieces) expect(html).toContain(`id="${piece.id}"`);
    expect(html).toContain("South Africa");
    expect(html).toContain("quoted individually");
    expect(html).not.toContain('"@type":"Product"');
  });

  it.each(["summer", "autumn", "winter"])("renders an enquiry-driven %s edit without inventing prices", (season) => {
    const campaign = getSeasonalCampaign(new Date("2026-11-12"), season);
    const html = renderToStaticMarkup(<SeasonalEdit campaign={campaign} />);
    expect(html.match(/<article /g)).toHaveLength(campaign.pieces.length);
    expect(html).toContain("https://wa.me/");
    expect(html).not.toContain("/products/undefined");
    expect(html).not.toContain("In stock");
    const hero = renderToStaticMarkup(<Hero campaign={campaign} />);
    expect(hero).toContain(campaign.heroLines[0]);
    expect(hero).toContain(`href="${campaign.href}"`);
  });
});
