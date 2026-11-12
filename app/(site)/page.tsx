import { getCategories, getProducts, getPublishedBlogPosts, getTestimonials } from "@/lib/queries";
import { COLLECTIONS } from "@/lib/collections";
import { collectionLead, toCardProduct } from "@/lib/catalogue";
import type { Metadata } from "next";
import { OrganizationJsonLd, WebSiteJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";
import { PORTFOLIO } from "@/lib/portfolio";
import { SITE } from "@/lib/site";
import SeasonalEdit from "@/components/home/SeasonalEdit";
import { getSeasonalCampaign, seasonalProducts } from "@/lib/seasons";
import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import CollectionsShowcase from "@/components/home/CollectionsShowcase";
import SignaturePieces from "@/components/home/SignaturePieces";
import ArtOfMaking from "@/components/home/ArtOfMaking";
import LessonsFeature from "@/components/home/LessonsFeature";
import FounderFeature from "@/components/home/FounderFeature";
import BespokeFeature from "@/components/home/BespokeFeature";
import StudioGallery from "@/components/home/StudioGallery";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import BlogCard from "@/components/BlogCard";
import SectionHeading from "@/components/ui/SectionHeading";
import { TextLink } from "@/components/ui/Button";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: `${SITE.name} | Handmade Crochet in South Africa`,
  absoluteTitle: true,
  description:
    "Contemporary handmade crochet fashion, blankets, bags and gifts, made to order in South Africa by MelCrochet Gifted Hands. Order via WhatsApp.",
  path: "/",
});

export default async function Home() {
  // Sequential, not Promise.all: this app's DATABASE_URL is a direct
  // (non-pooled) Railway connection, and opening several Postgres
  // connections at once during Vercel's build has dropped connections
  // (P1017). One catalogue query feeds every product-driven section.
  const categories = await getCategories();
  const products = await getProducts();
  const testimonials = await getTestimonials();
  const posts = await getPublishedBlogPosts();

  const campaign = getSeasonalCampaign();
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]));
  const signature = seasonalProducts(products, campaign).map(toCardProduct);

  const collectionOrder = campaign.id === "summer"
    ? ["bags-accessories", "crochet-fashion", "gifts-custom"]
    : campaign.id === "winter"
      ? ["crochet-fashion", "home-living", "baby-kids", "gifts-custom", "bags-accessories"]
      : ["crochet-fashion", "bags-accessories", "gifts-custom", "baby-kids", "home-living"];
  const collections = collectionOrder.flatMap((slug) => COLLECTIONS.filter((c) => c.slug === slug)).map((c) => {
    const base = {
      slug: c.slug,
      name: c.name,
      tagline: c.tagline,
      categories: c.categorySlugs.flatMap((slug) => categoryName.get(slug) ?? []),
      imageUrl: collectionLead(products, c)?.imageUrl ?? null,
    };
    if (campaign.id !== "summer") return base;
    if (c.slug === "crochet-fashion") return {
      ...base, name: "Summer Crochet", tagline: "Bikinis, tops, dresses and hats, made for your summer.",
      categories: ["Bikinis", "Tops", "Dresses", "Hats"], imageUrl: PORTFOLIO.orangeTop.url, href: "/summer-collection",
    };
    if (c.slug === "bags-accessories") return { ...base, imageUrl: PORTFOLIO.pinkBag.url };
    return { ...base, imageUrl: PORTFOLIO.ruffleHats.url, href: "/custom-orders#gift-inspiration" };
  });

  const craftImages = [
    { url: "/craft-handbags.jpg", name: "Handbags in black and navy, with chain straps", slug: "" },
    campaign.id === "summer" ? PORTFOLIO.pinkBag : PORTFOLIO.greyScarf,
  ];

  const studio = [
    PORTFOLIO.orangeTop,
    PORTFOLIO.redCardigan,
    PORTFOLIO.beigeHat,
    PORTFOLIO.ruffleHats,
    PORTFOLIO.pinkBag,
    campaign.id === "summer" ? PORTFOLIO.pinkBikini : PORTFOLIO.greyScarf,
  ];

  return (
    <>
      <OrganizationJsonLd />
      <WebSiteJsonLd />

      <Hero campaign={campaign} />
      <Marquee items={campaign.marquee} />
      <SeasonalEdit campaign={campaign} preview />

      {/* Brand statement */}
      <section aria-label="About MelCrochet" className="bg-cream">
        <div className="shell grid gap-10 py-24 sm:py-32 lg:grid-cols-12">
          <p className="label text-gold-deep lg:col-span-3">Handmade &middot; South Africa</p>
          <p className="reveal font-display text-[clamp(1.75rem,1.2rem+2.2vw,3.5rem)] font-light leading-[1.15] lg:col-span-9">
            MelCrochet Gifted Hands makes contemporary crochet — {campaign.id === "summer" ? "tops, dresses, hats, bags and gifts" : "fashion, blankets, bags and gifts"} — <span className="italic text-brown">slowly, carefully and entirely by hand.</span>{" "}
            Each piece is made to order, which means it is made for you.
          </p>
        </div>
      </section>

      <SignaturePieces products={signature} />
      <CollectionsShowcase collections={collections} />
      <ArtOfMaking images={craftImages} detail={campaign.id === "summer" ? PORTFOLIO.stitchDetail : undefined} />
      <FounderFeature />
      <LessonsFeature />
      <BespokeFeature image={campaign.id === "summer" ? PORTFOLIO.floralDress : campaign.hero} />

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
