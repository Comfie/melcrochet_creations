import type { Metadata } from "next";
import Link from "next/link";
import Form from "next/form";
import { Search } from "lucide-react";
import { getCategories, getCategoriesWithProductCounts, getProducts } from "@/lib/queries";
import { COLLECTIONS, collectionForCategory, getCollectionBySlug } from "@/lib/collections";
import { toCardProduct } from "@/lib/catalogue";
import { buildCustomOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";
import WhatsAppButton from "@/components/WhatsAppButton";
import { BreadcrumbJsonLd, type BreadcrumbItem } from "@/components/seo/JsonLd";
import { categorySeo, pageMetadata } from "@/lib/seo";
import { ANALYTICS_EVENTS, analyticsAttributes } from "@/lib/analytics";

export const revalidate = 60;

type Props = {
  searchParams: Promise<{ category?: string; collection?: string; q?: string }>;
};

const SHOP_SEO = {
  title: "Shop Handmade Crochet Products in South Africa",
  description:
    "Browse handmade crochet fashion, blankets, bags, hats, baskets and gifts — made to order in South Africa. Order via WhatsApp.",
} as const;

/**
 * Category and collection views are the shop's landing pages, so each gets
 * its own keyword-mapped title and a self-referencing canonical. Searches,
 * unknown slugs and empty categories are kept out of the index (noindex,
 * follow) so thin or junk URLs never compete with real pages.
 */
export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category, collection, q } = await searchParams;

  if (q?.trim()) {
    return {
      title: `Search: ${q.trim()}`,
      robots: { index: false, follow: true },
    };
  }

  if (category) {
    const record = (await getCategoriesWithProductCounts()).find((c) => c.slug === category);
    if (!record) {
      return pageMetadata({ ...SHOP_SEO, path: "/products", noindex: true });
    }
    const seo = categorySeo(record);
    return pageMetadata({
      title: seo.title,
      description: seo.description,
      path: `/products?category=${record.slug}`,
      noindex: record._count.products === 0,
    });
  }

  const collectionRecord = getCollectionBySlug(collection);
  if (collectionRecord) {
    return pageMetadata({
      title: collectionRecord.seo.title,
      description: collectionRecord.seo.description,
      path: `/products?collection=${collectionRecord.slug}`,
    });
  }

  return pageMetadata({ ...SHOP_SEO, path: "/products" });
}

const INTERSTITIAL_AFTER = 7;

