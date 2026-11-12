import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SUMMER_CAMPAIGN } from "@/lib/seasons";
import SeasonalEdit from "@/components/home/SeasonalEdit";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { ButtonLink } from "@/components/ui/Button";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export const revalidate = 3600;
export const metadata: Metadata = pageMetadata({
  title: "Summer Crochet — Bikinis, Tops, Dresses & Hats",
  description: "Discover crochet bikinis, summer tops, dresses, hats and bags in South Africa. Choose your colours and size. Request a custom quote from MelCrochet.",
  path: "/summer-collection",
  images: [{ url: SUMMER_CAMPAIGN.hero.url, alt: SUMMER_CAMPAIGN.hero.alt }],
});

/** A permanent, indexable edit: summer pieces stay available outside the promoted season. */
export default function SummerCollectionPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Summer Collection", path: "/summer-collection" }]} />
      <section className="bg-cream">
        <div className="shell py-14 sm:py-20">
          <nav aria-label="Breadcrumb" className="flex gap-3 text-sm text-ink/65"><Link href="/" className="underline underline-offset-4">Home</Link><span aria-hidden="true">/</span><span>Summer collection</span></nav>
          <h1 className="mt-8 max-w-4xl text-hero">Your summer.<br />Your kind of crochet.</h1>
          <p className="mt-6 max-w-2xl leading-relaxed text-ink/75">Explore summer crochet made to order in South Africa — bikinis, tops, statement dresses and finishing touches. Every piece starts with a conversation about your colours, size and design.</p>
          <nav aria-label="Summer pieces" className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">{SUMMER_CAMPAIGN.pieces.map(({ id, piece }) => <a key={id} href={`#${id}`} className="border-b border-ink/30 py-2 capitalize hover:border-ink">{piece}</a>)}</nav>
        </div>
      </section>
      <SeasonalEdit campaign={SUMMER_CAMPAIGN} />
      <section className="bg-brown py-16 text-cream sm:py-24">
        <div className="shell grid items-center gap-8 lg:grid-cols-2">
          <div><h2 className="text-section">Make it your own.</h2><p className="mt-5 max-w-xl leading-relaxed text-cream/80">Send the piece you love, your preferred colours and size, and when you need it. Melissa will confirm the design, price and lead time. These are examples of our work, with each request quoted individually.</p></div>
          <div className="lg:justify-self-end"><ButtonLink href={buildWhatsAppLink("Hi MelCrochet! I'd like to enquire about a piece from your summer collection. Could you help me with colours, sizing and a quote?")} external variant="gold" size="lg">Plan your summer piece</ButtonLink></div>
        </div>
      </section>
    </>
  );
}
