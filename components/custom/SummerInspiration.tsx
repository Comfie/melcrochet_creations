import Image from "next/image";
import { MessageCircle, Plus } from "lucide-react";
import { PORTFOLIO } from "@/lib/portfolio";
import { ButtonLink } from "@/components/ui/Button";
import { buildCustomOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp";

export default function SummerInspiration() {
  return (
    <section aria-labelledby="summer-title" className="bg-cream py-20 sm:py-28">
      <div className="shell grid items-center gap-10 lg:grid-cols-2 lg:gap-20">
        <figure>
          <div className="relative aspect-[3/4] overflow-hidden bg-sand">
            <Image src={PORTFOLIO.pinkBikini.url} alt={PORTFOLIO.pinkBikini.alt} fill quality={95} sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain" />
          </div>
          <figcaption className="mt-4 text-sm text-ink/70">Pink crochet bikini with scalloped edges and tie details.</figcaption>
        </figure>
        <div>
          <p className="label text-gold-deep">Summer crochet</p>
          <h2 id="summer-title" className="mt-6 text-display">Crochet bikinis,<br />made for summer.</h2>
          <p className="mt-6 max-w-lg leading-relaxed text-ink/75">Bring a little handmade detail to your summer wardrobe. This pink two-piece is an example of our crochet work — share your favourite colour, size and the design you have in mind, and we’ll help you plan your own.</p>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-ink/70">Every bikini is a custom enquiry. We’ll confirm the design, price and lead time with you before you order.</p>
          <div className="mt-8">
            <ButtonLink href={buildWhatsAppLink(buildCustomOrderMessage({ piece: "crochet bikini" }))} external size="lg"><MessageCircle size={18} aria-hidden="true" />Enquire about a crochet bikini</ButtonLink>
          </div>
          <details className="group mt-8 max-w-lg border-y border-ink/15">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 text-sm [&::-webkit-details-marker]:hidden">See the original bikini photo<Plus size={18} aria-hidden="true" className="shrink-0 transition-transform group-open:rotate-45" /></summary>
            <div className="relative mb-5 aspect-[3/4] overflow-hidden">
              <Image src={PORTFOLIO.pinkBikiniOriginal.url} alt={PORTFOLIO.pinkBikiniOriginal.alt} fill quality={95} sizes="(max-width: 1024px) 100vw, 50vw" className="object-contain" />
            </div>
          </details>
        </div>
      </div>
    </section>
  );
}
