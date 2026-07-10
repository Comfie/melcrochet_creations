import Link from "next/link";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function Footer() {
  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-lg">MelCrochet Gifted Hands</p>
            <p className="mt-2 font-sans text-sm text-cream/70">
              Providing Warmth, Comfort &amp; Timeless Handmade Creations.
            </p>
          </div>

          <div>
            <p className="font-sans text-sm font-semibold uppercase tracking-wide text-gold">
              Explore
            </p>
            <ul className="mt-3 flex flex-col gap-2 font-sans text-sm text-cream/70">
              <li><Link href="/products" className="hover:text-cream">Products</Link></li>
              <li><Link href="/about" className="hover:text-cream">About</Link></li>
              <li><Link href="/blog" className="hover:text-cream">Blog</Link></li>
              <li><Link href="/contact" className="hover:text-cream">Contact</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-sans text-sm font-semibold uppercase tracking-wide text-gold">
              Get in touch
            </p>
            <ul className="mt-3 flex flex-col gap-2 font-sans text-sm text-cream/70">
              <li>
                <a href={buildWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="hover:text-cream">
                  WhatsApp: 067 059 0600
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/melz.crotchet.creations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cream"
                >
                  @melz.crotchet.creations
                </a>
              </li>
            </ul>
          </div>
        </div>

        <p className="mt-12 font-sans text-xs text-cream/50">
          &copy; {new Date().getFullYear()} MelCrochet Gifted Hands. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
