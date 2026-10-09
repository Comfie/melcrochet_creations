/**
 * Single source of truth for absolute site URL and brand constants used by
 * metadata, JSON-LD, and the sitemap.
 *
 * `url` is the canonical production domain — metadataBase, canonical URLs,
 * JSON-LD, sitemap.xml and the product links in WhatsApp messages all derive
 * from it. The bare domain is canonical; www should redirect to it.
 */
export const SITE = {
  name: "MelCrochet Gifted Hands",
  shortName: "MelCrochet",
  url: "https://melcrochet.co.za",
  description:
    "Contemporary handmade crochet fashion, blankets, bags and gifts, made to order in South Africa. Order via WhatsApp.",
  tagline: "Providing Warmth, Comfort & Timeless Handmade Creations",
  email: "buchiemel@gmail.com",
  whatsappNumber: "27670590600",
  whatsappDisplay: "067 059 0600",
  instagram: "https://www.instagram.com/melcrochet_giftedhands",
  instagramHandle: "@melcrochet_giftedhands",
  youtube: "https://www.youtube.com/@melcrochets-85",
  youtubeHandle: "@melcrochets-85",
  facebook: "https://www.facebook.com/profile.php?id=100064727240793",
  locality: "Johannesburg",
} as const;
