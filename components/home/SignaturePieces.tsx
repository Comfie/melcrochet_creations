import ProductCard from "@/components/ProductCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/Button";
import type { toCardProduct } from "@/lib/catalogue";

type CardProduct = ReturnType<typeof toCardProduct>;

/**
 * Featured designs. On phones this is a swipeable rail (scroll-snap, no JS);
 * from tablet up it becomes a generous four-column grid.
 */
export default function SignaturePieces({ products }: { products: CardProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="signature-title" className="border-t border-ink/10 bg-cream py-24 sm:py-32">
      <div className="shell">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index="02"
            eyebrow="Signature Pieces"
            id="signature-title"
            title={<>The pieces we&apos;re <span className="italic">known for.</span></>}
          >
            Each one is made to order by hand — choose your piece, then tell us
            your colours on WhatsApp.
          </SectionHeading>
          <TextLink href="/products" className="shrink-0 text-ink">
            Shop all pieces
          </TextLink>
        </div>
      </div>

      <ul
        className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 sm:grid sm:snap-none sm:grid-cols-3 sm:gap-x-6 sm:gap-y-14 sm:overflow-visible sm:px-8 lg:grid-cols-4 lg:gap-x-8 xl:mx-auto xl:max-w-[90rem] xl:px-14"
        aria-label="Signature pieces"
      >
        {products.map((product) => (
          <li key={product.id} className="w-[72%] shrink-0 snap-start sm:w-auto">
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
