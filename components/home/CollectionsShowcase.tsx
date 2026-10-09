import CollectionFeature from "@/components/CollectionFeature";
import SectionHeading from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/Button";

export type ShowcaseCollection = {
  slug: string;
  name: string;
  tagline: string;
  categories: string[];
  imageUrl: string | null;
};

// Magazine-style asymmetric layout: one tall lead image, staggered offsets.
const LAYOUT = [
  { cell: "col-span-2 lg:col-span-7 lg:row-span-2", aspect: "aspect-[4/5]", sizes: "(max-width: 1024px) 100vw, 58vw" },
  { cell: "col-span-2 sm:col-span-1 lg:col-span-5 lg:mt-24", aspect: "aspect-[4/5]", sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 42vw" },
  { cell: "col-span-2 sm:col-span-1 lg:col-span-5", aspect: "aspect-[4/5]", sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 42vw" },
  { cell: "col-span-2 sm:col-span-1 lg:col-span-6", aspect: "aspect-[5/4]", sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw" },
  { cell: "col-span-2 sm:col-span-1 lg:col-span-6 lg:mt-32", aspect: "aspect-[5/4]", sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 50vw" },
];

export default function CollectionsShowcase({ collections }: { collections: ShowcaseCollection[] }) {
  return (
    <section aria-labelledby="collections-title" className="bg-cream py-24 sm:py-32">
      <div className="shell">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            index="01"
            eyebrow="Curated Collections"
            id="collections-title"
            title={<>Five collections, <span className="italic">every piece by hand.</span></>}
          >
            Every MelCrochet category, gathered into collections — from crochet
            fashion to pieces for the home and the little ones in it.
          </SectionHeading>
          <TextLink href="/collections" className="shrink-0 text-ink">
            View all collections
          </TextLink>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-x-5 gap-y-14 sm:gap-x-8 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-20">
          {collections.map((c, i) => {
            const layout = LAYOUT[i % LAYOUT.length];
            return (
              <div key={c.slug} className={layout.cell}>
                <CollectionFeature
                  index={i + 1}
                  name={c.name}
                  slug={c.slug}
                  tagline={c.tagline}
                  categories={c.categories}
                  imageUrl={c.imageUrl}
                  aspect={layout.aspect}
                  sizes={layout.sizes}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
