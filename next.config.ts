import type { NextConfig } from "next";
import { HTML_LIMITED_BOT_UA_RE } from "next/dist/shared/lib/router/utils/html-bots";

/** The canonical host (see SITE.url in lib/site.ts). */
const CANONICAL_ORIGIN = "https://melcrochet.co.za";

/**
 * Hosts that serve this deployment but must not compete with the canonical
 * domain in search: the www subdomain and the production *.vercel.app alias.
 * Preview deployments use other hostnames and are left alone.
 */
const DUPLICATE_HOSTS = ["www.melcrochet.co.za", "melcrochet-creations.vercel.app"];

/**
 * Next.js streams `generateMetadata` output into <body> for user agents it
 * doesn't consider "HTML-limited" — which includes the main Googlebot.
 * Google only honours rel="canonical" inside <head>, so Googlebot is added
 * to Next's default list to always receive titles, descriptions and
 * canonicals in the initial <head>.
 */
export const HTML_LIMITED_BOTS = new RegExp(`${HTML_LIMITED_BOT_UA_RE.source}|Googlebot`, "i");

const nextConfig: NextConfig = {
  htmlLimitedBots: HTML_LIMITED_BOTS,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    // Single-hop 308s to the same path (query strings are preserved).
    return DUPLICATE_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `${CANONICAL_ORIGIN}/:path*`,
      permanent: true,
    }));
  },
  async headers() {
    // robots.txt already disallows these; the header also keeps them out of
    // the index if a URL is ever linked from elsewhere.
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [
      { source: "/admin", headers: noindex },
      { source: "/admin/:path*", headers: noindex },
      { source: "/api/:path*", headers: noindex },
    ];
  },
};

export default nextConfig;
