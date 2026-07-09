import "dotenv/config";
import prisma from "../lib/prisma";
import { CATEGORIES, PRODUCTS } from "./seed-data";
import { slugify } from "../lib/slug";

async function main() {
  // Categories — upsert by unique name.
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    await prisma.category.upsert({
      where: { name: c.name },
      update: { blurb: c.blurb, sortOrder: i },
      create: { name: c.name, slug: slugify(c.name), blurb: c.blurb, sortOrder: i },
    });
  }

  // Products — upsert by unique slug.
  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const category = await prisma.category.findUniqueOrThrow({
      where: { name: p.category },
    });
    const slug = slugify(p.name);
    await prisma.product.upsert({
      where: { slug },
      update: {
        priceType: p.priceType,
        price: p.price,
        categoryId: category.id,
        sortOrder: i,
      },
      create: {
        name: p.name,
        slug,
        description: `${p.name} — handmade by MelCrochet with neat stitches and careful finishing.`,
        priceType: p.priceType,
        price: p.price,
        currency: "ZAR",
        categoryId: category.id,
        featured: i < 6, // first few surface on Home
        sortOrder: i,
      },
    });
  }

  const cats = await prisma.category.count();
  const prods = await prisma.product.count();
  console.log(`Seeded ${cats} categories and ${prods} products.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
