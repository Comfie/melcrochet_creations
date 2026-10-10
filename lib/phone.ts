/**
 * Turns whatever a customer typed into the enquiry form's phone field into
 * an international digit string for wa.me / tel: links. South African local
 * numbers (`067 059 0600`) become `27670590600`; numbers already in
 * international form (`+27 …`, `0027 …`, `27 …`) are kept. Returns null when
 * the input can't plausibly be dialled.
 */
export function toInternationalDigits(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  else if (digits.length === 10 && digits.startsWith("0")) digits = `27${digits.slice(1)}`;
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

export function customerWhatsAppLink(phone: string | null | undefined, message?: string): string | null {
  const digits = toInternationalDigits(phone);
  if (!digits) return null;
  return message
    ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
    : `https://wa.me/${digits}`;
}

export function customerTelLink(phone: string | null | undefined): string | null {
  const digits = toInternationalDigits(phone);
  return digits ? `tel:+${digits}` : null;
}
