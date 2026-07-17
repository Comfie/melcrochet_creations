import type { Metadata } from "next";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import StitchDivider from "@/components/StitchDivider";

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

export default function AboutPage() {
  return (
    <>
      <section className="bg-ink text-cream">
        <div className="mx-auto max-w-6xl px-5 py-24">
          <h1 className="text-hero max-w-2xl">Meet the Maker</h1>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:grid-cols-2 sm:items-center">
          <ImagePlaceholder className="aspect-[4/3] w-full order-2 sm:order-1" />
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
              <p className="font-sans text-sm font-semibold uppercase tracking-wide text-brown">
                Mission
              </p>
              <p className="mt-3 font-display text-xl">
                To create premium handmade crochet products that combine comfort,
                beauty and quality while providing exceptional customer service.
              </p>
            </div>
            <div className="border border-taupe/30 p-8">
              <p className="font-sans text-sm font-semibold uppercase tracking-wide text-brown">
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
              <div key={value.name}>
                <p className="font-display text-lg text-gold">{value.name}</p>
                <p className="mt-2 font-sans text-sm text-cream/70">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
