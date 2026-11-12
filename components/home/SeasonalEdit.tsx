import Image from "next/image";
import { ButtonLink, TextLink } from "@/components/ui/Button";
import type { SeasonalCampaign } from "@/lib/seasons";
import { buildCustomOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp";

export default function SeasonalEdit({ campaign, preview = false }: { campaign: SeasonalCampaign; preview?: boolean }) {
  const pieces = preview ? campaign.pieces.slice(0, 3) : campaign.pieces;
  return (
    <section id="seasonal-edit" aria-labelledby="seasonal-title" className="scroll-mt-24 bg-sand py-20 sm:py-28">
      <div className="shell">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-16">
          <div><p className="label text-gold-deep">{campaign.label}</p><h2 id="seasonal-title" className="mt-5 text-display">{campaign.title}</h2></div>
          <p className="max-w-xl leading-relaxed text-ink/75">{campaign.intro}</p>
        </div>
        <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {pieces.map(({ id, photo, piece, gallery }) => (
            <article id={id} key={id} className="scroll-mt-28">
              <a href={buildWhatsAppLink(buildCustomOrderMessage({ piece }))} target="_blank" rel="noopener noreferrer" className="group block" aria-label={`Enquire about a ${piece}`}>
                <div className="relative aspect-[3/4] overflow-hidden bg-cream"><Image src={photo.url} alt={photo.alt} fill quality={95} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" /></div>
                <h3 className="mt-5 font-display text-2xl">{photo.name}</h3>
              </a>
              <p className="mt-2 text-sm text-ink/70">Made to order · Colours and size by arrangement</p>
              <TextLink href={buildWhatsAppLink(buildCustomOrderMessage({ piece }))} external className="mt-5">Request your own</TextLink>
              {gallery && gallery.length > 0 && <details className="mt-5 border-t border-ink/15 pt-3">
                <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold">More photos of this piece</summary>
                <div className="mt-3 grid grid-cols-2 gap-3">{gallery.map((extra) => <a key={extra.url} href={extra.url} target="_blank" rel="noopener noreferrer" className="block"><div className="relative aspect-[3/4] overflow-hidden bg-cream"><Image src={extra.url} alt={extra.alt} fill quality={95} sizes="(max-width: 640px) 50vw, 20vw" className="object-contain" /></div><span className="mt-2 block text-xs text-ink/70">{extra.name}</span></a>)}</div>
              </details>}
            </article>
          ))}
        </div>
        {preview && <div className="mt-12"><ButtonLink href={campaign.href} variant="outline">{campaign.cta}</ButtonLink></div>}
      </div>
    </section>
  );
}
