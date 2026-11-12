import Image from "next/image";
import { ButtonLink, TextLink } from "@/components/ui/Button";
import type { SeasonalCampaign } from "@/lib/seasons";

/** The seasonal campaign is selected on the server to keep first paint and hydration consistent. */
export default function Hero({ campaign }: { campaign: SeasonalCampaign }) {
  return (
    <section aria-labelledby="hero-title" className="bg-cream">
      <div className="shell grid items-center gap-12 pb-14 pt-10 sm:pb-20 sm:pt-14 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-6">
          <p className="label text-gold-deep">{campaign.label} · Handmade in South Africa</p>
          <h1 id="hero-title" className="mt-6 text-[clamp(3.25rem,1.5rem+5vw,6.75rem)] leading-[0.95]">{campaign.heroLines[0]}<br />{campaign.heroLines[1]}</h1>
          <p className="mt-8 max-w-lg text-base leading-relaxed text-ink/75 sm:text-lg">{campaign.heroCopy}</p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <ButtonLink href={campaign.href} size="lg" className="max-w-full text-center">{campaign.cta}</ButtonLink>
            <TextLink href="/custom-orders">Create your own piece</TextLink>
          </div>
          <p className="mt-6 text-sm text-ink/65">Your colours. Your size. A price confirmed before we begin.</p>
        </div>
        <div className="relative lg:col-span-6 lg:pl-10">
          <div className="relative aspect-[3/4] overflow-hidden bg-sand"><Image src={campaign.hero.url} alt={campaign.hero.alt} fill preload quality={95} sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" /></div>
          <div className="absolute -bottom-6 -left-4 hidden w-36 border-[8px] border-cream sm:block lg:w-44 xl:w-52">
            <div className="relative aspect-[3/4] bg-sand"><Image src={campaign.inset.url} alt={campaign.inset.alt} fill quality={95} sizes="208px" className="object-contain" /></div>
          </div>
          <p className="mt-4 text-right text-sm text-ink/65">{campaign.hero.name}</p>
        </div>
      </div>
    </section>
  );
}
