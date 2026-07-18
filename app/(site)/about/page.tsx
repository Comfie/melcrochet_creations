import type { Metadata } from "next";
import Image from "next/image";
import { Compass, Eye, Sparkles, Palette, Star, ShieldCheck, Heart, Briefcase } from "lucide-react";
import StitchDivider from "@/components/StitchDivider";

export const metadata: Metadata = {
  title: "About MelCrochet Gifted Hands",
  description:
    "Meet Melissa Ruvimbo Buchirai, founder of MelCrochet Gifted Hands — handmade crochet blankets, bags and gifts crafted with patience and care in South Africa.",
};

const VALUES = [
  { name: "Quality", description: "Every product should be neat, durable and carefully finished.", icon: Sparkles },
  { name: "Creativity", description: "Designs should feel beautiful, fresh and personal.", icon: Palette },
  { name: "Excellence", description: "The business should improve its process with every order.", icon: Star },
  { name: "Integrity", description: "Customers should receive honest updates and clear policies.", icon: ShieldCheck },
  { name: "Customer Satisfaction", description: "The experience should be warm, helpful and reliable.", icon: Heart },
  { name: "Professionalism", description: "MelCrochet should operate with records, systems and standards.", icon: Briefcase },
];

export default function AboutPage() {
  return (
    <>
      <section className="relative flex min-h-[60vh] items-end overflow-hidden bg-ink text-cream">
        <Image
          src="/melissa.jpg"
          alt="Melissa Ruvimbo Buchirai, founder of MelCrochet Gifted Hands, wrapped in a handmade crochet blanket"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/55 to-ink/35"
        />
        <div className="relative mx-auto w-full max-w-6xl px-5 py-20">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Our Story
          </p>
          <h1 className="mt-3 text-hero max-w-2xl">Meet the Maker</h1>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:grid-cols-2 sm:items-center">
          <div className="relative aspect-[3/4] w-full overflow-hidden border border-taupe/30 order-2 sm:order-1">
            <Image
              src="/melissa.jpg"
              alt="Melissa Ruvimbo Buchirai, founder of MelCrochet Gifted Hands, wrapped in a handmade crochet blanket"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="order-1 sm:order-2">
            <h2 className="text-section">Melissa Ruvimbo Buchirai</h2>
            <p className="mt-4 font-sans text-ink/70">
              MelCrochet is led by founder Melissa Ruvimbo Buchirai, whose passion
              for crochet has grown into a business vision. The brand is built
              around gifted hands, patient craft and the desire to make handmade
              items that customers can treasure.
            </p>
            <p className="mt-4 font-sans text-ink/70">
              Welcome to MelCrochet Gifted Hands — a handmade crochet brand
              created with passion, patience and care. Every item is more than a
              product; it&apos;s a carefully crafted piece designed to bring
              warmth, beauty and comfort into everyday life.
            </p>
          </div>
        </div>
      </section>

      <StitchDivider className="text-taupe" />

      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="border border-taupe/30 p-8">
              <Compass className="h-6 w-6 text-brown" aria-hidden="true" />
              <p className="mt-3 font-sans text-sm font-semibold uppercase tracking-wide text-brown">
                Mission
              </p>
              <p className="mt-3 font-display text-xl">
                To create premium handmade crochet products that combine comfort,
                beauty and quality while providing exceptional customer service.
              </p>
            </div>
            <div className="border border-taupe/30 p-8">
              <Eye className="h-6 w-6 text-brown" aria-hidden="true" />
              <p className="mt-3 font-sans text-sm font-semibold uppercase tracking-wide text-brown">
                Vision
              </p>
              <p className="mt-3 font-display text-xl">
                To become one of Africa&apos;s leading handmade crochet brands,
                supplying homes, retailers and international markets with
                luxurious handcrafted products.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ink text-cream">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-section">Our Values</h2>
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((value) => (
              <div
                key={value.name}
                className="border border-cream/10 p-6 transition-colors hover:border-gold/40"
              >
                <value.icon className="h-6 w-6 text-gold" aria-hidden="true" />
                <p className="mt-3 font-display text-lg text-gold">{value.name}</p>
                <p className="mt-2 font-sans text-sm text-cream/70">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