export default async function ProductsPage({ searchParams }: Props) {
  const { category, collection, q } = await searchParams;
  const search = q?.trim() || undefined;

  const activeCollection = category ? collectionForCategory(category) : getCollectionBySlug(collection);

  // Sequential to keep to one Postgres connection at a time (see app/(site)/page.tsx).
  const categories = await getCategories();
  const products = await getProducts({
    categorySlug: category,
    categorySlugs: category ? undefined : activeCollection?.categorySlugs,
    search,
  });

  const activeCategory = categories.find((c) => c.slug === category);
  const railCategories = activeCollection
    ? activeCollection.categorySlugs.flatMap((slug) => categories.find((c) => c.slug === slug) ?? [])
    : categories;

  const title = search
    ? `“${search}”`
    : activeCategory?.name ?? activeCollection?.name ?? "The Collection";
  const intro = search
    ? `${products.length} ${products.length === 1 ? "piece matches" : "pieces match"} your search.`
    : activeCategory?.blurb ??
      activeCollection?.tagline ??
      "Every piece is made to order by hand. Prices shown are per item — reach out on WhatsApp for custom sizes, colours, or bulk orders.";

  const cards = products.map(toCardProduct);
  const showInterstitial = !search && cards.length > INTERSTITIAL_AFTER;

  const breadcrumbs: BreadcrumbItem[] = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/products" },
    ...(activeCollection && !search
      ? [{ name: activeCollection.name, path: `/products?collection=${activeCollection.slug}` }]
      : []),
    ...(activeCategory && !search
      ? [{ name: activeCategory.name, path: `/products?category=${activeCategory.slug}` }]
      : []),
  ];

  const tabClass = (active: boolean) =>
    `label shrink-0 border-b py-4 transition-colors ${
      active ? "border-ink text-ink" : "border-transparent text-ink/65 hover:text-ink"
    }`;

  return (
    <>
      {!search && <BreadcrumbJsonLd items={breadcrumbs} />}

      {/* Editorial header */}
      <section className="bg-cream">
        <div className="shell pb-10 pt-14 sm:pt-20">
          <nav aria-label="Breadcrumb" className="label text-ink/65">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-ink">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/products" className="hover:text-ink">Shop</Link>
              </li>
              {activeCollection && (
                <>
                  <li aria-hidden="true">/</li>
                  <li>
                    <Link href={`/products?collection=${activeCollection.slug}`} className="hover:text-ink">
                      {activeCollection.name}
                    </Link>
                  </li>
                </>
              )}
            </ol>
          </nav>
          <div className="mt-10 grid gap-8 lg:grid-cols-12 lg:items-end">
            <h1 className="text-display lg:col-span-8">
              {search ? <span className="italic">{title}</span> : title}
            </h1>
            <div className="lg:col-span-4">
              <p className="font-sans text-[0.9375rem] leading-relaxed text-ink/70">{intro}</p>
              <p className="label mt-4 tabular-nums text-ink/65">
                {products.length} {products.length === 1 ? "piece" : "pieces"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-[4.5rem] z-30 border-y border-ink/10 bg-cream/95 backdrop-blur lg:top-20">
        <div className="shell flex items-center justify-between gap-6">
          <nav aria-label="Collections" className="no-scrollbar -mx-5 flex gap-6 overflow-x-auto px-5 sm:mx-0 sm:gap-8 sm:px-0">
            <Link href="/products" aria-current={!activeCollection && !search ? "page" : undefined} className={tabClass(!activeCollection && !search)}>
              All
            </Link>
            {COLLECTIONS.map((c) => {
              const active = activeCollection?.slug === c.slug;
              return (
                <Link
                  key={c.slug}
                  href={`/products?collection=${c.slug}`}
                  aria-current={active ? "page" : undefined}
                  className={tabClass(active)}
                >
                  {c.name}
                </Link>
              );
            })}
          </nav>
          <Form action="/products" className="hidden shrink-0 items-center gap-2 border-b border-ink/30 focus-within:border-ink lg:flex">
            <label htmlFor="shop-search" className="sr-only">Search products</label>
            <Search className="h-4 w-4 text-ink/60" aria-hidden="true" />
            <input
              id="shop-search"
              name="q"
              type="search"
              defaultValue={search}
              placeholder="Search"
              className="w-40 bg-transparent py-2 font-sans text-sm placeholder:text-ink/50 focus:outline-none focus-visible:outline-none focus-visible:shadow-none xl:w-56"
            />
          </Form>
        </div>
      </div>

      <section className="bg-cream pb-24 sm:pb-32">
        <div className="shell">
          {!search && (
            <div className="pt-8">
              <CategoryFilter
                categories={railCategories}
                activeSlug={category}
                allHref={activeCollection ? `/products?collection=${activeCollection.slug}` : "/products"}
                allLabel={activeCollection ? `All ${activeCollection.name}` : "All"}
              />
            </div>
          )}

          {search && (
            <p className="pt-8 font-sans text-sm text-ink/70">
              <Link href="/products" className="font-semibold text-ink underline underline-offset-4">
                Clear search
              </Link>{" "}
              to see the full collection.
            </p>
          )}

          {/* Product cards are h3s; this keeps the outline h1 → h2 → h3 without changing the design. */}
          <h2 className="sr-only">{search ? "Search results" : `${title} — handmade crochet pieces`}</h2>

          {cards.length === 0 ? (
            <div className="mx-auto max-w-xl py-24 text-center">
              <p className="font-display text-section">
                {search ? "Nothing matches — yet." : "This collection is being made."}
              </p>
              <p className="mt-4 font-sans text-ink/70">
                Message us on WhatsApp — we&apos;re happy to take a custom order.
              </p>
              <WhatsAppButton
                href={buildWhatsAppLink(buildCustomOrderMessage({ piece: search ?? activeCategory?.name ?? null }))}
                label="Ask about a custom piece"
                className="mt-8"
                dataAttributes={analyticsAttributes(ANALYTICS_EVENTS.customOrderEnquiry, {
                  piece: search ? "search" : activeCategory?.name ?? "unspecified",
                  link_location: search ? "search_no_results" : "empty_category",
                })}
              />
            </div>
          ) : (
            <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-16">
              {cards.flatMap((product, i) => {
                const item = (
                  <li key={product.id}>
                    <ProductCard product={product} preload={i < 2} />
                  </li>
                );
                if (!showInterstitial || i !== INTERSTITIAL_AFTER - 1) return [item];
                return [
                  item,
                  <li
                    key="bespoke"
                    className="col-span-2 flex flex-col justify-between bg-brown p-6 text-cream sm:p-8 md:col-span-1"
                  >
                    <p className="label text-gold">Bespoke</p>
                    <div className="mt-12">
                      <p className="font-display text-3xl leading-tight sm:text-4xl">
                        Don&apos;t see <span className="italic text-gold">quite</span> what you want?
                      </p>
                      <p className="mt-4 font-sans text-sm text-cream/75">
                        Request your own colours, sizes and designs.
                      </p>
                      <Link
                        href="/custom-orders"
                        className="label mt-6 inline-block border-b border-cream/60 pb-1 hover:border-cream"
                      >
                        Request a custom piece
                      </Link>
                    </div>
                  </li>,
                ];
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
