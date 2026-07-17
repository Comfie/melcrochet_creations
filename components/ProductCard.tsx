import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import WhatsAppButton from "@/components/WhatsAppButton";
import { buildProductWhatsAppLink } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format-price";

type Product = {
  id: string;
  slug: string;
  name: string;
  priceType: "FIXED" | "QUOTE";
  price: unknown; // Prisma Decimal — stringify for display, never do arithmetic on it here
  currency: string;
  imageUrl: string | null;
  leadTime: string | null;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex flex-col border border-taupe/30 bg-cream">
      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
        <div className="aspect-square w-full overflow-hidden">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <p className="font-display text-lg">{product.name}</p>
          <p className="mt-1 font-sans text-sm font-semibold text-brown">
            {formatPrice(product.priceType, product.price, product.currency)}
          </p>
          {product.leadTime && (
            <p className="mt-1 font-sans text-xs text-ink/50">
              Made to order · {product.leadTime}
            </p>
          )}
        </div>
      </Link>
      <div className="px-4 pb-4">
        <WhatsAppButton href={buildProductWhatsAppLink(product.name)} />
      </div>
    </div>
  );
}
