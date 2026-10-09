import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import AnalyticsClickTracker from "@/components/analytics/AnalyticsClickTracker";

/**
 * Public-site layout: loads gtag.js (the bootstrap that defines `gtag` and
 * consent defaults is in app/layout.tsx) after hydration (no impact on LCP) and
 * reports WhatsApp/lead clicks. Page views on client-side navigation are
 * sent by GA4 enhanced measurement ("page changes based on browser history
 * events", on by default in the web data stream).
 */
export function GoogleAnalyticsTag() {
  if (!GA_MEASUREMENT_ID) return null;
  return (
    <>
      <Script
        id="ga-gtag"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <AnalyticsClickTracker />
    </>
  );
}
