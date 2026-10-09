import type { Metadata } from "next";
import { ArrowUpRight, Mail, MapPin, MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { SITE } from "@/lib/site";
import WhatsAppButton from "@/components/WhatsAppButton";
import EnquiryForm from "@/components/EnquiryForm";
import { FacebookIcon, InstagramIcon, YouTubeIcon } from "@/components/SocialIcons";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Message MelCrochet Gifted Hands on WhatsApp or by email to order handmade crochet blankets, bags, hats and gifts, or ask about custom orders.",
};

const CHANNELS = [
  {
    label: "WhatsApp",
    value: SITE.whatsappDisplay,
    note: "Fastest — orders and custom requests",
    href: buildWhatsAppLink(),
    icon: MessageCircle,
    external: true,
  },
  { label: "Email", value: SITE.email, note: "For anything longer", href: `mailto:${SITE.email}`, icon: Mail, external: false },
  {
    label: "Instagram",
    value: SITE.instagramHandle,
    note: "New pieces and works in progress",
    href: SITE.instagram,
    icon: InstagramIcon,
    external: true,
  },
  {
    label: "YouTube",
    value: SITE.youtubeHandle,
    note: "Videos from the studio",
    href: SITE.youtube,
    icon: YouTubeIcon,
    external: true,
  },
  { label: "Facebook", value: "MelCrochet", note: "Follow along", href: SITE.facebook, icon: FacebookIcon, external: true },
];

export default function ContactPage() {
  return (
    <section className="bg-cream">
      <div className="grid lg:grid-cols-2">
        {/* Details */}
        <div className="bg-ink px-5 py-20 text-cream sm:px-8 sm:py-28 lg:pl-[max(2rem,calc((100vw-90rem)/2+2rem))] lg:pr-16 xl:pl-[max(3.5rem,calc((100vw-90rem)/2+3.5rem))]">
          <p className="label text-gold">Contact</p>
          <h1 className="mt-6 text-display">
            Get in <span className="italic text-gold">Touch</span>
          </h1>
          <p className="mt-6 max-w-md font-sans leading-relaxed text-cream/80">
            The fastest way to reach us is WhatsApp — for everything else, use the
            form and we&apos;ll reply as soon as we can.
          </p>
          <div className="mt-10">
            <WhatsAppButton href={buildWhatsAppLink()} label="Message us on WhatsApp" tone="gold" size="lg" />
          </div>

          <ul className="mt-16 border-t border-cream/15">
            {CHANNELS.map((c) => (
              <li key={c.label} className="border-b border-cream/15">
                <a
                  href={c.href}
                  {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-center gap-5 py-5"
                >
                  <c.icon className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="label block text-cream/60">{c.label}</span>
                    <span className="mt-1 block break-words font-display text-xl group-hover:text-gold">{c.value}</span>
                    <span className="mt-1 block font-sans text-xs text-cream/60">{c.note}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-cream/60 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold" aria-hidden="true" />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-8 flex items-center gap-3 font-sans text-sm text-cream/70">
            <MapPin className="h-4 w-4 text-gold" aria-hidden="true" />
            Based in {SITE.locality}, South Africa &middot; Collection by arrangement
          </p>
        </div>

        {/* Form */}
        <div className="px-5 py-20 sm:px-8 sm:py-28 lg:pl-16 lg:pr-[max(2rem,calc((100vw-90rem)/2+2rem))] xl:pr-[max(3.5rem,calc((100vw-90rem)/2+3.5rem))]">
          <p className="label text-gold-deep">Send a Message</p>
          <h2 className="mt-6 text-section">
            We&apos;d love to <span className="italic">hear from you.</span>
          </h2>
          <div className="mt-12 max-w-xl">
            <EnquiryForm />
          </div>
        </div>
      </div>
    </section>
  );
}
