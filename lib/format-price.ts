/**
 * Formats a product price for display.
 * Matches the existing inline formatting used across ProductCard, the home
 * page, and the product detail page — no thousands separators, so this
 * centralizes the logic without changing what's on screen today.
 */
export function formatPrice(
  priceType: "FIXED" | "QUOTE",
  price: unknown,
  currency: string = "ZAR"
): string {
  if (priceType !== "FIXED" || price === null || price === undefined) {
    return "Quote on Request";
  }
  const symbol = currency === "ZAR" ? "R" : currency;
  return `${symbol}${price}`;
}
