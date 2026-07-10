const WHATSAPP_NUMBER = "27670590600";
const DEFAULT_MESSAGE =
  "Hi MelCrochet! I'd love to know more about your handmade creations.";

export function buildWhatsAppLink(message: string = DEFAULT_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function buildProductWhatsAppLink(productName: string): string {
  return buildWhatsAppLink(`Hi MelCrochet! I'm interested in the ${productName}`);
}
