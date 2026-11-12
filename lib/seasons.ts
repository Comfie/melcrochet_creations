import { PORTFOLIO, type PortfolioPhoto } from "@/lib/portfolio";
import type { CatalogueProduct } from "@/lib/catalogue";

export type Season = "summer" | "autumn" | "winter" | "spring";
export type SeasonalPiece = { id: string; photo: PortfolioPhoto; piece: string; gallery?: PortfolioPhoto[] };
export type SeasonalCampaign = {
  id: "summer" | "autumn" | "winter";
  label: string;
  title: string;
  intro: string;
  heroLines: [string, string];
  heroCopy: string;
  hero: PortfolioPhoto;
  inset: PortfolioPhoto;
  href: string;
  cta: string;
  marquee: string[];
  pieces: SeasonalPiece[];
};

export const SUMMER_CAMPAIGN: SeasonalCampaign = {
  id: "summer", label: "The summer collection", title: "A summer made by hand.",
  intro: "Crochet bikinis, tops, dresses, openwork layers, hats and bags for your warm-weather wardrobe. These are examples of our work: choose a piece, share your colours and size, and we’ll confirm your custom price and lead time.",
  heroLines: ["Made for", "sunny days."],
  heroCopy: "Crochet bikinis, statement tops, dresses and playful hats. Bring your summer wardrobe to life with a piece made by hand, for you.",
  hero: PORTFOLIO.orangeTop, inset: PORTFOLIO.pinkBikini,
  href: "/summer-collection", cta: "Explore the summer collection",
  marquee: ["Crochet bikinis", "Summer tops", "Openwork cardigans", "Crochet dresses", "Ruffle hats", "Handmade bags", "Made to order"],
  pieces: [
    { id: "bikinis", photo: PORTFOLIO.pinkBikini, piece: "crochet bikini" },
    { id: "tops", photo: PORTFOLIO.orangeTop, piece: "summer crochet top" },
    { id: "dresses", photo: PORTFOLIO.floralDress, piece: "summer crochet dress", gallery: [PORTFOLIO.floralDressBack, PORTFOLIO.floralDressWorn] },
    { id: "cardigans", photo: PORTFOLIO.redCardiganAlternate, piece: "openwork crochet cardigan", gallery: [PORTFOLIO.redCardiganFlatlay, PORTFOLIO.redCardigan] },
    { id: "colourblock-dress", photo: PORTFOLIO.colourblockDress, piece: "orange and cream crochet dress" },
    { id: "hats", photo: PORTFOLIO.beigeHat, piece: "ruffle crochet hat" },
    { id: "bags", photo: PORTFOLIO.pinkBag, piece: "crochet handbag" },
    { id: "colours", photo: PORTFOLIO.ruffleHats, piece: "colourful ruffle crochet hat" },
  ],
};

const WINTER_CAMPAIGN: SeasonalCampaign = {
  id: "winter", label: "The winter edit", title: "Warmth, with a personal touch.",
  intro: "Beanies, scarves, layers and blankets, made slowly by hand. Find inspiration in our work, then tell us the colours and size you have in mind. We’ll confirm the price and lead time before you order.",
  heroLines: ["A little", "handmade warmth."],
  heroCopy: "Wrap up in crochet scarves, beanies and layers, made to order in colours that feel like you.",
  hero: PORTFOLIO.greyScarf, inset: PORTFOLIO.navyScarf,
  href: "/collections#seasonal-edit", cta: "Explore the winter edit",
  marquee: ["Beanie & scarf sets", "Crochet layers", "Handmade blankets", "Winter gifts", "Made to order"],
  pieces: [
    { id: "grey-set", photo: PORTFOLIO.greyScarf, piece: "beanie and scarf set" },
    { id: "navy-set", photo: PORTFOLIO.navyScarf, piece: "navy beanie and scarf set" },
    { id: "layers", photo: PORTFOLIO.redCardigan, piece: "crochet cardigan" },
    { id: "grey-hat", photo: PORTFOLIO.greyHat, piece: "grey crochet bucket hat" },
    { id: "two-tone", photo: PORTFOLIO.twoToneHat, piece: "two-tone crochet bucket hat" },
    { id: "blankets", photo: { url: "/melissa.jpg", name: "Handmade chunky blanket", alt: "Melissa wrapped in a chunky crochet blanket in cream and brown tones" }, piece: "chunky crochet blanket" },
  ],
};

