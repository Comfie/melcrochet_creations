import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import { Plus } from "lucide-react";
import { getCategories, getProducts } from "@/lib/queries";
import { photographedIn, singularPiece, toCardProduct } from "@/lib/catalogue";
import { cld } from "@/lib/cloudinary-url";
import { FAQS } from "@/lib/policies";
import { buildCustomOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import CustomOrderBuilder from "@/components/custom/CustomOrderBuilder";
import ProductCard from "@/components/ProductCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import SectionHeading from "@/components/ui/SectionHeading";
import { ANALYTICS_EVENTS, analyticsAttributes } from "@/lib/analytics";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Custom Crochet Orders in South Africa",
  description:
    "Request a custom crochet piece from MelCrochet Gifted Hands — your colours, sizes and designs, handmade to order in South Africa. Start on WhatsApp.",
  path: "/custom-orders",
});

const PERSONALISE = [
  { title: "Colours", body: "Choose the shades that suit your home, your wardrobe or the person you're gifting." },
  { title: "Sizes", body: "From newborn to adult, lap throw to king bed — tell us the size you need." },
  { title: "Designs", body: "Share a pattern, a reference photo or an idea, and we'll tell you what's possible." },
];

const PROCESS = [
  { title: "Share your idea", body: "Message us on WhatsApp — use the request builder below to send the details in one go." },
  { title: "We confirm the details", body: "We confirm feasibility, price and lead time before starting your order." },
  { title: "Secure your slot", body: "A 50% deposit begins the work; the balance is due before delivery or collection." },
  { title: "Made by hand, delivered", body: "Custom or larger pieces may take 1–2 weeks. Delivery by courier, or collection in Johannesburg." },
];

const CUSTOM_FAQ_IDS = ["custom", "lead-time", "payment", "delivery"];

export default async function CustomOrdersPage() {
  // Sequential: one Postgres connection at a time (see app/(site)/page.tsx).
  const categories = await getCategories();
  const products = await getProducts();

  const pieces = categories.filter((c) => c.slug !== "custom-orders").map((c) => singularPiece(c.name));
  const heroImage =
    photographedIn(products, ["custom-orders", "gift-sets"])[0] ??
    photographedIn(products, ["kids-dresses", "adult-sweaters", "baby-sweaters"])[0];
  const startingPoints = products
    .filter((p) => ["custom-orders", "gift-sets", "baby-sweaters"].includes(p.category.slug))
    .slice(0, 4)
    .map(toCardProduct);
  const faqs = FAQS.filter((f) => CUSTOM_FAQ_IDS.includes(f.id));

  return (
    <>
      {/* Hero */}
      <section className="bg-brown text-cream">
        <div className="grid lg:grid-cols-2">
          <div className="px-5 py-20 sm:px-8 sm:py-28 lg:pl-[max(2rem,calc((100vw-90rem)/2+2rem))] lg:pr-16 xl:pl-[max(3.5rem,calc((100vw-90rem)/2+3.5rem))]">
            <p className="enter label text-gold">Bespoke &middot; Custom Orders</p>
            <h1 className="enter mt-6 text-hero" style={{ "--i": 1 } as React.CSSProperties}>
              Made for You.
              <br />
              <span className="italic text-gold">Made by Hand.</span>
            </h1>
            <p className="enter mt-8 max-w-md font-sans leading-relaxed text-cream/80" style={{ "--i": 2 } as React.CSSProperties}>
              Request a piece in your own colours, size and design. Tell us what
              you have in mind and we&apos;ll confirm what&apos;s possible, the
              price and the lead time — all on WhatsApp.
            </p>
            <div className="enter mt-10" style={{ "--i": 3 } as React.CSSProperties}>
              <WhatsAppButton
                href={buildWhatsAppLink(buildCustomOrderMessage())}
                label="Request a Custom Piece"
                tone="gold"
                size="lg"
                dataAttributes={analyticsAttributes(ANALYTICS_EVENTS.customOrderEnquiry, {
                  link_location: "custom_orders_hero",
                })}
              />
            </div>
          </div>
          {heroImage && (
            <div className="relative min-h-[26rem] lg:min-h-full">
              <Image
                src={cld(heroImage.imageUrl as string, "gallery")}
                alt={heroImage.name}
                fill
                preload
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </section>

      {/* What can be personalised */}
      <section className="bg-cream py-24 sm:py-32">
        <div className="shell">
          <SectionHeading index="01" eyebrow="Personalise" title={<>Yours, <span className="italic">in every detail.</span></>}>
            Every custom request is subject to confirmation — we&apos;ll always be
            clear about what&apos;s possible before any work begins.
          </SectionHeading>
          <ul className="mt-16 grid gap-px bg-ink/10 sm:grid-cols-3">
            {PERSONALISE.map((item, i) => (
              <li key={item.title} className="reveal bg-cream p-8 sm:p-10">
                <span className="font-display text-5xl italic text-gold-deep">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-6 font-display text-3xl">{item.title}</h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-ink/70">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Process */}
      <section className="bg-ink py-24 text-cream sm:py-32">
        <div className="shell">
          <SectionHeading tone="dark" index="02" eyebrow="The Process" title={<>Simple, personal, <span className="italic text-gold">on WhatsApp.</span></>} />
          <ol className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS.map((step, i) => (
              <li key={step.title} className="reveal border-t border-cream/20 pt-6">
                <span className="label tabular-nums text-gold">Step {String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 font-display text-2xl">{step.title}</h3>
                <p className="mt-3 font-sans text-sm leading-relaxed text-cream/75">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Request builder */}
      <section id="request" aria-labelledby="request-title" className="scroll-mt-24 bg-sand py-24 sm:py-32">
        <div className="shell">
          <SectionHeading
            id="request-title"
            index="03"
            eyebrow="Start Your Request"
            title={<>Tell us <span className="italic">what you&apos;re dreaming of.</span></>}
          >
            Fill in as much or as little as you like — we&apos;ll turn it into a
            WhatsApp message you can review before sending.
          </SectionHeading>
          <div className="mt-14">
            <CustomOrderBuilder pieces={pieces} />
          </div>
        </div>
      </section>

      {startingPoints.length > 0 && (
        <section className="bg-cream py-24 sm:py-32">
          <div className="shell">
            <SectionHeading index="04" eyebrow="Starting Points" title={<>Pieces made <span className="italic">to your brief.</span></>} />
            <ul className="mt-14 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
              {startingPoints.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="border-t border-ink/10 bg-cream py-24 sm:py-32">
        <div className="shell grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading eyebrow="Good to Know" title="Custom order questions" />
          </div>
          <div className="border-b border-ink/15 lg:col-span-7 lg:col-start-6">
            {faqs.map((faq) => (
              <details key={faq.id} className="group border-t border-ink/15">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 [&::-webkit-details-marker]:hidden">
                  <span className="font-display text-xl sm:text-2xl">{faq.question}</span>
                  <Plus className="h-4 w-4 shrink-0 transition-transform duration-300 group-open:rotate-45" strokeWidth={1.5} aria-hidden="true" />
                </summary>
                <p className="pb-6 font-sans text-[0.9375rem] leading-relaxed text-ink/75">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
