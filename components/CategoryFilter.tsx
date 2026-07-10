import Link from "next/link";

type Category = { id: string; name: string; slug: string };

export default function CategoryFilter({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug: string | undefined;
}) {
  return (
    <nav aria-label="Filter by category" className="flex flex-wrap gap-2">
      <Link
        href="/products"
        aria-current={!activeSlug ? "page" : undefined}
        className={`rounded-full border px-4 py-1.5 font-sans text-sm transition-colors ${
          !activeSlug
            ? "border-gold bg-gold text-ink"
            : "border-taupe/40 text-ink/70 hover:border-gold"
        }`}
      >
        All
      </Link>
      {categories.map((category) => {
        const isActive = category.slug === activeSlug;
        return (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 font-sans text-sm transition-colors ${
              isActive
                ? "border-gold bg-gold text-ink"
                : "border-taupe/40 text-ink/70 hover:border-gold"
            }`}
          >
            {category.name}
          </Link>
        );
      })}
    </nav>
  );
}
