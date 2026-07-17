/**
 * Server components — render inline where relevant:
 *   <ProductJsonLd .../>     on the product detail page
 *   <LocalBusinessJsonLd />  on the home page
 *   <FaqJsonLd items={...}/> on the FAQ page
 * Validate with https://search.google.com/test/rich-results after deploying.
 */
import { SITE } from "@/lib/site";

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

interface ProductJsonLdProps {
  name: string;
  description: string;
  slug: string;
  images: string[];
  priceType: "FIXED" | "QUOTE";
  price: number | null;
}

export function ProductJsonLd({
  name,
  description,
  slug,
  images,
  priceType,
  price,
}: ProductJsonLdProps) {
  const url = `${SITE.url}/products/${slug}`;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: images,
    brand: { "@type": "Brand", name: SITE.name },
    url,
  };

  // Omit Offer entirely for "Quote on Request" items — a priceless Offer
  // fails Rich Results validation.
  if (priceType === "FIXED" && price !== null) {
    data.offers = {
      "@type": "Offer",
      priceCurrency: "ZAR",
      price,
      availability: "https://schema.org/MadeToOrder",
      url,
    };
  }

  return <JsonLdScript data={data} />;
}

export function LocalBusinessJsonLd() {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: SITE.name,
        url: SITE.url,
        email: SITE.email,
        telephone: `+${SITE.whatsappNumber}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: SITE.locality,
          addressCountry: "ZA",
        },
        sameAs: [SITE.instagram, SITE.facebook],
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
