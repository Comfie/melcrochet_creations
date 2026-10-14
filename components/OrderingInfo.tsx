import { FAQS } from "@/lib/policies";
import { TextLink } from "@/components/ui/Button";

/** The questions shoppers ask before ordering; answers come from lib/policies.ts. */
const QUESTIONS = ["lead-time", "delivery", "custom"] as const;

/**
 * "How ordering works" band for listing pages: an optional intro on the
 * left, the key ordering answers on the right, and a link to the full FAQ.
 */
export default function OrderingInfo({
  id,
  eyebrow,
  title,
  intro,
}: {
  /** Prefix for the heading id (aria-labelledby). */
  id: string;
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
}) {
  const items = QUESTIONS.flatMap((qid) => FAQS.find((f) => f.id === qid) ?? []);

  return (
    <section aria-labelledby={`${id}-title`} className="border-t border-ink/10 bg-sand py-20 sm:py-28">
      <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <p className="label text-gold-deep">{eyebrow}</p>
          <h2 id={`${id}-title`} className="mt-5 text-section">
            {title}
          </h2>
          {intro && <p className="mt-5 max-w-md font-sans leading-relaxed text-ink/70">{intro}</p>}
          <TextLink href="/faq" className="mt-8 text-ink">
            Delivery, payment &amp; FAQ
          </TextLink>
        </div>

        <dl className="border-b border-ink/15 lg:col-span-7">
          {items.map((faq) => (
            <div key={faq.id} className="border-t border-ink/15 py-6">
              <dt className="font-display text-2xl">{faq.question}</dt>
              <dd className="mt-3 font-sans text-[0.9375rem] leading-relaxed text-ink/75">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
