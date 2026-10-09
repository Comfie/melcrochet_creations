import { getCategories, getProducts, getPublishedBlogPosts, getTestimonials } from "@/lib/queries";
import { COLLECTIONS } from "@/lib/collections";
import { collectionLead, diversePhotographed, photographedIn, toCardProduct } from "@/lib/catalogue";
import { LocalBusinessJsonLd } from "@/components/seo/JsonLd";
import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import CollectionsShowcase from "@/components/home/CollectionsShowcase";
import SignaturePieces from "@/components/home/SignaturePieces";
import ArtOfMaking from "@/components/home/ArtOfMaking";
import FounderFeature from "@/components/home/FounderFeature";
import BespokeFeature from "@/components/home/BespokeFeature";
import StudioGallery from "@/components/home/StudioGallery";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import BlogCard from "@/components/BlogCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/Button";

export const revalidate = 60;

export default async function Home() {
  // Sequential, not Promise.all: this app's DATABASE_URL is a direct
  // (non-pooled) Railway connection, and opening several Postgres
  // connections at once during Vercel's build has dropped connections
  // (P1017). One catalogue query feeds every product-driven section.
  const categories = await getCategories();
  const products = await getProducts();
  const testimonials = await getTestimonials();
  const posts = await getPublishedBlogPosts();

  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));
  const photographed = products.filter((p) => p.imageUrl);
  const asImage = (p: { imageUrl: string | null; name: string; slug: string }) => ({
    url: p.imageUrl as string,
    name: p.name,
    slug: p.slug,
  });

  const featured = products.filter((p) => p.featured);
  const signature = (featured.length > 0 ? featured : photographed).slice(0, 8).map(toCardProduct);

  const heroInset = featured.find((p) => p.imageUrl) ?? photographed[0];

  const collections = COLLECTIONS.map((c) => ({
    slug: c.slug,
    name: c.name,
    tagline: c.tagline,
    categories: c.categorySlugs.flatMap((slug) => categoryName.get(slug) ?? []),
    imageUrl: collectionLead(products, c)?.imageUrl ?? null,
  }));

  // Craft collage: a home piece and a fashion/accessory piece, when photographed.
  const craftImages = [
    photographedIn(products, ["throw-blankets", "baby-blankets", "baskets"])[1] ??
      photographedIn(products, ["throw-blankets", "baby-blankets", "baskets"])[0],
    photographedIn(products, ["scrunchies", "bags", "hats"])[0],
  ]
    .filter((p): p is (typeof products)[number] => Boolean(p))
    .map(asImage);

  const bespoke =
    photographedIn(products, ["custom-orders", "gift-sets"])[0] ??
    photographedIn(products, ["kids-dresses", "adult-sweaters"])[0];

  const studio = diversePhotographed(products, 6).map(asImage);

  return (
    <>
      <LocalBusinessJsonLd />

      <Hero inset={heroInset ? { url: heroInset.imageUrl as string, name: heroInset.name } : null} />
      <Marquee items={categories.map((c) => c.name)} />

      {/* Brand statement */}
      <section aria-label="About MelCrochet" className="bg-cream">
        <div className="shell grid gap-10 py-24 sm:py-32 lg:grid-cols-12">
          <p className="label text-gold-deep lg:col-span-3">Handmade &middot; South Africa</p>
          <p className="reveal font-display text-[clamp(1.75rem,1.2rem+2.2vw,3.5rem)] font-light leading-[1.15] lg:col-span-9">
            MelCrochet Gifted Hands makes contemporary crochet — fashion,
            blankets, bags and gifts — <span className="italic text-brown">slowly, carefully and entirely by hand.</span>{" "}
            Each piece is made to order, which means it is made for you.
          </p>
        </div>
      </section>

      <CollectionsShowcase collections={collections} />
      <SignaturePieces products={signature} />
      <ArtOfMaking images={craftImages} />
      <FounderFeature />
      <BespokeFeature image={bespoke ? asImage(bespoke) : null} />

      {testimonials.length > 0 && (
        <section aria-labelledby="testimonials-title" className="bg-cream py-24 sm:py-32">
          <div className="shell">
            <h2 id="testimonials-title" className="label text-center text-gold-deep">
              Kind Words
            </h2>
            <div className="mt-10">
              <TestimonialsCarousel testimonials={testimonials} />
            </div>
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section aria-labelledby="journal-title" className="border-t border-ink/10 bg-cream py-24 sm:py-32">
          <div className="shell">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading
                id="journal-title"
                index="06"
                eyebrow="The Journal"
                title={<>Stories from <span className="italic">the workbench.</span></>}
              />
              <TextLink href="/blog" className="shrink-0 text-ink">
                Read the journal
              </TextLink>
            </div>
            <div className="mt-14 grid gap-12 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
              {posts.slice(0, 3).map((post, i) => (
                <BlogCard key={post.id} post={post} index={i + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      <StudioGallery items={studio} />
    </>
  );
}
