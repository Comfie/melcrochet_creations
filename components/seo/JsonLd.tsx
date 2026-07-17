/**
 * Server components — render inline where relevant:
 *   <ProductJsonLd .../>     on the product detail page
 *   <LocalBusinessJsonLd />  on the home page
 *   <FaqJsonLd items={...}/> on the FAQ page
 * Validate with https://search.google.com/test/rich-results after deploying.
 */
import { SITE } from "@/lib/site";

function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify of our own trusted data — no user HTML involved.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
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
