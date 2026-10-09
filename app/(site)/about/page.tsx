import type { Metadata } from "next";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import Logo from "@/components/Logo";
import { FOUNDER_PHOTO_ALT } from "@/components/home/FounderFeature";

export const metadata: Metadata = {
  title: "About MelCrochet Gifted Hands",
  description:
    "Meet Melissa Ruvimbo Buchirai, founder of MelCrochet Gifted Hands — handmade crochet blankets, bags and gifts crafted with patience and care in South Africa.",
};

const VALUES = [
  { name: "Quality", description: "Every product should be neat, durable and carefully finished." },
  { name: "Creativity", description: "Designs should feel beautiful, fresh and personal." },
  { name: "Excellence", description: "The business should improve its process with every order." },
  { name: "Integrity", description: "Customers should receive honest updates and clear policies." },
  { name: "Customer Satisfaction", description: "The experience should be warm, helpful and reliable." },
  { name: "Professionalism", description: "MelCrochet should operate with records, systems and standards." },
];

function Chapter({ numeral, title, tone = "light" }: { numeral: string; title: string; tone?: "light" | "dark" }) {
  return (
    <p className={`label flex items-center gap-3 ${tone === "dark" ? "text-gold" : "text-gold-deep"}`}>
      <span>Chapter {numeral}</span>
      <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
      <span>{title}</span>
    </p>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* Opening spread */}
      <section className="overflow-hidden bg-cream">
        <div className="shell grid gap-12 pb-20 pt-14 sm:pt-20 lg:grid-cols-12 lg:gap-16 lg:pb-28">
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <p className="enter label text-gold-deep">Our Story</p>
              <h1 className="enter mt-6 text-hero" style={{ "--i": 1 } as React.CSSProperties}>
                Gifted hands,
                <br />
                <span className="italic text-brown">patient craft.</span>
              </h1>
            </div>
            <p
              className="enter mt-12 max-w-xl font-display text-lede font-light"
              style={{ "--i": 2 } as React.CSSProperties}
            >
              Welcome to MelCrochet Gifted Hands — a handmade crochet brand created
              with passion, patience and care.
            </p>
          </div>
          <figure className="relative lg:col-span-5">
            {/* Official MelCrochet badge as a seal over the portrait's corner. */}
            <div className="absolute -bottom-6 left-0 z-10 hidden h-28 w-28 rounded-full bg-cream p-1.5 shadow-[0_12px_32px_-12px_rgba(21,21,21,0.35)] sm:block lg:-left-10">
              <Logo variant="badge" decorative className="h-full w-full" />
            </div>
            <div className="enter relative aspect-[4/5] overflow-hidden" style={{ "--i": 2 } as React.CSSProperties}>
              <Image
                src="/melissa.jpg"
                alt={FOUNDER_PHOTO_ALT}
                fill
                preload
                sizes="(max-width: 1024px) 100vw, 42vw"
                className="object-cover object-[50%_30%]"
              />
            </div>
            <figcaption className="label mt-4 text-ink/65 sm:pl-32">Melissa Ruvimbo Buchirai, Founder</figcaption>
          </figure>
        </div>
      </section>

      {/* I — The Maker */}
      <section className="border-t border-ink/10 bg-cream py-24 sm:py-32">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Chapter numeral="I" title="The Maker" />
            <h2 className="mt-6 text-section">Melissa Ruvimbo Buchirai</h2>
          </div>
          <div className="reveal grid gap-8 font-sans text-[1.0625rem] leading-relaxed text-ink/80 sm:grid-cols-2 lg:col-span-7 lg:col-start-6">
            <p>
              MelCrochet is led by founder Melissa Ruvimbo Buchirai, whose passion
              for crochet has grown into a business vision. The brand is built
              around gifted hands, patient craft and the desire to make handmade
              items that customers can treasure.
            </p>
            <p>
              Every item is more than a product; it&apos;s a carefully crafted piece
              designed to bring warmth, beauty and comfort into everyday life.
            </p>
          </div>
        </div>
      </section>

      {/* II — The Craft */}
      <section className="bg-sand py-24 sm:py-32">
        <div className="shell grid gap-12 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="reveal-img relative aspect-square overflow-hidden lg:col-span-6">
            <Image
              src="/melissa.jpg"
              alt="Close-up of chunky hand-crocheted loops in cream, caramel and chocolate brown"
              fill
              sizes="(max-width: 640px) 240vw, 120vw"
              className="origin-[40%_85%] scale-[2.4] object-cover object-[40%_85%]"
            />
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <Chapter numeral="II" title="The Craft" />
            <h2 className="mt-6 text-section">
              Made slowly, <span className="italic">on purpose.</span>
            </h2>
            <div className="mt-8 space-y-5 font-sans leading-relaxed text-ink/75">
              <p>
                Every MelCrochet piece is made by hand, one stitch at a time — the
                blankets, bags, sweaters, hats and gifts alike.
              </p>
              <p>
                Because each piece is made to order, it can be made in the
                colours and sizes you choose. Neat stitches and careful finishing
                mean it is made to be used, loved and kept.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* III — Mission & Vision */}
      <section className="bg-ink py-24 text-cream sm:py-32">
        <div className="shell">
          <Chapter numeral="III" title="Mission & Vision" tone="dark" />
          <div className="mt-14 grid gap-16 lg:grid-cols-2 lg:gap-20">
            <figure className="reveal">
              <figcaption className="label text-cream/60">Our Mission</figcaption>
              <blockquote className="mt-6 font-display text-[clamp(1.75rem,1.3rem+1.6vw,2.75rem)] font-light leading-[1.2]">
                To create premium handmade crochet products that combine comfort,
                beauty and quality while providing exceptional customer service.
              </blockquote>
            </figure>
            <figure className="reveal">
              <figcaption className="label text-cream/60">Our Vision</figcaption>
              <blockquote className="mt-6 font-display text-[clamp(1.75rem,1.3rem+1.6vw,2.75rem)] font-light italic leading-[1.2] text-gold">
                To become one of Africa&apos;s leading handmade crochet brands,
                supplying homes, retailers and international markets with
                luxurious handcrafted products.
              </blockquote>
            </figure>
          </div>
        </div>
      </section>

      {/* IV — Values */}
      <section className="bg-cream py-24 sm:py-32">
        <div className="shell">
          <Chapter numeral="IV" title="Our Values" />
          <h2 className="mt-6 max-w-2xl text-section">
            What every piece <span className="italic">stands for.</span>
          </h2>
          <ol className="mt-16 grid border-t border-ink/15 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((value, i) => (
              <li key={value.name} className="reveal border-b border-ink/15 py-10 sm:pr-10">
                <span className="font-display text-4xl italic text-gold-deep">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-5 font-display text-2xl">{value.name}</h3>
                <p className="mt-2 max-w-xs font-sans text-sm leading-relaxed text-ink/70">{value.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Closing */}
      <section className="bg-brown py-24 text-cream sm:py-32">
        <div className="shell flex flex-col items-start gap-10 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="max-w-3xl text-display">
            Find the piece that&apos;s <span className="italic text-gold">yours.</span>
          </h2>
          <div className="flex flex-col gap-4 sm:flex-row">
            <ButtonLink href="/collections" variant="gold" size="lg">
              Explore the Collection
            </ButtonLink>
            <ButtonLink href="/custom-orders" variant="outline-light" size="lg">
              Request a Custom Piece
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
