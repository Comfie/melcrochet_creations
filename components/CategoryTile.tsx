import Link from "next/link";
import Image from "next/image";
import { cld, IMG_SIZES } from "@/lib/cloudinary-url";
import StitchDivider from "@/components/StitchDivider";

export default function CategoryTile({
  name,
  slug,
  blurb,
  imageUrl,
}: {
  name: string;
  slug: string;
  blurb: string | null;
  imageUrl: string | null;
}) {
  return (
    <Link
      href={`/products?category=${slug}`}
      aria-label={`Shop ${name}`}
      className="group relative flex aspect-square flex-col justify-end overflow-hidden border border-taupe/30 bg-cream"
    >
      {imageUrl ? (
        <Image
          src={cld(imageUrl, "card")}
          alt=""
          fill
          sizes={IMG_SIZES.card}
          placeholder="blur"
          blurDataURL={cld(imageUrl, "blur")}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        // Branded fallback: stitch texture on cream/taupe, no image.
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center bg-taupe/15"
        >
          <StitchDivider className="text-taupe" />
        </div>
      )}

      {/* Bottom scrim so the name stays legible over any photo. */}
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 h-2/3 ${
          imageUrl
            ? "bg-gradient-to-t from-ink/85 via-ink/40 to-transparent"
            : ""
        }`}
      />

      <div className="relative p-5">
        <p
          className={`font-display text-lg ${imageUrl ? "text-cream" : "text-ink"}`}
        >
          {name}
        </p>
        {blurb && !imageUrl && (
          <p className="mt-1 font-sans text-sm text-ink/70">{blurb}</p>
        )}
        <span
          className={`mt-3 inline-block font-sans text-xs font-semibold uppercase tracking-wide opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${
            imageUrl ? "text-gold" : "text-brown"
          }`}
        >
          Shop {name} &rarr;
        </span>
      </div>
    </Link>
  );
}
