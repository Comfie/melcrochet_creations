import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/**
 * Production allows everything public; Vercel preview deployments (their own
 * *.vercel.app URLs) are blocked so test builds never compete with the live
 * site. VERCEL_ENV is unset locally, which counts as production.
 */
export default function robots(): MetadataRoute.Robots {
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv && vercelEnv !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
