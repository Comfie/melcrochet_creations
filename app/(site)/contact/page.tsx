import { buildWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppButton from "@/components/WhatsAppButton";
import EnquiryForm from "@/components/EnquiryForm";

export default function ContactPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:grid-cols-2">
        <div>
          <h1 className="text-display">Get in Touch</h1>
          <p className="mt-4 max-w-md font-sans text-ink/70">
            The fastest way to reach us is WhatsApp — for everything else, use the
            form and we&apos;ll reply as soon as we can.
          </p>

          <div className="mt-8">
            <WhatsAppButton href={buildWhatsAppLink()} label="Message us on WhatsApp" />
          </div>

          <div className="mt-8 font-sans text-sm text-ink/70">
            <p>
              Instagram:{" "}
              <a
                href="https://instagram.com/melz.crotchet.creations"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-brown hover:text-ink"
              >
                @melz.crotchet.creations
              </a>
            </p>
          </div>
        </div>

        <EnquiryForm />
      </div>
    </section>
  );
}
