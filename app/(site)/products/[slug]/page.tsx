import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/queries";
import { SITE } from "@/lib/site";
import { formatPrice } from "@/lib/format-price";
import { cld } from "@/lib/cloudinary-url";
import { parseGallery } from "@/lib/product-gallery";
import { parseVariantList } from "@/lib/product-variants";
import { ProductJsonLd } from "@/components/seo/JsonLd";
import { ProductGallery } from "@/components/product/ProductGallery";
import { OrderViaWhatsApp } from "@/components/product/OrderViaWhatsApp";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max - 1).trimEnd() + "…";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  const price = formatPrice(product.priceType, product.price, product.currency);
  const title = `${product.name} – ${price}`;
  const description =
    truncate(product.description, 155) ||
    `${product.name}, handmade to order by ${SITE.shortName}. Order via WhatsApp.`;
  const ogImage = product.imageUrl ? cld(product.imageUrl, "og") : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: `${title} | ${SITE.shortName}`,
      description,
      type: "website",
      url: `/products/${slug}`,
      siteName: SITE.name,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: product.name }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: `${title} | ${SITE.shortName}`,
      description,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const gallery = parseGallery(product.gallery);
  const galleryImages = [
    ...(product.imageUrl ? [{ url: product.imageUrl, alt: product.name }] : []),
    ...gallery
      .filter((img) => img.url !== product.imageUrl)
      .map((img) => ({ url: img.url, alt: product.name })),
  ];

  const colours = parseVariantList(product.colours);
  const sizes = parseVariantList(product.sizes);
  const productUrl = `${SITE.url}/products/${product.slug}`;
  const price =
    product.priceType === "FIXED" && product.price !== null ? Number(product.price) : null;

  return (
    <article className="bg-cream">
      <div className="mx-auto max-w-5xl px-5 py-16">
        <ProductJsonLd
          name={product.name}
          description={product.description}
          slug={product.slug}
          images={galleryImages.map((img) => cld(img.url, "detail"))}
          priceType={product.priceType}
          price={price}
        />

        <div className="grid gap-10 md:grid-cols-2">
          <ProductGallery images={galleryImages} />

          <div>
            <p className="font-sans text-sm text-ink/60">{product.category.name}</p>
            <h1 className="mt-1 text-display">{product.name}</h1>
            <p className="mt-2 font-sans text-lg font-semibold text-brown">
              {formatPrice(product.priceType, product.price, product.currency)}
            </p>

            {product.leadTime && (
              <p className="mt-3 inline-block rounded-full bg-taupe/15 px-3 py-1 font-sans text-sm text-ink/70">
                Made to order · {product.leadTime}
              </p>
            )}

            <p className="mt-6 whitespace-pre-wrap font-sans text-ink/80">{product.description}</p>

            <OrderViaWhatsApp
              productName={product.name}
              productUrl={productUrl}
              colours={colours}
              sizes={sizes}
              className="mt-6"
            />

            {product.careInstructions && (
              <details className="mt-6 rounded-lg border border-taupe/30 p-4">
                <summary className="cursor-pointer font-sans font-medium text-ink">
                  Care instructions
                </summary>
                <p className="mt-2 whitespace-pre-wrap font-sans text-sm text-ink/70">
                  {product.careInstructions}
                </p>
              </details>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
