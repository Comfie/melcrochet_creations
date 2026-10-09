import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import Script from "next/script";
import { GA_MEASUREMENT_ID, gaBootstrapScript } from "@/lib/analytics";

// Editorial display serif — headlines, pull quotes, large numerals.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: "variable",
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

// Contemporary sans — navigation, product information and body copy.
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | Handmade Crochet in South Africa`,
    template: `%s | ${SITE.shortName}`,
  },
  description: SITE.description,
  openGraph: {
    siteName: SITE.name,
    type: "website",
    locale: "en_ZA",
  },
  // Search Console HTML-tag verification — optional; DNS (domain property)
  // verification needs no code. Set in Vercel, then redeploy.
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { verification: { google: process.env.GOOGLE_SITE_VERIFICATION } }
    : {}),
};

export const viewport: Viewport = {
  themeColor: "#151515",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>
        {children}
        {/*
          GA4 bootstrap: defines gtag and consent defaults before hydration so
          early events (e.g. view_item) queue in order. Sends nothing by
          itself — hits only go out once <GoogleAnalyticsTag> loads gtag.js on
          the public site, so /admin is never tracked.
        */}
        {GA_MEASUREMENT_ID && (
          <Script id="ga-bootstrap" strategy="beforeInteractive">
            {gaBootstrapScript(GA_MEASUREMENT_ID)}
          </Script>
        )}
      </body>
    </html>
  );
}