const AUTUMN_CAMPAIGN: SeasonalCampaign = {
  id: "autumn", label: "The autumn edit", title: "Layers for days that change.",
  intro: "Tie-front cardigans, crochet accessories and personal gifts for the change of season. Start with an example of our work and tell us your colours, size and timing for a custom quote.",
  heroLines: ["A new season.", "Your own layers."],
  heroCopy: "Crochet cardigans, wearable layers and finishing touches, thoughtfully made for the days between summer and winter.",
  hero: PORTFOLIO.redCardigan, inset: PORTFOLIO.pinkBag,
  href: "/collections#seasonal-edit", cta: "Explore the autumn edit",
  marquee: ["Crochet cardigans", "Handmade layers", "Statement hats", "Everyday bags", "Personal gifts"],
  pieces: [
    { id: "cardigans", photo: PORTFOLIO.redCardigan, piece: "tie-front crochet cardigan" },
    { id: "bags", photo: PORTFOLIO.pinkBag, piece: "crochet handbag" },
    { id: "grey-hat", photo: PORTFOLIO.greyHat, piece: "grey crochet bucket hat" },
    { id: "tops", photo: PORTFOLIO.orangeTop, piece: "crochet top" },
    { id: "two-tone", photo: PORTFOLIO.twoToneHat, piece: "two-tone crochet bucket hat" },
    { id: "scarves", photo: PORTFOLIO.navyScarf, piece: "beanie and scarf set" },
  ],
};

/** South African meteorological seasons, resolved in the business's timezone. */
export function calendarSeason(date: Date): Season {
  const month = Number(new Intl.DateTimeFormat("en-ZA", { timeZone: "Africa/Johannesburg", month: "numeric" }).format(date));
  if (month >= 3 && month <= 5) return "autumn";
  if (month >= 6 && month <= 8) return "winter";
  if (month >= 9 && month <= 11) return "spring";
  return "summer";
}

export function getSeasonalCampaign(date = new Date(), override = process.env.STOREFRONT_SEASON): SeasonalCampaign {
  const season = ["summer", "autumn", "winter", "spring"].includes(override ?? "") ? override : calendarSeason(date);
  // Spring already merchandises the coming summer; the summer collection remains available all year.
  return season === "winter" ? WINTER_CAMPAIGN : season === "autumn" ? AUTUMN_CAMPAIGN : SUMMER_CAMPAIGN;
}

/** Surface suitable real catalogue rows; do not fill summer slots with winter stock. */
export function seasonalProducts<T extends CatalogueProduct>(products: readonly T[], campaign: SeasonalCampaign, limit = 8): T[] {
  const score = (product: T) => {
    const name = product.name.toLowerCase();
    const category = product.category.slug;
    if (campaign.id === "summer") {
      if (/beanie|scarf|blanket|sweater|winter|chunky/.test(name)) return 0;
      if (/bikini|swim|crop.?top|summer|dress|skirt|shorts|halter|camisole|tank.?top|openwork|tie.?front.*cardigan|ruffle|bucket.?hat|sun.?hat/.test(name)) return 3;
      return ["bags", "scrunchies", "kids-dresses"].includes(category) ? 2 : 0;
    }
    if (campaign.id === "winter") {
      if (/beanie|scarf|blanket|sweater|cardigan/.test(name)) return 3;
      return ["adult-sweaters", "baby-sweaters", "kids-sweaters", "throw-blankets", "baby-blankets", "hats", "gift-sets"].includes(category) ? 2 : 0;
    }
    if (/cardigan|scarf|bucket.?hat/.test(name)) return 3;
    return ["adult-sweaters", "bags", "hats", "scrunchies", "gift-sets"].includes(category) ? 2 : 0;
  };
  return products.filter((p) => p.imageUrl && score(p) > 0)
    .map((p, index) => ({ p, index, rank: score(p) }))
    .sort((a, b) => b.rank - a.rank || Number(b.p.featured) - Number(a.p.featured) || a.index - b.index)
    .slice(0, limit).map(({ p }) => p);
}
