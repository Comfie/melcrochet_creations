export type SeedCategory = { name: string; blurb: string };

export type SeedProduct = {
  name: string;
  category: string; // must match a SeedCategory name
  priceType: "FIXED" | "QUOTE";
  price: number | null; // rand amount when FIXED, null when QUOTE
};

export const CATEGORIES: SeedCategory[] = [
  { name: "Baby Blankets", blurb: "Gentle handmade blankets for babies and newborn gifts." },
  { name: "Throw Blankets", blurb: "Statement throws for lounges, beds and reading corners." },
  { name: "Bags", blurb: "Crochet bags for daily use, gifts and styling." },
  { name: "Baskets", blurb: "Sturdy handmade baskets for storage and decor." },
  { name: "Hats", blurb: "Warm and stylish hats for adults and children." },
  { name: "Scrunchies", blurb: "Small handmade accessories for everyday use and gifting." },
  { name: "Baby Sweaters", blurb: "Soft handmade sweaters for babies and toddlers." },
  { name: "Kids Sweaters", blurb: "Cosy handmade sweaters for children." },
  { name: "Adult Sweaters", blurb: "Custom crochet sweaters for style and warmth." },
  { name: "Kids Dresses", blurb: "Handmade dresses for special occasions." },
  { name: "Custom Orders", blurb: "Colour, size and design requests made to order." },
  { name: "Gift Sets", blurb: "Curated combinations for babies, birthdays and occasions." },
];

// Real, fixed-price products from the MelCrochet price list (prices in ZAR).
export const PRODUCTS: SeedProduct[] = [
  { name: "Baby Throw Blanket", category: "Baby Blankets", priceType: "FIXED", price: 550 },
  { name: "Lap Throw Blanket", category: "Throw Blankets", priceType: "FIXED", price: 650 },
  { name: "Double Throw Blanket", category: "Throw Blankets", priceType: "FIXED", price: 1200 },
  { name: "Queen Throw Blanket", category: "Throw Blankets", priceType: "FIXED", price: 1400 },
  { name: "King Throw Blanket", category: "Throw Blankets", priceType: "FIXED", price: 1600 },
  { name: "Kids Beanie Hat", category: "Hats", priceType: "FIXED", price: 100 },
  { name: "Adult Beanie Hat", category: "Hats", priceType: "FIXED", price: 150 },
  { name: "Adult Ruffle Bucket Hat", category: "Hats", priceType: "FIXED", price: 250 },
  { name: "Laptop Bag", category: "Bags", priceType: "FIXED", price: 450 },
  { name: "Diaper Bag", category: "Bags", priceType: "FIXED", price: 350 },
  { name: "Picnic Bag", category: "Bags", priceType: "FIXED", price: 300 },
  { name: "Small Basket", category: "Baskets", priceType: "FIXED", price: 200 },
  { name: "Medium Basket", category: "Baskets", priceType: "FIXED", price: 300 },
  { name: "Large Basket", category: "Baskets", priceType: "FIXED", price: 400 },
  { name: "Kids Party Dress", category: "Kids Dresses", priceType: "FIXED", price: 300 },
  { name: "Scrunchie", category: "Scrunchies", priceType: "FIXED", price: 50 },
  { name: "Kids Sweater", category: "Kids Sweaters", priceType: "FIXED", price: 300 },
  { name: "Adult Sweater", category: "Adult Sweaters", priceType: "FIXED", price: 650 },
  // Quote-based placeholders for categories without a set price yet.
  { name: "Custom Baby Sweater", category: "Baby Sweaters", priceType: "QUOTE", price: null },
  { name: "Custom Gift Set", category: "Gift Sets", priceType: "QUOTE", price: null },
  { name: "Custom Crochet Order", category: "Custom Orders", priceType: "QUOTE", price: null },
];
