/**
 * Single source of truth for absolute site URL and brand constants used by
 * metadata, JSON-LD, and the sitemap.
 *
 * ⚠️ Change `url` to the custom domain once it's live — everything else
 * (metadataBase, canonical URLs, JSON-LD, sitemap.xml) derives from this.
 */
export const SITE = {
  name: "MelCrochet Gifted Hands",
  shortName: "MelCrochet",
  url: "https://melcrochet-creations.vercel.app",
  description:
    "Contemporary handmade crochet fashion, blankets, bags and gifts, made to order in South Africa. Order via WhatsApp.",
  tagline: "Providing Warmth, Comfort & Timeless Handmade Creations",
  email: "buchiemel@gmail.com",
  whatsappNumber: "27670590600",
  whatsappDisplay: "067 059 0600",
  instagram: "https://instagram.com/melz_crotchet_creations",
  // ⚠️ CLAUDE.md lists the handle as @melz.crotchet.creations while this URL
  // uses underscores — confirm the real handle and keep both in sync.
  instagramHandle: "@melz_crotchet_creations",
  facebook: "https://www.facebook.com/share/1BUMGQo84u/",
  locality: "Johannesburg",
} as const;
