import { getCategories, getProducts } from "@/lib/queries";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: category }),
  ]);

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="text-display">Our Products</h1>
        <p className="mt-3 max-w-2xl font-sans text-ink/70">
          Every piece is made to order by hand. Prices shown are per item — reach
          out on WhatsApp for custom sizes, colours, or bulk orders.
        </p>

        <div className="mt-8">
          <CategoryFilter categories={categories} activeSlug={category} />
        </div>

        {products.length === 0 ? (
          <p className="mt-16 font-sans text-ink/60">
            No products in this category yet — message us on WhatsApp, we&apos;re
            happy to take a custom order.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
