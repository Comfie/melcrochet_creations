import Image from "next/image";
import Link from "next/link";
import { getCategories, getProducts, getTestimonials } from "@/lib/queries";
import { buildWhatsAppLink, buildProductWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppButton from "@/components/WhatsAppButton";
import CategoryTile from "@/components/CategoryTile";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import StitchDivider from "@/components/StitchDivider";
import { LocalBusinessJsonLd } from "@/components/seo/JsonLd";
import { formatPrice } from "@/lib/format-price";

export const revalidate = 60;

export default async function Home() {
  const [categories, featured, testimonials] = await Promise.all([
    getCategories(),
    getProducts({ featured: true }),
    getTestimonials(),
  ]);

  return (
    <>
      <LocalBusinessJsonLd />

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-cream">
        <Image
          src="/landing-page-hero.jpg"
          alt="MelCrochet handmade blankets, hats, and scrunchies displayed at a market stall"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink/70" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-24 sm:py-32">
          <h1 className="text-hero max-w-2xl">
            Providing Warmth, Comfort &amp; Timeless Handmade Creations
          </h1>
          <p className="max-w-xl font-sans text-cream/70">
            Every MelCrochet piece is made by hand, with patience and care —
            blankets, bags, hats and gifts designed to last.
          </p>
          <WhatsAppButton href={buildWhatsAppLink()} label="Chat with us on WhatsApp" />
        </div>
      </section>

      <StitchDivider className="text-ink" />

      {/* Category grid */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-section">Shop by Category</h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryTile
                key={category.id}
                name={category.name}
                slug={category.slug}
                blurb={category.blurb}
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
                <div key={product.id} className="border border-cream/20 p-4">
                  <Link href={`/products/${product.slug}`}>
                    <div className="aspect-square w-full overflow-hidden">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <ImagePlaceholder className="h-full w-full" />
                      )}
                    </div>
                    <p className="mt-4 font-display text-lg">{product.name}</p>
                    <p className="mt-1 font-sans text-sm text-cream/60">
                      {formatPrice(product.priceType, product.price, product.currency)}
                    </p>
                  </Link>
                  <div className="mt-4">
                    <WhatsAppButton href={buildProductWhatsAppLink(product.name)} />
                  </div>
                </div>
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
          <ImagePlaceholder className="aspect-[4/3] w-full" />
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
