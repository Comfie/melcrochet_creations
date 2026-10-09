import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import Logo from "@/components/Logo";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { COLLECTIONS } from "@/lib/collections";
import { SITE } from "@/lib/site";
import { FacebookIcon, InstagramIcon } from "@/components/SocialIcons";

const CUSTOMER_LINKS = [
  { href: "/custom-orders", label: "Custom Orders" },
  { href: "/faq#delivery", label: "Delivery & Payment" },
  { href: "/faq#returns", label: "Care & Returns" },
  { href: "/contact", label: "Contact" },
];

const HOUSE_LINKS = [
  { href: "/about", label: "Our Story" },
  { href: "/blog", label: "Journal" },
  { href: "/products", label: "Shop All" },
];

function FooterHeading({ children }: { children: React.ReactNode }) {
  return <p className="label text-gold">{children}</p>;
}

export default function Footer() {
  return (
    <footer className="bg-ink text-cream" data-ga-location="footer">
      {/* Oversized sign-off */}
      <div className="shell border-b border-cream/10 py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <p className="font-display text-display lg:col-span-8">
            Made slowly, by hand —
            <br />
            <span className="italic text-gold">made to be kept.</span>
          </p>
          <div className="flex flex-col gap-4 lg:col-span-4 lg:items-end">
            <a
              href={buildWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 font-display text-2xl hover:text-gold"
            >
              Start an order on WhatsApp
              <ArrowUpRight
                className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </a>
            <p className="font-sans text-sm text-cream/70">{SITE.whatsappDisplay}</p>
          </div>
        </div>
      </div>

      <div className="shell grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Link href="/" aria-label={`${SITE.name} — home`} className="inline-block">
            <Logo variant="stacked" on="dark" decorative className="h-28 w-auto sm:h-32" />
          </Link>
          <p className="mt-6 max-w-xs font-sans text-sm leading-relaxed text-cream/70">
            {SITE.name} — contemporary crochet fashion, home pieces and gifts, made to
            order by hand in South Africa. {SITE.tagline}.
          </p>
        </div>

        <nav aria-label="Collections" className="lg:col-span-3">
          <FooterHeading>Collections</FooterHeading>
          <ul className="mt-5 flex flex-col gap-3 font-sans text-sm text-cream/75">
            {COLLECTIONS.map((c) => (
              <li key={c.slug}>
                <Link href={`/products?collection=${c.slug}`} className="hover:text-cream">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Customer care" className="lg:col-span-2">
          <FooterHeading>Client Care</FooterHeading>
          <ul className="mt-5 flex flex-col gap-3 font-sans text-sm text-cream/75">
            {CUSTOMER_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-cream">
                  {l.label}
                </Link>
              </li>
            ))}
            {HOUSE_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="hover:text-cream">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <FooterHeading>Get in Touch</FooterHeading>
          <ul className="mt-5 flex flex-col gap-3 font-sans text-sm text-cream/75">
            <li>
              <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                WhatsApp: {SITE.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="break-all hover:text-cream">
                Email: {SITE.email}
              </a>
            </li>
            <li>Based in {SITE.locality}, South Africa</li>
          </ul>
          <div className="mt-6 flex gap-3">
            <a
              href={SITE.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram ${SITE.instagramHandle}`}
              className="flex h-11 w-11 items-center justify-center border border-cream/20 transition-colors hover:border-gold hover:text-gold"
            >
              <InstagramIcon className="h-4 w-4" />
            </a>
            <a
              href={SITE.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook — MelCrochet"
              className="flex h-11 w-11 items-center justify-center border border-cream/20 transition-colors hover:border-gold hover:text-gold"
            >
              <FacebookIcon className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>

      <div className="shell flex flex-col gap-2 border-t border-cream/10 py-6 font-sans text-xs text-cream/60 sm:flex-row sm:justify-between">
        <p>&copy; {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
        <p>Handmade in South Africa &middot; Prices in ZAR</p>
      </div>
    </footer>
  );
}
