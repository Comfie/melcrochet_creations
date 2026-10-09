import Link from "next/link";
import Image from "next/image";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import { buildProductWhatsAppLink } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format-price";
import { cld, IMG_SIZES } from "@/lib/cloudinary-url";
import { ANALYTICS_EVENTS, analyticsAttributes } from "@/lib/analytics";

type Product = {
  id: string;
  slug: string;
  name: string;
  priceType: "FIXED" | "QUOTE";
  price: unknown; // Prisma Decimal — stringify for display, never do arithmetic on it here
  currency: string;
  imageUrl: string | null;
  leadTime: string | null;
  /** Optional second photo, revealed on hover (desktop) for a gallery feel. */
  hoverImageUrl?: string | null;
  categoryName?: string | null;
};

export default function ProductCard({
  product,
  sizes = IMG_SIZES.portrait,
  preload = false,
}: {
  product: Product;
  sizes?: string;
  preload?: boolean;
}) {
  const price = formatPrice(product.priceType, product.price, product.currency);
  const href = `/products/${product.slug}`;

  return (
    // text-ink is set here so the card reads correctly on any ground.
    <article className="group/card relative flex flex-col text-ink" data-product-card>
      <Link href={href} className="block" aria-label={`${product.name}, ${price}`}>
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-sand">
          {product.imageUrl ? (
            <>
              <Image
                src={cld(product.imageUrl, "portrait")}
                alt={product.name}
                fill
                sizes={sizes}
                preload={preload}
                placeholder="blur"
                blurDataURL={cld(product.imageUrl, "blur")}
                className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-editorial)] group-hover/card:scale-[1.04]"
              />
              {product.hoverImageUrl && (
                <Image
                  src={cld(product.hoverImageUrl, "portrait")}
                  alt=""
                  fill
                  sizes={sizes}
                  className="object-cover opacity-0 transition-opacity duration-700 group-hover/card:opacity-100"
                />
              )}
            </>
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}

          {product.leadTime && (
            <span className="label absolute left-3 top-3 bg-cream/95 px-2.5 py-1.5 text-[0.5625rem] text-ink">
              Made to order
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-4">
        {product.categoryName && (
          <p className="label text-[0.5625rem] text-ink/65">{product.categoryName}</p>
        )}
        <h3 className="mt-1 font-display text-xl leading-tight sm:text-[1.375rem]">
          <Link href={href} className="hover:text-brown">
            {product.name}
          </Link>
        </h3>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="font-sans text-sm font-semibold tabular-nums">{price}</p>
          <a
            href={buildProductWhatsAppLink(product.name)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Enquire about the ${product.name} on WhatsApp`}
            {...analyticsAttributes(ANALYTICS_EVENTS.whatsappOrderClick, {
              item_id: product.slug,
              item_name: product.name,
              item_category: product.categoryName,
              price: product.priceType === "FIXED" && product.price !== null ? Number(product.price) : null,
              currency: product.currency,
              link_location: "product_card",
            })}
            className="label text-[0.625rem] text-ink/65 underline decoration-ink/30 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
          >
            Enquire
          </a>
        </div>
        {product.leadTime && (
          <p className="mt-1 font-sans text-xs text-ink/65">Made to order · {product.leadTime}</p>
        )}
      </div>
    </article>
  );
}
