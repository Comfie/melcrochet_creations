import Link from "next/link";
import Image from "next/image";
import { cld, IMG_SIZES } from "@/lib/cloudinary-url";
import StitchDivider from "@/components/StitchDivider";

export default function CategoryTile({
  name,
  slug,
  blurb,
  imageUrl,
  count,
}: {
  name: string;
  slug: string;
  blurb: string | null;
  imageUrl: string | null;
  count?: number;
}) {
  return (
    <Link href={`/products?category=${slug}`} aria-label={`Shop ${name}`} className="group block">
      <div className="relative aspect-square w-full overflow-hidden bg-ink/5">
        {imageUrl ? (
          <Image
            src={cld(imageUrl, "card")}
            alt=""
            fill
            sizes={IMG_SIZES.card}
            placeholder="blur"
            blurDataURL={cld(imageUrl, "blur")}
            className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-editorial)] group-hover:scale-105"
          />
        ) : (
          // Branded fallback: stitch texture on sand, no image.
          <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center px-8">
            <StitchDivider className="text-taupe" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <p className="font-display text-xl group-hover:text-brown">{name}</p>
        {count !== undefined && (
          <span className="label shrink-0 tabular-nums text-ink/65">
            {count} {count === 1 ? "piece" : "pieces"}
          </span>
        )}
      </div>
      {blurb && <p className="mt-1 font-sans text-sm text-ink/70">{blurb}</p>}
    </Link>
  );
}
