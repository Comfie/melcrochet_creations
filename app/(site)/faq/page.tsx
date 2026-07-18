import type { Metadata } from "next";
import { FaqJsonLd, type FaqItem } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Delivery, Payment & FAQ",
  description:
    "Delivery options, payment methods, lead times, care instructions and our returns policy for MelCrochet Gifted Hands handmade crochet orders.",
};

const FAQS: FaqItem[] = [
  {
    question: "How long does an order take?",
    answer:
      "Every piece is made to order by hand. Standard items typically take 4–6 days; custom orders or larger pieces (like queen and king throws) may take 1–2 weeks. We'll confirm your exact lead time on WhatsApp when you order.",
  },
  {
    question: "How do I pay?",
    answer:
      "We accept EFT and cash on collection. For custom orders, we ask for a 50% deposit upfront to begin work, with the balance due before delivery or collection.",
  },
  {
    question: "How is my order delivered?",
    answer:
      "We deliver via courier (PUDO/Paxi or a local courier, depending on your area) or you can arrange collection with us in Johannesburg. Courier costs depend on your location and are quoted separately from the item price.",
  },
  {
    question: "Can I request a custom colour, size or design?",
    answer:
      "Yes — message us on WhatsApp with what you have in mind. We'll confirm feasibility, price and lead time before starting your order.",
  },
  {
    question: "How do I care for my crochet item?",
    answer:
      "Hand wash in cold water with a gentle detergent, avoid wringing, and dry flat away from direct sunlight to keep the stitches and shape looking their best.",
  },
  {
    question: "What is your returns policy?",
    answer:
      "Because every item is handmade to order, we're unable to accept returns or exchanges for change of mind. If your item arrives damaged or with a manufacturing defect, contact us on WhatsApp within 48 hours of delivery and we'll make it right.",
  },
];

export default function FaqPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-3xl px-5 py-16">
        <FaqJsonLd items={FAQS} />
        <h1 className="text-display">Delivery, Payment &amp; FAQ</h1>
        <p className="mt-4 font-sans text-ink/70">
          Answers to the questions we hear most on WhatsApp. Can&apos;t find
          what you need? Message us and we&apos;ll help.
        </p>

        <dl className="mt-10 flex flex-col gap-8">
          {FAQS.map((faq) => (
            <div key={faq.question}>
              <dt className="font-display text-lg text-ink">{faq.question}</dt>
              <dd className="mt-2 font-sans text-ink/70">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
