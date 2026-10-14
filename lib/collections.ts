/**
 * Customer-facing "collections" — an editorial grouping layered on top of the
 * 12 catalogue categories. Collections are static config (not a DB table):
 * every category belongs to exactly one collection, so nothing in the
 * catalogue becomes undiscoverable. If a new category is added in the admin
 * panel without being mapped here, `collectionForCategory` returns null and
 * the shop still lists it under "All".
 */
export type Collection = {
  slug: string;
  name: string;
  /** Short editorial line shown under the collection name. */
  tagline: string;
  /**
   * What the collection holds and how its pieces are made, shown below the
   * collection's product grid. Facts only — every claim restates
   * CATEGORY_SEO (lib/seo.ts) or POLICY (lib/policies.ts).
   */
  intro: string;
  /** Category slugs (see prisma/seed-data.ts) in display order. */
  categorySlugs: readonly string[];
  /**
   * Product slugs to try first for the collection's lead image, so e.g.
   * Crochet Fashion leads with adult pieces rather than whichever photographed
   * product happens to sort first. Falls back to catalogue order.
   */
  leadProductSlugs?: readonly string[];
  /** Search-facing title and meta description (never rendered on the page). */
  seo: { title: string; description: string };
};

export const COLLECTIONS: readonly Collection[] = [
  {
    slug: "crochet-fashion",
    name: "Crochet Fashion",
    tagline: "Sweaters and hats, handmade to wear with intent.",
    intro:
      "Crochet Fashion brings together our adult crochet sweaters and our beanies and bucket hats, each crocheted by hand once you order. Choose your colours and size, and we'll confirm the details and lead time with you on WhatsApp before we start.",
    categorySlugs: ["adult-sweaters", "hats"],
    leadProductSlugs: ["adult-sweater", "adult-ruffle-bucket-hat", "adult-beanie-hat"],
    seo: {
      title: "Crochet Fashion — Sweaters & Hats, Handmade",
      description:
        "Contemporary crochet fashion from South Africa — handmade sweaters, beanies and bucket hats, made to order in your colours. Order via WhatsApp.",
    },
  },
  {
    slug: "bags-accessories",
    name: "Bags & Accessories",
    tagline: "Everyday bags and finishing touches, stitched by hand.",
    intro:
      "Bags & Accessories covers our handmade crochet bags — for everyday use, work and gifting, including laptop, diaper and picnic bags — along with crochet scrunchies, small finishing touches that make easy gifts. Every piece is made to order in South Africa.",
    categorySlugs: ["bags", "scrunchies"],
    leadProductSlugs: ["casual-handbag-with-accessories", "laptop-bag"],
    seo: {
      title: "Crochet Bags & Accessories, South Africa",
      description:
        "Handmade crochet bags, scrunchies and accessories for everyday style and gifting, made to order in South Africa. Order via WhatsApp.",
    },
  },
  {
    slug: "baby-kids",
    name: "Baby & Kids",
    tagline: "Soft blankets, sweaters and occasion dresses for little ones.",
    intro:
      "Baby & Kids gathers soft crochet baby blankets, sweaters for babies, toddlers and older children, and crochet party dresses for birthdays and special occasions. Each piece is handmade to order in the colours you choose — a thoughtful gift for a newborn or a little one's big day.",
    categorySlugs: ["baby-blankets", "baby-sweaters", "kids-sweaters", "kids-dresses"],
    seo: {
      title: "Crochet Baby & Kids Clothing and Blankets",
      description:
        "Soft crochet baby blankets, baby and kids sweaters and party dresses, handmade to order in South Africa. Order via WhatsApp.",
    },
  },
  {
    slug: "home-living",
    name: "Home & Living",
    tagline: "Statement throws and sturdy baskets for the spaces you love.",
    intro:
      "Home & Living pairs our chunky crochet throw blankets, in lap, double, queen and king sizes, with sturdy crochet baskets in small, medium and large for storage and décor. Larger pieces take longer to make — queen and king throws may take 1–2 weeks.",
    categorySlugs: ["throw-blankets", "baskets"],
    seo: {
      title: "Crochet Blankets & Baskets for the Home",
      description:
        "Handmade crochet throw blankets and storage baskets for the home, made to order in South Africa in lap to king sizes. Order via WhatsApp.",
    },
  },
  {
    slug: "gifts-custom",
    name: "Gifts & Custom Creations",
    tagline: "Curated gift sets and pieces made entirely to your brief.",
    intro:
      "Gifts & Custom Creations covers curated crochet gift sets for babies, birthdays and special occasions, and custom pieces made to your own brief. Tell us the colours, size and design you have in mind on WhatsApp — we'll confirm feasibility, price and lead time before we begin.",
    categorySlugs: ["gift-sets", "custom-orders"],
    seo: {
      title: "Handmade Crochet Gifts & Custom Orders",
      description:
        "Handmade crochet gifts and gift sets, plus custom pieces made to your brief in South Africa. Start your request on WhatsApp.",
    },
  },
] as const;

export function getCollectionBySlug(slug: string | undefined | null): Collection | null {
  if (!slug) return null;
  return COLLECTIONS.find((c) => c.slug === slug) ?? null;
}

export function collectionForCategory(categorySlug: string | undefined | null): Collection | null {
  if (!categorySlug) return null;
  return COLLECTIONS.find((c) => c.categorySlugs.includes(categorySlug)) ?? null;
}
