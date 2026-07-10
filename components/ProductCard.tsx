import ImagePlaceholder from "@/components/ImagePlaceholder";
import WhatsAppButton from "@/components/WhatsAppButton";
import { buildProductWhatsAppLink } from "@/lib/whatsapp";

type Product = {
  id: string;
  name: string;
  priceType: "FIXED" | "QUOTE";
  price: unknown; // Prisma Decimal — stringify for display, never do arithmetic on it here
  currency: string;
  imageUrl: string | null;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex flex-col border border-taupe/30 bg-cream">
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
          {product.priceType === "FIXED"
            ? `${product.currency === "ZAR" ? "R" : product.currency}${product.price}`
            : "Quote on Request"}
        </p>
        <div className="mt-4">
          <WhatsAppButton href={buildProductWhatsAppLink(product.name)} />
        </div>
      </div>
    </div>
  );
}
