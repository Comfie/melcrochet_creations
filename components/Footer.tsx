import Link from "next/link";
import { Mail, MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { FacebookIcon, InstagramIcon } from "@/components/SocialIcons";

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
            <ul className="mt-3 flex flex-col gap-3 font-sans text-sm text-cream/70">
              <li>
                <a
                  href={buildWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-cream"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  WhatsApp: 067 059 0600
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/melz_crotchet_creations"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-cream"
                >
                  <InstagramIcon className="h-4 w-4 shrink-0" />
                  @melz_crotchet_creations
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/share/1BUMGQo84u/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-cream"
                >
                  <FacebookIcon className="h-4 w-4 shrink-0" />
                  MelCrochet
                </a>
              </li>
              <li>
                <a href="mailto:buchiemel@gmail.com" className="flex items-center gap-2 hover:text-cream">
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  Email: buchiemel@gmail.com
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
