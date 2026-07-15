import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/queries";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import WhatsAppButton from "@/components/WhatsAppButton";
import { buildProductWhatsAppLink } from "@/lib/whatsapp";

export const revalidate = 60;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <article className="bg-cream">
      <div className="mx-auto max-w-3xl px-5 py-16">
        <div className="aspect-square w-full overflow-hidden">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}
        </div>

        <h1 className="mt-8 text-display">{product.name}</h1>
        <p className="mt-2 font-sans text-lg font-semibold text-brown">
          {product.priceType === "FIXED"
            ? `${product.currency === "ZAR" ? "R" : product.currency}${product.price}`
            : "Quote on Request"}
        </p>

        <div className="mt-4">
          <WhatsAppButton href={buildProductWhatsAppLink(product.name)} />
        </div>

        <p className="mt-8 whitespace-pre-wrap font-sans text-ink/80">
          {product.description}
        </p>

        <dl className="mt-8 space-y-2 font-sans text-sm text-ink/70">
          {product.sizes && (
            <div>
              <dt className="inline font-semibold text-ink">Sizes: </dt>
              <dd className="inline">{product.sizes}</dd>
            </div>
          )}
          {product.colours && (
            <div>
              <dt className="inline font-semibold text-ink">Colours: </dt>
              <dd className="inline">{product.colours}</dd>
            </div>
          )}
          {product.leadTime && (
            <div>
              <dt className="inline font-semibold text-ink">Lead time: </dt>
              <dd className="inline">{product.leadTime}</dd>
            </div>
          )}
        </dl>
      </div>
    </article>
  );
}
