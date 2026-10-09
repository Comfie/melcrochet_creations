/**
 * Centralised SEO metadata. Every indexable page builds its `Metadata` via
 * `pageMetadata()` so canonical URLs, Open Graph and Twitter tags stay
 * consistent — Next.js merges metadata shallowly, so a page that sets
 * `openGraph` on its own silently drops the site name and locale defined in
 * the root layout.
 *
 * Copy here is search-facing (titles, meta descriptions) and never rendered
 * on the page. Keep it factual: only claims the catalogue or lib/policies.ts
 * already make. Keyword map: docs/superpowers/specs/2026-10-09-seo-foundation.md
 */
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { formatPrice } from "@/lib/format-price";

/** Google typically shows ~155–160 characters of a meta description. */
export const META_DESCRIPTION_MAX = 155;

const BASE_OPEN_GRAPH = {
  siteName: SITE.name,
  locale: "en_ZA",
} as const;

export type SeoImage = { url: string; width?: number; height?: number; alt?: string };

/**
 * app/opengraph-image.png. A page that sets `openGraph` replaces the root
 * layout's file-based image instead of inheriting it, so it is restated here.
 */
export const DEFAULT_OG_IMAGE: SeoImage = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "MelCrochet Gifted Hands — handmade crochet, made to order in South Africa",
};

type PageMetadataInput = {
  /** Page title. The root layout's template appends " | MelCrochet" unless `absoluteTitle`. */
  title: string;
  description: string;
  /** Site-relative canonical path, e.g. "/products/king-throw-blanket". */
  path: string;
  /** Defaults to the site-wide DEFAULT_OG_IMAGE. */
  images?: SeoImage[];
  absoluteTitle?: boolean;
  /** Keeps the page out of the index but lets crawlers follow its links. */
  noindex?: boolean;
  article?: { publishedTime?: string; modifiedTime?: string };
};

export function pageMetadata({
  title,
  description,
  path,
  images = [DEFAULT_OG_IMAGE],
  absoluteTitle = false,
  noindex = false,
  article,
}: PageMetadataInput): Metadata {
  const fullTitle = absoluteTitle ? title : `${title} | ${SITE.shortName}`;
  const common = {
    ...BASE_OPEN_GRAPH,
    title: fullTitle,
    description,
    url: path,
    images,
  };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: article
      ? { ...common, type: "article", ...article }
      : { ...common, type: "website" },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: images.map((img) => img.url),
    },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Cuts at a word boundary so descriptions never end mid-word. */
export function truncateText(text: string, max: number = META_DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.–—-]+$/, "")}…`;
}

/** Markdown → plain text, good enough for a meta description fallback. */
export function markdownToPlainText(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+\.)\s+/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

type ProductSeoInput = {
  name: string;
  description: string;
  priceType: "FIXED" | "QUOTE";
  price: unknown;
  currency: string;
};

/**
 * "King Throw Blanket – Handmade Crochet, R1600". Product names rarely
 * contain "crochet", which is the word shoppers search with.
 */
export function productTitle(product: ProductSeoInput): string {
  const craft = /crochet/i.test(product.name) ? "Handmade" : "Handmade Crochet";
  return `${product.name} – ${craft}, ${formatPrice(product.priceType, product.price, product.currency)}`;
}

/**
 * The product's own description first, then verifiable context (made to
 * order in South Africa, price, WhatsApp ordering) — most catalogue
 * descriptions are one short line, which makes thin, near-identical snippets.
 */
export function productMetaDescription(product: ProductSeoInput): string {
  const own = product.description.replace(/\s+/g, " ").trim();
  const sentence = own && !/[.!?…]$/.test(own) ? `${own}.` : own;
  const hasPrice = product.priceType === "FIXED" && product.price !== null && product.price !== undefined;
  const lead = hasPrice
    ? `${formatPrice(product.priceType, product.price, product.currency)}, handmade`
    : "Handmade";
  const context = `${lead} to order in South Africa. Order via WhatsApp.`;
  return truncateText(sentence ? `${sentence} ${context}` : `${product.name}. ${context}`);
}

type SeoCopy = { title: string; description: string };

/**
 * Search copy for the 12 catalogue categories, keyed by slug. A category
 * added later in the admin panel falls back to `categorySeo()`'s template.
 */
export const CATEGORY_SEO: Readonly<Record<string, SeoCopy>> = {
  "baby-blankets": {
    title: "Crochet Baby Blankets, Handmade in South Africa",
    description:
      "Soft handmade crochet baby blankets, made to order in South Africa — a thoughtful newborn gift. Choose your colours and order via WhatsApp.",
  },
  "throw-blankets": {
    title: "Chunky Crochet Throw Blankets, Lap to King",
    description:
      "Handmade crochet throw blankets for lounges and beds in lap, double, queen and king sizes. Made to order in South Africa in your colours.",
  },
  bags: {
    title: "Crochet Bags, Handmade in South Africa",
    description:
      "Handmade crochet bags for everyday use, work and gifting — laptop, diaper and picnic bags made to order in South Africa. Order via WhatsApp.",
  },
  baskets: {
    title: "Handmade Crochet Baskets for Storage & Decor",
    description:
      "Sturdy handmade crochet baskets in small, medium and large sizes for storage and décor. Made to order in South Africa — order via WhatsApp.",
  },
  hats: {
    title: "Crochet Hats & Beanies, Handmade in South Africa",
    description:
      "Warm, stylish crochet beanies and bucket hats for adults and kids, handmade to order in South Africa. Choose your colours and order via WhatsApp.",
  },
  scrunchies: {
    title: "Handmade Crochet Scrunchies",
    description:
      "Handmade crochet scrunchies — small accessories for everyday wear and easy gifting. Made to order in South Africa. Order via WhatsApp.",
  },
  "baby-sweaters": {
    title: "Crochet Baby Sweaters & Baby Clothing",
    description:
      "Soft handmade crochet sweaters for babies and toddlers, made to order in South Africa in your choice of colours. Request yours on WhatsApp.",
  },
  "kids-sweaters": {
    title: "Kids Crochet Sweaters, Handmade to Order",
    description:
      "Cosy handmade crochet sweaters for children, made to order in South Africa in the colours and sizes you choose. Order via WhatsApp.",
  },
  "adult-sweaters": {
    title: "Crochet Sweaters for Adults, Handmade in SA",
    description:
      "Custom crochet sweaters for adults, handmade to order in South Africa for style and warmth. Choose your colours and size, then order via WhatsApp.",
  },
  "kids-dresses": {
    title: "Crochet Kids Party Dresses, Handmade",
    description:
      "Handmade crochet party dresses for children's birthdays and special occasions, made to order in South Africa. Order via WhatsApp.",
  },
  "custom-orders": {
    title: "Custom Crochet Pieces, Made to Your Brief",
    description:
      "Request a custom crochet piece in your own colours, size and design, handmade to order in South Africa. Price and lead time confirmed on WhatsApp.",
  },
  "gift-sets": {
    title: "Handmade Crochet Gift Sets",
    description:
      "Curated handmade crochet gift sets for babies, birthdays and special occasions, made to order in South Africa. Ask for yours on WhatsApp.",
  },
};

export function categorySeo(category: { slug: string; name: string }): SeoCopy {
  return (
    CATEGORY_SEO[category.slug] ?? {
      title: `Handmade Crochet ${category.name}`,
      description: `Shop handmade crochet ${category.name.toLowerCase()} from ${SITE.name} — made to order in South Africa. Order via WhatsApp.`,
    }
  );
}
