import Image from "next/image";
import Link from "next/link";
import { getCategoriesWithImages, getProducts, getTestimonials } from "@/lib/queries";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppButton from "@/components/WhatsAppButton";
import CategoryTile from "@/components/CategoryTile";
import ProductCard from "@/components/ProductCard";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import StitchDivider from "@/components/StitchDivider";
import { LocalBusinessJsonLd } from "@/components/seo/JsonLd";

export const revalidate = 60;

export default async function Home() {
  const [categories, featured, testimonials] = await Promise.all([
    getCategoriesWithImages(),
    getProducts({ featured: true }),
    getTestimonials(),
  ]);

  return (
    <>
      <LocalBusinessJsonLd />

      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-ink text-cream">
        <Image
          src="/landing-page-hero.jpg"
          alt="MelCrochet handmade blankets, hats, and scrunchies displayed at a market stall"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/55 to-ink/35"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-5 py-20 sm:py-28">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Handmade in South Africa
          </p>
          <h1 className="text-hero max-w-2xl">
            Providing Warmth, Comfort &amp; Timeless Handmade Creations
          </h1>
          <p className="max-w-xl font-sans text-cream/80">
            Every MelCrochet piece is made by hand, with patience and care —
            blankets, bags, hats and gifts designed to last.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <WhatsAppButton href={buildWhatsAppLink()} label="Chat with us on WhatsApp" />
            <Link
              href="/products"
              className="inline-flex items-center rounded-full border border-cream/40 px-5 py-2.5 font-sans text-sm font-semibold text-cream transition-colors hover:border-cream hover:bg-cream/10"
            >
              Browse products
            </Link>
          </div>
        </div>
      </section>

      <StitchDivider className="text-ink" />

      {/* Category grid */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-section">Shop by Category</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryTile
                key={category.id}
                name={category.name}
                slug={category.slug}
                blurb={category.blurb}
                imageUrl={category.imageUrl}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured pieces */}
      {featured.length > 0 && (
        <section className="bg-ink text-cream">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="text-section">Featured Pieces</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 6).map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    priceType: product.priceType,
                    price: product.price,
                    currency: product.currency,
                    imageUrl: product.imageUrl,
                    leadTime: product.leadTime,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About teaser */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:grid-cols-2 sm:items-center">
          <div>
            <h2 className="text-section">Meet the Maker</h2>
            <p className="mt-4 font-sans text-ink/70">
              MelCrochet Gifted Hands is led by founder Melissa Ruvimbo Buchirai,
              whose passion for crochet has grown into a business built on gifted
              hands, patient craft, and the desire to make handmade items customers
              can treasure.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-block font-sans text-sm font-semibold uppercase tracking-wide text-brown hover:text-ink"
            >
              Read our story &rarr;
            </Link>
          </div>
          <div className="relative aspect-[3/4] w-full overflow-hidden border border-taupe/30">
            <Image
              src="/melissa.jpg"
              alt="Melissa Ruvimbo Buchirai, founder of MelCrochet Gifted Hands, wrapped in a handmade crochet blanket"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <StitchDivider className="text-taupe" />

      {/* Testimonials */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-section text-center">What Customers Say</h2>
          <div className="mt-10">
            <TestimonialsCarousel testimonials={testimonials} />
          </div>
        </div>
      </section>
    </>
  );
}
