import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Plus } from "lucide-react";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import { FAQS, POLICY_HIGHLIGHTS } from "@/lib/policies";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppButton from "@/components/WhatsAppButton";

export const metadata: Metadata = pageMetadata({
  title: "Delivery, Payment & FAQ",
  description:
    "Delivery options, payment methods, lead times, care instructions and our returns policy for MelCrochet Gifted Hands handmade crochet orders.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <FaqJsonLd items={FAQS} />

      <section className="bg-cream">
        <div className="shell pb-16 pt-14 sm:pb-20 sm:pt-20">
          <p className="label text-gold-deep">Client Care</p>
          <h1 className="mt-6 max-w-4xl text-display">Delivery, Payment &amp; FAQ</h1>
          <p className="mt-6 max-w-xl font-sans leading-relaxed text-ink/70">
            Answers to the questions we hear most on WhatsApp. Can&apos;t find
            what you need? Message us and we&apos;ll help.
          </p>
        </div>
      </section>

      {/* At a glance */}
      <section aria-label="At a glance" className="bg-ink text-cream">
        <dl className="shell grid divide-cream/15 sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
          {POLICY_HIGHLIGHTS.map((item) => (
            <div key={item.label} className="border-b border-cream/15 py-8 sm:px-6 sm:first:pl-0 lg:border-b-0 lg:py-12">
              <dt className="label text-gold">{item.label}</dt>
              <dd className="mt-4 font-display text-2xl">{item.value}</dd>
              <dd className="mt-2 font-sans text-sm text-cream/70">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-cream py-20 sm:py-28">
        <div className="shell grid gap-14 lg:grid-cols-12">
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <h2 className="text-section">
                Still <span className="italic">wondering?</span>
              </h2>
              <p className="mt-4 max-w-xs font-sans text-sm leading-relaxed text-ink/70">
                Every order is personal, so if your question isn&apos;t here, just ask.
              </p>
              <WhatsAppButton href={buildWhatsAppLink()} label="Ask on WhatsApp" className="mt-8" />
            </div>
          </aside>

          <div className="border-b border-ink/15 lg:col-span-7 lg:col-start-6">
            {FAQS.map((faq, i) => (
              <details key={faq.id} id={faq.id} open={i === 0} className="group scroll-mt-28 border-t border-ink/15">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-baseline gap-5">
                    <span className="label tabular-nums text-gold-deep">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-2xl sm:text-[1.75rem]">{faq.question}</span>
                  </span>
                  <Plus className="h-4 w-4 shrink-0 transition-transform duration-300 group-open:rotate-45" strokeWidth={1.5} aria-hidden="true" />
                </summary>
                <p className="pb-8 pl-10 font-sans text-[0.9375rem] leading-relaxed text-ink/75 sm:pl-11">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
