import Image from "next/image";
import { ButtonLink, TextLink } from "@/components/ui/Button";
import { cld } from "@/lib/cloudinary-url";

/**
 * Cinematic hero. The main frame is Melissa at the MelCrochet market stall
 * (public/hero-market-stall.jpg), cropped to her and the chunky throw — the
 * crop also keeps the children at the photo's left edge out of frame. The
 * inset is a live catalogue photo. Both are authentic MelCrochet work.
 */
export default function Hero({
  inset,
}: {
  inset: { url: string; name: string } | null;
}) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-ink text-cream">
      <div className="shell relative grid min-h-[calc(100svh-7.75rem)] lg:min-h-[min(calc(100svh-8.25rem),58rem)] lg:grid-cols-12 lg:gap-12">
        {/* Image — full-bleed behind the copy on mobile, its own column on desktop */}
        <div className="absolute inset-0 -z-10 lg:relative lg:inset-auto lg:z-0 lg:col-span-6 lg:col-start-7 lg:row-start-1 lg:my-14">
          <div className="relative h-full w-full overflow-hidden">
            <Image
              src="/hero-market-stall.jpg"
              alt="Melissa Ruvimbo Buchirai at the MelCrochet market stall, beside a chunky pink throw blanket and a table of hand-crocheted bandanas, scrunchies and bags"
              fill
              preload
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="animate-fade object-cover object-[77%_center] lg:object-[80%_center]"
            />
          </div>
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/20 lg:hidden"
          />
          <p className="label absolute -right-8 top-1/2 hidden origin-center translate-x-1/2 rotate-90 whitespace-nowrap text-cream/60 xl:block">
            At the market &middot; Handmade to order
          </p>

          {inset && (
            <div className="enter absolute -left-16 bottom-14 hidden w-40 lg:block xl:-left-24 xl:w-52" style={{ "--i": 5 } as React.CSSProperties}>
              <div className="relative aspect-[3/4] overflow-hidden ring-[10px] ring-ink">
                <Image
                  src={cld(inset.url, "portrait")}
                  alt={inset.name}
                  fill
                  sizes="208px"
                  className="object-cover"
                />
              </div>
              <p className="label mt-3 text-[0.5625rem] text-cream/70">{inset.name}</p>
            </div>
          )}
        </div>

        {/* Copy */}
        <div className="flex flex-col justify-end pb-14 pt-48 sm:pb-20 lg:col-span-6 lg:col-start-1 lg:row-start-1 lg:justify-center lg:py-20">
          <p className="enter label text-gold" style={{ "--i": 0 } as React.CSSProperties}>
            MelCrochet Gifted Hands &middot; South Africa
          </p>
          <h1 id="hero-title" className="mt-6 text-[clamp(3.25rem,1.5rem+5vw,6.75rem)] leading-[0.95]">
            <span className="enter block" style={{ "--i": 1 } as React.CSSProperties}>
              Handcrafted.
            </span>
            <span className="enter block italic text-gold" style={{ "--i": 2 } as React.CSSProperties}>
              Distinctively
            </span>
            <span className="enter block" style={{ "--i": 3 } as React.CSSProperties}>
              Yours.
            </span>
          </h1>
          <p
            className="enter mt-8 max-w-md font-sans text-base leading-relaxed text-cream/80 sm:text-lg"
            style={{ "--i": 4 } as React.CSSProperties}
          >
            Discover contemporary crochet fashion and timeless handmade creations,
            thoughtfully crafted in South Africa.
          </p>
          <div
            className="enter mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10"
            style={{ "--i": 5 } as React.CSSProperties}
          >
            <ButtonLink href="/collections" variant="gold" size="lg">
              Explore the Collection
            </ButtonLink>
            <TextLink href="/about" className="text-cream">
              Discover Our Story
            </TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}
