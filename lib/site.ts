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
    "Handmade crochet blankets, bags, hats and gifts, made to order in South Africa. Order via WhatsApp.",
  email: "buchiemel@gmail.com",
  whatsappNumber: "27670590600",
  whatsappDisplay: "067 059 0600",
  instagram: "https://instagram.com/melz_crotchet_creations",
  facebook: "https://www.facebook.com/share/1BUMGQo84u/",
  locality: "Johannesburg",
} as const;
