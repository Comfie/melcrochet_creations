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
