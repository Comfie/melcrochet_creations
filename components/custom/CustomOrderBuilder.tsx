"use client";

import { useMemo, useState } from "react";
import { buildCustomOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppButton from "@/components/WhatsAppButton";
import { ANALYTICS_EVENTS, analyticsAttributes, trackEvent } from "@/lib/analytics";

const LABEL = "label text-ink/75";
const FIELD =
  "mt-2 w-full border-0 border-b border-ink/30 bg-transparent px-0 py-3 font-sans text-base text-ink transition-colors placeholder:text-ink/45 hover:border-ink/60 focus:border-ink focus:outline-none focus-visible:outline-none focus-visible:shadow-[0_1px_0_0_var(--color-ink)]";

/**
 * Builds a structured custom-order request and hands it to WhatsApp — the
 * existing ordering channel. Nothing is submitted or stored here; the
 * customer reviews and sends the message from their own WhatsApp.
 */
export default function CustomOrderBuilder({ pieces }: { pieces: string[] }) {
  const [form, setForm] = useState({ piece: "", colours: "", size: "", neededBy: "", details: "" });

  const message = useMemo(() => buildCustomOrderMessage(form), [form]);
  const href = buildWhatsAppLink(message);
  // Only the chosen piece type is sent — never the customer's free-text details.
  const tracking = { piece: form.piece || "unspecified", link_location: "custom_order_builder" };

  const update =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <form
        className="grid gap-8 sm:grid-cols-2 lg:col-span-7"
        onSubmit={(e) => {
          e.preventDefault();
          trackEvent(ANALYTICS_EVENTS.customOrderEnquiry, tracking);
          window.open(href, "_blank", "noopener,noreferrer");
        }}
      >
        <div className="sm:col-span-2">
          <label htmlFor="co-piece" className={LABEL}>
            What would you like made?
          </label>
          <select id="co-piece" value={form.piece} onChange={update("piece")} className={`${FIELD} cursor-pointer`}>
            <option value="">Choose a piece (optional)</option>
            {pieces.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
            <option value="design of my own">Something else</option>
          </select>
        </div>
        <div>
          <label htmlFor="co-colours" className={LABEL}>
            Colours
          </label>
          <input
            id="co-colours"
            type="text"
            value={form.colours}
            onChange={update("colours")}
            placeholder="e.g. cream and caramel"
            className={FIELD}
          />
        </div>
        <div>
          <label htmlFor="co-size" className={LABEL}>
            Size or age
          </label>
          <input
            id="co-size"
            type="text"
            value={form.size}
            onChange={update("size")}
            placeholder="e.g. queen bed, age 4"
            className={FIELD}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="co-needed" className={LABEL}>
            Needed by
          </label>
          <input
            id="co-needed"
            type="text"
            value={form.neededBy}
            onChange={update("neededBy")}
            placeholder="e.g. a birthday on 15 December"
            className={FIELD}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="co-details" className={LABEL}>
            Anything else?
          </label>
          <textarea
            id="co-details"
            rows={3}
            value={form.details}
            onChange={update("details")}
            placeholder="Patterns, references, who it's for…"
            className={`${FIELD} resize-y`}
          />
        </div>
      </form>

      <div className="lg:col-span-5">
        <div className="bg-cream p-6 sm:p-8 lg:sticky lg:top-28">
          <p className="label text-gold-deep">Your message</p>
          <pre
            aria-live="polite"
            className="mt-4 whitespace-pre-wrap break-words font-sans text-[0.9375rem] leading-relaxed text-ink"
          >
            {message}
          </pre>
          <WhatsAppButton
            href={href}
            label="Send on WhatsApp"
            size="lg"
            className="mt-8 w-full"
            dataAttributes={analyticsAttributes(ANALYTICS_EVENTS.customOrderEnquiry, tracking)}
          />
          <p className="mt-4 font-sans text-xs leading-relaxed text-ink/65">
            You can edit the message in WhatsApp before sending. Requests are
            subject to confirmation of feasibility, price and lead time.
          </p>
        </div>
      </div>
    </div>
  );
}
