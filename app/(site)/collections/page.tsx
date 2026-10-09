import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import { getCategories, getProducts } from "@/lib/queries";
import { COLLECTIONS } from "@/lib/collections";
import { collectionLead } from "@/lib/catalogue";
import { cld } from "@/lib/cloudinary-url";
import CategoryTile from "@/components/CategoryTile";
import { ButtonLink } from "@/components/ui/Button";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Handmade Crochet Collections",
  description:
    "Explore MelCrochet’s handmade crochet collections — fashion, bags and accessories, baby and kids, home and living, and gifts. Made to order in South Africa.",
  path: "/collections",
});

export default async function CollectionsPage() {
  // Sequential: one Postgres connection at a time (see app/(site)/page.tsx).
  const categories = await getCategories();
  const products = await getProducts();

  return (
    <>
      <section className="bg-ink text-cream">
        <div className="shell py-20 sm:py-28">
          <p className="label text-gold">The Collections</p>
          <h1 className="mt-6 max-w-5xl text-hero">
            Crochet, considered — <span className="italic text-gold">in five chapters.</span>
          </h1>
          <nav aria-label="Jump to collection" className="mt-14 border-t border-cream/15">
            <ol className="flex flex-col sm:flex-row sm:flex-wrap">
              {COLLECTIONS.map((c, i) => (
                <li key={c.slug} className="border-b border-cream/15 sm:flex-1 sm:border-b-0 sm:border-r sm:last:border-r-0">
                  <a href={`#${c.slug}`} className="flex items-baseline gap-3 py-5 sm:px-4 sm:first:pl-0 hover:text-gold">
                    <span className="label tabular-nums text-gold">{String(i + 1).padStart(2, "0")}</span>
                    <span className="font-display text-xl">{c.name}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </section>

      {COLLECTIONS.map((collection, i) => {
        const lead = collectionLead(products, collection);
        const tiles = collection.categorySlugs.flatMap((slug) => {
          const category = categories.find((c) => c.slug === slug);
          if (!category) return [];
          const inCategory = products.filter((p) => p.category.slug === slug);
          return [
            {
              ...category,
              count: inCategory.length,
              imageUrl: inCategory.find((p) => p.imageUrl)?.imageUrl ?? null,
            },
          ];
        });
        const flip = i % 2 === 1;

        return (
          <section
            key={collection.slug}
            id={collection.slug}
            aria-labelledby={`${collection.slug}-title`}
            className={`scroll-mt-28 py-20 sm:py-28 ${i % 2 === 0 ? "bg-cream" : "bg-sand"}`}
          >
            <div className="shell grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className={`lg:col-span-5 ${flip ? "lg:order-2 lg:col-start-8" : ""}`}>
                <div className="lg:sticky lg:top-32">
                  <p className="label flex items-center gap-3 text-gold-deep">
                    <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
                    <span>Collection</span>
                  </p>
                  <h2 id={`${collection.slug}-title`} className="mt-5 text-display">
                    {collection.name}
                  </h2>
                  <p className="mt-5 max-w-sm font-sans leading-relaxed text-ink/70">{collection.tagline}</p>
                  <ButtonLink href={`/products?collection=${collection.slug}`} className="mt-8">
                    Shop the collection
                  </ButtonLink>
                  {lead && (
                    <div className="reveal-img relative mt-12 hidden aspect-[4/5] overflow-hidden lg:block">
                      <Image
                        src={cld(lead.imageUrl as string, "gallery")}
                        alt={lead.name}
                        fill
                        sizes="40vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              <ul className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:col-span-7 ${flip ? "lg:order-1" : ""}`}>
                {tiles.map((tile) => (
                  <li key={tile.id}>
                    <CategoryTile
                      name={tile.name}
                      slug={tile.slug}
                      blurb={tile.blurb}
                      imageUrl={tile.imageUrl}
                      count={tile.count}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </section>
        );
      })}
    </>
  );
}
