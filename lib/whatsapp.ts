const WHATSAPP_NUMBER = "27670590600";
const DEFAULT_MESSAGE =
  "Hi MelCrochet! I'd love to know more about your handmade creations.";

export function buildWhatsAppLink(message: string = DEFAULT_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppLink(productName: string): string {
  return buildWhatsAppLink(`Hi MelCrochet! I'm interested in the ${productName}`);
}

interface OrderMessageOptions {
  productName: string;
  productUrl: string;
  colour?: string | null;
  size?: string | null;
}

/**
 * Builds the pre-filled WhatsApp message for the product detail page's
 * colour/size selector. Including the product URL means Mel always knows
 * exactly which item is being asked about, even if the customer edits the
 * message text before sending.
 */
export function buildOrderMessage({
  productName,
  productUrl,
  colour,
  size,
}: OrderMessageOptions): string {
  return [
    `Hi MelCrochet! I'd like to order the ${productName}.`,
    size ? `Size: ${size}` : null,
    colour ? `Colour: ${colour}` : null,
    productUrl,
  ]
    .filter(Boolean)
    .join("\n");
}

export interface CustomOrderOptions {
  piece?: string | null;
  colours?: string | null;
  size?: string | null;
  neededBy?: string | null;
  details?: string | null;
}

/**
 * Builds the pre-filled WhatsApp message for the Custom Orders request
 * builder. Blank answers are left out so the message reads naturally; the
 * customer can still edit everything in WhatsApp before sending.
 */
export function buildCustomOrderMessage({
  piece,
  colours,
  size,
  neededBy,
  details,
}: CustomOrderOptions = {}): string {
  const clean = (v: string | null | undefined) => v?.trim() || null;
  const p = clean(piece);
  return [
    p
      ? `Hi MelCrochet! I'd like to request a custom ${p}.`
      : "Hi MelCrochet! I'd like to request a custom piece.",
    clean(colours) ? `Colours: ${clean(colours)}` : null,
    clean(size) ? `Size: ${clean(size)}` : null,
    clean(neededBy) ? `Needed by: ${clean(neededBy)}` : null,
    clean(details) ? `Details: ${clean(details)}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
