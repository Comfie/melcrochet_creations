import Image from "next/image";
import { TextLink } from "@/components/ui/Button";

export const FOUNDER_PHOTO_ALT =
  "Melissa Ruvimbo Buchirai, founder of MelCrochet Gifted Hands, wrapped in one of her handmade chunky crochet blankets";

/** Designer profile, laid out like a magazine feature. */
export default function FounderFeature() {
  return (
    <section aria-labelledby="founder-title" className="bg-sand py-24 sm:py-32">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="relative lg:col-span-5">
          <div className="reveal-img relative aspect-[4/5] overflow-hidden">
            <Image
              src="/melissa.jpg"
              alt={FOUNDER_PHOTO_ALT}
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-[50%_30%]"
            />
          </div>
          <p className="label mt-4 text-ink/65">Melissa, at home with a MelCrochet throw</p>
        </div>

        <div className="flex flex-col justify-center lg:col-span-6 lg:col-start-7">
          <p className="label flex items-center gap-3 text-gold-deep">
            <span className="tabular-nums">04</span>
            <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
            <span>Meet the Designer</span>
          </p>
          <h2 id="founder-title" className="reveal mt-6 text-display">
            Melissa
            <br />
            <span className="italic">Ruvimbo Buchirai</span>
          </h2>
          <p className="label mt-4 text-ink/65">Founder &amp; Maker, MelCrochet Gifted Hands</p>

          <div className="mt-10 grid gap-6 font-sans text-[0.9375rem] leading-relaxed text-ink/75 sm:grid-cols-2">
            <p>
              MelCrochet began with Melissa&apos;s passion for crochet — one that
              has grown into a business built on gifted hands, patient craft
              and the desire to make pieces people treasure.
            </p>
            <p>
              Every item is more than a product: it is a carefully crafted piece
              designed to bring warmth, beauty and comfort into everyday life.
            </p>
          </div>

          <blockquote className="mt-12 border-l border-gold-deep pl-6">
            <p className="font-display text-lede italic">
              &ldquo;To create premium handmade crochet products that combine
              comfort, beauty and quality.&rdquo;
            </p>
            <footer className="label mt-4 text-ink/65">The MelCrochet mission</footer>
          </blockquote>

          <TextLink href="/about" className="mt-12 text-ink">
            Read the full story
          </TextLink>
        </div>
      </div>
    </section>
  );
}
