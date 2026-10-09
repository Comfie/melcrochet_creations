import Link from "next/link";
import Image from "next/image";
import { cld } from "@/lib/cloudinary-url";

/**
 * One editorial collection tile: large photograph, index numeral, name,
 * tagline and its categories. When a collection has no photography yet it
 * renders a typographic tile (deep brown + gold) rather than a fake image.
 */
export default function CollectionFeature({
  index,
  name,
  slug,
  tagline,
  categories,
  imageUrl,
  aspect = "aspect-[3/4]",
  sizes,
  headingLevel = "h3",
}: {
  index: number;
  name: string;
  slug: string;
  tagline: string;
  categories: string[];
  imageUrl: string | null;
  aspect?: string;
  sizes: string;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  const number = String(index).padStart(2, "0");

  return (
    <Link href={`/products?collection=${slug}`} className="group block">
      <div className={`reveal-img relative w-full overflow-hidden ${aspect} ${imageUrl ? "bg-sand" : "bg-brown"}`}>
        {imageUrl ? (
          <>
            <Image
              src={cld(imageUrl, "gallery")}
              alt=""
              fill
              sizes={sizes}
              placeholder="blur"
              blurDataURL={cld(imageUrl, "blur")}
              className="object-cover transition-transform duration-[1400ms] ease-[var(--ease-editorial)] group-hover:scale-[1.05]"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/10" />
          </>
        ) : (
          <div aria-hidden="true" className="absolute inset-0 flex flex-col justify-between p-6 text-cream sm:p-8">
            <span className="label text-gold">{number}</span>
            <span className="font-display text-[clamp(2.25rem,1.5rem+3vw,4.5rem)] italic leading-[0.95] text-gold">
              Made
              <br />
              for you.
            </span>
          </div>
        )}
        <span className="label absolute bottom-4 left-4 bg-cream px-3 py-2 text-ink opacity-0 transition-all duration-500 group-hover:opacity-100 group-focus-visible:opacity-100 sm:translate-y-2 sm:group-hover:translate-y-0">
          Explore &rarr;
        </span>
      </div>

      <div className="mt-5 flex items-start gap-4">
        <span className="label pt-2 tabular-nums text-gold-deep">{number}</span>
        <div className="min-w-0">
          <Heading className="font-display text-[clamp(1.625rem,1.3rem+1.2vw,2.5rem)] leading-tight transition-colors group-hover:text-brown">
            {name}
          </Heading>
          <p className="mt-2 max-w-sm font-sans text-sm leading-relaxed text-ink/70">{tagline}</p>
          <p className="label mt-3 text-[0.5625rem] text-ink/65">{categories.join(" · ")}</p>
        </div>
      </div>
    </Link>
  );
}
