/**
 * Google Analytics 4 — off unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set (a
 * "G-XXXXXXXXXX" ID from the GA4 property's web data stream). Safe to import
 * from server and client components.
 *
 * Event names (mark the lead events as Key events in GA4):
 *   view_item              product detail page viewed
 *   whatsapp_order_click   WhatsApp "order"/"enquire" for a specific product (a lead, not a sale)
 *   custom_order_enquiry   custom-order request sent to WhatsApp
 *   contact_form_submit    contact form sent successfully
 *   whatsapp_click         any other WhatsApp link (nav, footer, floating button…)
 */

type AnalyticsValue = string | number | null | undefined;
/** Flat event parameters, plus GA4's ecommerce `items` array where relevant. */
export type AnalyticsParams = Record<string, AnalyticsValue | Record<string, string | number>[]>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function parseMeasurementId(value: string | undefined): string | null {
  const id = value?.trim().toUpperCase();
  return id && /^G-[A-Z0-9]{4,20}$/.test(id) ? id : null;
}

export const GA_MEASUREMENT_ID = parseMeasurementId(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);

export const ANALYTICS_EVENTS = {
  viewItem: "view_item",
  whatsappOrderClick: "whatsapp_order_click",
  customOrderEnquiry: "custom_order_enquiry",
  contactFormSubmit: "contact_form_submit",
  whatsappClick: "whatsapp_click",
} as const;

function clean<T extends AnalyticsParams>(params: T): Record<string, Exclude<T[keyof T], null | undefined>> {
  const out: Record<string, Exclude<T[keyof T], null | undefined>> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== "") {
      out[key] = value as Exclude<T[keyof T], null | undefined>;
    }
  }
  return out;
}

/** Sends a GA4 event. No-op when GA isn't configured or hasn't initialised. */
export function trackEvent(name: string, params: AnalyticsParams = {}): void {
  if (!GA_MEASUREMENT_ID || typeof window === "undefined" || typeof window.gtag !== "function") return;
  window.gtag("event", name, clean(params));
}

/**
 * data-* attributes that let server-rendered links report a click without
 * becoming client components — <AnalyticsClickTracker> reads them.
 */
export function analyticsAttributes(event: string, params: AnalyticsParams = {}) {
  return {
    "data-ga-event": event,
    "data-ga-params": JSON.stringify(clean(params)),
  };
}

/** GA4 ecommerce `items` entry. Prices are informational; WhatsApp orders are confirmed offline. */
export function analyticsItem(product: {
  slug: string;
  name: string;
  categoryName?: string | null;
  price?: number | null;
}): Record<string, string | number> {
  return clean<Record<string, AnalyticsValue>>({
    item_id: product.slug,
    item_name: product.name,
    item_category: product.categoryName,
    price: product.price,
  });
}

/** Inline bootstrap: defines gtag before hydration so early events queue in order. */
export function gaBootstrapScript(measurementId: string): string {
  return [
    "window.dataLayer=window.dataLayer||[];",
    "function gtag(){dataLayer.push(arguments);}",
    "window.gtag=gtag;",
    // Privacy defaults: no advertising storage or signals. Visitors who send
    // Global Privacy Control get cookieless (consent-denied) measurement only.
    "gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',",
    "analytics_storage:navigator.globalPrivacyControl===true?'denied':'granted'});",
    "gtag('js',new Date());",
    `gtag('config',${JSON.stringify(measurementId)},{allow_google_signals:false,allow_ad_personalization_signals:false});`,
  ].join("");
}
