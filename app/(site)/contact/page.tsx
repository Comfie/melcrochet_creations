import { Mail } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppButton from "@/components/WhatsAppButton";
import EnquiryForm from "@/components/EnquiryForm";
import { FacebookIcon, InstagramIcon } from "@/components/SocialIcons";

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

          <ul className="mt-8 flex flex-col gap-3 font-sans text-sm text-ink/70">
            <li>
              <a
                href="https://instagram.com/melz.crotchet.creations"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-semibold text-brown hover:text-ink"
              >
                <InstagramIcon className="h-4 w-4 shrink-0" />
                @melz.crotchet.creations
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/share/1BUMGQo84u/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-semibold text-brown hover:text-ink"
              >
                <FacebookIcon className="h-4 w-4 shrink-0" />
                MelCrochet
              </a>
            </li>
            <li>
              <a
                href="mailto:buchiemel@gmail.com"
                className="flex items-center gap-2 font-semibold text-brown hover:text-ink"
              >
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                buchiemel@gmail.com
              </a>
            </li>
          </ul>
        </div>

        <EnquiryForm />
      </div>
    </section>
  );
}
