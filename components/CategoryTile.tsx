import Link from "next/link";

export default function CategoryTile({
  name,
  slug,
  blurb,
}: {
  name: string;
  slug: string;
  blurb: string | null;
}) {
  return (
    <Link
      href={`/products?category=${slug}`}
      className="group flex flex-col justify-end border border-taupe/30 bg-cream p-5 transition-colors hover:border-gold hover:bg-gold/5 focus-visible:border-gold"
    >
      <p className="font-display text-lg">{name}</p>
      {blurb && <p className="mt-1 font-sans text-sm text-ink/60">{blurb}</p>}
      <span className="mt-3 font-sans text-xs font-semibold uppercase tracking-wide text-gold opacity-0 transition-opacity group-hover:opacity-100">
        Shop {name} &rarr;
      </span>
    </Link>
  );
}
