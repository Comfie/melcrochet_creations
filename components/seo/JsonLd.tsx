/**
 * Server components — render inline where relevant:
 *   <OrganizationJsonLd /> + <WebSiteJsonLd />  on the home page
 *   <ProductJsonLd .../>                        on the product detail page
 *   <BreadcrumbJsonLd items={...}/>             on shop, product and journal pages
 *   <BlogPostingJsonLd .../>                    on journal articles
 *   <FaqJsonLd items={...}/>                    on the FAQ page
 * Only verified facts go in here — no invented reviews, ratings, SKUs,
 * stock levels, street addresses or shipping promises.
 * Validate with https://search.google.com/test/rich-results after deploying.
 */
import { SITE } from "@/lib/site";

const ORGANIZATION_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

/** Square PNG (180×180) — Google needs a crawlable raster logo of at least 112px. */
const LOGO_URL = `${SITE.url}/apple-icon.png`;

function JsonLdScript({ data }: { data: object }) {
  // Escape dangerous characters that could break out of the <script> tag.
  // This prevents XSS if the JSON contains admin-entered content like product descriptions.
  // Standard JSON parsers (including JSON.parse and schema.org validators) transparently
  // decode these escapes back to the original characters.
  const json = JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

/** Lightweight publisher/seller reference, usable on any page. */
const ORGANIZATION_REF = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: SITE.name,
  url: SITE.url,
} as const;

/**
 * MelCrochet is a home-based maker that sells over WhatsApp with courier
 * delivery or collection by arrangement — there is no storefront, street
 * address or opening hours to publish, so this is an Organization rather
 * than a LocalBusiness.
 */
export function OrganizationJsonLd() {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": ORGANIZATION_ID,
        name: SITE.name,
        alternateName: SITE.shortName,
        url: SITE.url,
        logo: { "@type": "ImageObject", url: LOGO_URL, width: 180, height: 180 },
        image: `${SITE.url}/opengraph-image.png`,
        description: SITE.description,
        slogan: SITE.tagline,
        email: SITE.email,
        telephone: `+${SITE.whatsappNumber}`,
        founder: { "@type": "Person", name: "Melissa Ruvimbo Buchirai" },
        address: {
          "@type": "PostalAddress",
          addressLocality: SITE.locality,
          addressCountry: "ZA",
        },
        areaServed: { "@type": "Country", name: "South Africa" },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: `+${SITE.whatsappNumber}`,
          email: SITE.email,
          areaServed: "ZA",
          availableLanguage: "en",
        },
        sameAs: [SITE.instagram, SITE.youtube, SITE.facebook],
      }}
    />
  );
}

/** Tells Google the preferred site name ("MelCrochet Gifted Hands"). */
export function WebSiteJsonLd() {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        name: SITE.name,
        alternateName: SITE.shortName,
        url: SITE.url,
        inLanguage: "en-ZA",
        publisher: { "@id": ORGANIZATION_ID },
      }}
    />
  );
}

interface ProductJsonLdProps {
  name: string;
  description: string;
  slug: string;
  images: string[];
  priceType: "FIXED" | "QUOTE";
  price: number | null;
  categoryName?: string;
}

/**
 * Only fixed-price pieces get Product markup: Google requires an offer,
 * review or rating, and quote-only pieces have none of those that we can
 * state truthfully. Availability is MadeToOrder — every piece is crocheted
 * after the order is placed on WhatsApp.
 */
export function ProductJsonLd({
  name,
  description,
  slug,
  images,
  priceType,
  price,
  categoryName,
}: ProductJsonLdProps) {
  if (priceType !== "FIXED" || price === null) return null;

  const url = `${SITE.url}/products/${slug}`;
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": `${url}#product`,
        name,
        description,
        ...(images.length > 0 ? { image: images } : {}),
        ...(categoryName ? { category: categoryName } : {}),
        brand: { "@type": "Brand", name: SITE.name },
        url,
        offers: {
          "@type": "Offer",
          url,
          priceCurrency: "ZAR",
          price,
          availability: "https://schema.org/MadeToOrder",
          itemCondition: "https://schema.org/NewCondition",
          seller: ORGANIZATION_REF,
        },
      }}
    />
  );
}

export interface BreadcrumbItem {
  name: string;
  /** Site-relative path, e.g. "/products?collection=home-living". */
  path: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  if (items.length === 0) return null;
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: `${SITE.url}${item.path === "/" ? "" : item.path}`,
        })),
      }}
    />
  );
}

interface BlogPostingJsonLdProps {
  title: string;
  description: string | null;
  slug: string;
  image: string | null;
  datePublished: Date | null;
  dateModified: Date;
}

export function BlogPostingJsonLd({
  title,
  description,
  slug,
  image,
  datePublished,
  dateModified,
}: BlogPostingJsonLdProps) {
  const url = `${SITE.url}/blog/${slug}`;
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: title.length > 110 ? `${title.slice(0, 109).trimEnd()}…` : title,
        ...(description ? { description } : {}),
        ...(image ? { image: [image] } : {}),
        ...(datePublished ? { datePublished: datePublished.toISOString() } : {}),
        dateModified: dateModified.toISOString(),
        // Posts are published under the brand; there is no per-post author field.
        author: ORGANIZATION_REF,
        publisher: {
          ...ORGANIZATION_REF,
          logo: { "@type": "ImageObject", url: LOGO_URL, width: 180, height: 180 },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        url,
        inLanguage: "en-ZA",
      }}
    />
  );
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }}
    />
  );
}
