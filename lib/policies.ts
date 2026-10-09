/**
 * Customer-facing policy content — the single source for the FAQ page, the
 * product detail accordions and the Custom Orders page, so lead times,
 * payment terms and delivery details can never drift apart between pages.
 * Edit the wording here only with Mel's confirmation: these are business
 * commitments, not marketing copy.
 */
import type { FaqItem } from "@/components/seo/JsonLd";

export const POLICY = {
  leadTime:
    "Every piece is made to order by hand. Standard items typically take 4–6 days; custom orders or larger pieces (like queen and king throws) may take 1–2 weeks. We'll confirm your exact lead time on WhatsApp when you order.",
  payment:
    "We accept EFT and cash on collection. For custom orders, we ask for a 50% deposit upfront to begin work, with the balance due before delivery or collection.",
  delivery:
    "We deliver via courier (PUDO/Paxi or a local courier, depending on your area) or you can arrange collection with us in Johannesburg. Courier costs depend on your location and are quoted separately from the item price.",
  custom:
    "Yes — message us on WhatsApp with what you have in mind. We'll confirm feasibility, price and lead time before starting your order.",
  care:
    "Hand wash in cold water with a gentle detergent, avoid wringing, and dry flat away from direct sunlight to keep the stitches and shape looking their best.",
  returns:
    "Because every item is handmade to order, we're unable to accept returns or exchanges for change of mind. If your item arrives damaged or with a manufacturing defect, contact us on WhatsApp within 48 hours of delivery and we'll make it right.",
} as const;

/** `id` doubles as the in-page anchor on /faq (e.g. /faq#delivery). */
export const FAQS: (FaqItem & { id: string })[] = [
  { id: "lead-time", question: "How long does an order take?", answer: POLICY.leadTime },
  { id: "payment", question: "How do I pay?", answer: POLICY.payment },
  { id: "delivery", question: "How is my order delivered?", answer: POLICY.delivery },
  { id: "custom", question: "Can I request a custom colour, size or design?", answer: POLICY.custom },
  { id: "care", question: "How do I care for my crochet item?", answer: POLICY.care },
  { id: "returns", question: "What is your returns policy?", answer: POLICY.returns },
];

/** Condensed "at a glance" facts — every line restates a POLICY entry above. */
export const POLICY_HIGHLIGHTS = [
  { label: "Lead time", value: "4–6 days standard", detail: "1–2 weeks for custom or larger pieces" },
  { label: "Payment", value: "EFT or cash on collection", detail: "50% deposit to begin custom work" },
  { label: "Delivery", value: "Courier or collection", detail: "PUDO/Paxi, local courier, or Johannesburg collection" },
  { label: "Returns", value: "Damaged or defective items", detail: "Contact us within 48 hours of delivery" },
] as const;
