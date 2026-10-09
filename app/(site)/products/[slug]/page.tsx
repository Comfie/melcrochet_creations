import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";
import { SITE } from "@/lib/site";
import { formatPrice } from "@/lib/format-price";
import { cld } from "@/lib/cloudinary-url";
import { parseGallery } from "@/lib/product-gallery";
import { parseVariantList } from "@/lib/product-variants";
import { collectionForCategory } from "@/lib/collections";
import { toCardProduct } from "@/lib/catalogue";
import { POLICY } from "@/lib/policies";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata, productMetaDescription, productTitle } from "@/lib/seo";
import { ProductGallery } from "@/components/product/ProductGallery";
import { OrderViaWhatsApp } from "@/components/product/OrderViaWhatsApp";
import ProductDetails from "@/components/product/ProductDetails";
import ProductCard from "@/components/ProductCard";
import { TextLink } from "@/components/ui/Button";
import TrackEvent from "@/components/analytics/TrackEvent";
import { ANALYTICS_EVENTS, analyticsItem } from "@/lib/analytics";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found", robots: { index: false, follow: true } };

  return pageMetadata({
    title: productTitle(product),
    description: productMetaDescription(product),
    path: `/products/${product.slug}`,
    images: product.imageUrl
      ? [{ url: cld(product.imageUrl, "og"), width: 1200, height: 630, alt: product.name }]
      : undefined,
  });
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const collection = collectionForCategory(product.category.slug);
  const related = await getRelatedProducts(product, collection?.categorySlugs ?? [], 4);

  const gallery = parseGallery(product.gallery);
  const galleryImages = [
    ...(product.imageUrl ? [{ url: product.imageUrl, alt: product.name }] : []),
    ...gallery
      .filter((img) => img.url !== product.imageUrl)
      .map((img, i) => ({ url: img.url, alt: `${product.name} — photo ${i + 2}` })),
  ];

  const colours = parseVariantList(product.colours);
  const sizes = parseVariantList(product.sizes);
  const productUrl = `${SITE.url}/products/${product.slug}`;
  const price =
    product.priceType === "FIXED" && product.price !== null ? Number(product.price) : null;
  const displayPrice = formatPrice(product.priceType, product.price, product.currency);
  const item = analyticsItem({
    slug: product.slug,
    name: product.name,
    categoryName: product.category.name,
    price,
  });

  const details = [
    {
      title: "Made to order",
      open: true,
      content: (
        <>
          <p>This piece is crocheted by hand when you order it.</p>
          <p className="mt-3">
            {product.leadTime ? `Typical lead time: ${product.leadTime}. ` : ""}
            {POLICY.leadTime}
          </p>
        </>
      ),
    },
    {
      title: "Customisation",
      content: (
        <>
          <p>Colours, sizes and design details can be personalised, subject to confirmation.</p>
          <p className="mt-3">{POLICY.custom.replace(/^Yes — m/, "M")}</p>
          <Link href="/custom-orders" className="mt-3 inline-block font-semibold text-ink underline underline-offset-4">
            How custom orders work
          </Link>
        </>
      ),
    },
    {
      title: "Care",
      content: <p className="whitespace-pre-wrap">{product.careInstructions || POLICY.care}</p>,
    },
    {
      title: "Delivery & payment",
      content: (
        <>
          <p>{POLICY.delivery}</p>
          <p className="mt-3">{POLICY.payment}</p>
        </>
      ),
    },
    { title: "Returns", content: <p>{POLICY.returns}</p> },
  ];

  return (
    <article className="bg-cream">
      <ProductJsonLd
        name={product.name}
        description={product.description}
        slug={product.slug}
        images={galleryImages.map((img) => cld(img.url, "detail"))}
        priceType={product.priceType}
        price={price}
        categoryName={product.category.name}
      />
      <TrackEvent
        name={ANALYTICS_EVENTS.viewItem}
        params={{ currency: "ZAR", value: price, items: [item] }}
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Shop", path: "/products" },
          ...(collection ? [{ name: collection.name, path: `/products?collection=${collection.slug}` }] : []),
          { name: product.category.name, path: `/products?category=${product.category.slug}` },
          { name: product.name, path: `/products/${product.slug}` },
        ]}
      />

      <div className="shell pb-24 pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb" className="label text-ink/65">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/products" className="hover:text-ink">Shop</Link>
            </li>
            {collection && (
              <>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href={`/products?collection=${collection.slug}`} className="hover:text-ink">
                    {collection.name}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/products?category=${product.category.slug}`} className="hover:text-ink">
                {product.category.name}
              </Link>
            </li>
          </ol>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <ProductGallery images={galleryImages} />
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <p className="label text-gold-deep">{product.category.name}</p>
              <h1 className="mt-4 text-display">{product.name}</h1>
              <p className="mt-5 font-sans text-xl font-semibold tabular-nums">{displayPrice}</p>
              <p className="mt-2 font-sans text-sm text-ink/70">
                Handmade to order
                {product.leadTime ? <> &middot; {product.leadTime}</> : null}
              </p>

              <div className="mt-8 border-t border-ink/15 pt-8">
                <p className="whitespace-pre-wrap font-sans text-[0.9375rem] leading-relaxed text-ink/80">
                  {product.description}
                </p>
              </div>

              <OrderViaWhatsApp
                productName={product.name}
                productUrl={productUrl}
                analyticsParams={{ ...item, currency: "ZAR" }}
                colours={colours}
                sizes={sizes}
                className="mt-10"
              />

              <div className="mt-12">
                <ProductDetails items={details} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="border-t border-ink/10 py-20 sm:py-28">
          <div className="shell">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <h2 id="related-title" className="text-section">
                You may <span className="italic">also like</span>
              </h2>
              {collection && (
                <TextLink href={`/products?collection=${collection.slug}`} className="text-ink">
                  Shop {collection.name}
                </TextLink>
              )}
            </div>
            <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard product={toCardProduct(p)} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}
