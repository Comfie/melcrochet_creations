"use client";

import { useEffect } from "react";
import { ANALYTICS_EVENTS, trackEvent, type AnalyticsParams } from "@/lib/analytics";

function parseParams(raw: string | undefined): AnalyticsParams {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as AnalyticsParams) : {};
  } catch {
    return {};
  }
}

/**
 * One delegated click listener for the whole site, so server-rendered links
 * stay server components. Links with `data-ga-event` (see
 * analyticsAttributes) send that event; any other WhatsApp link sends
 * `whatsapp_click` with the nearest `data-ga-location` as context.
 */
export default function AnalyticsClickTracker() {
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!(event.target instanceof Element)) return;
      const tagged = event.target.closest<HTMLElement>("[data-ga-event]");
      if (tagged?.dataset.gaEvent) {
        trackEvent(tagged.dataset.gaEvent, {
          ...parseParams(tagged.dataset.gaParams),
          page_path: window.location.pathname,
        });
        return;
      }

      const link = event.target.closest<HTMLAnchorElement>('a[href*="wa.me/"]');
      if (link) {
        trackEvent(ANALYTICS_EVENTS.whatsappClick, {
          link_location: link.closest<HTMLElement>("[data-ga-location]")?.dataset.gaLocation ?? "page",
          page_path: window.location.pathname,
        });
      }
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
