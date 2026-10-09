import Image from "next/image";
import Link from "next/link";
import { InstagramIcon } from "@/components/SocialIcons";
import { ButtonLink } from "@/components/ui/Button";
import { cld } from "@/lib/cloudinary-url";
import { SITE } from "@/lib/site";

/**
 * Instagram-inspired gallery built from MelCrochet's own catalogue photos
 * (there is no Instagram API integration). Tiles link to the products they
 * show; the call to action links to the real Instagram profile.
 */
export default function StudioGallery({
  items,
}: {
  items: { url: string; name: string; slug: string }[];
}) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="studio-title" className="bg-cream py-24 sm:py-32">
      <div className="shell">
        <div className="flex flex-col items-center text-center">
          <InstagramIcon className="h-6 w-6 text-gold-deep" />
          <h2 id="studio-title" className="mt-5 text-section">
            From the studio, <span className="italic">to your feed.</span>
          </h2>
          <p className="mt-4 font-sans text-sm text-ink/70">
            Follow new pieces and works in progress at{" "}
            <a href={SITE.instagram} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink underline underline-offset-4">
              {SITE.instagramHandle}
            </a>
          </p>
        </div>

        <ul className="mt-14 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
          {items.map((item, i) => (
            <li key={item.slug} className={i % 2 === 1 ? "lg:mt-10" : ""}>
              <Link href={`/products/${item.slug}`} className="group relative block aspect-square overflow-hidden bg-sand">
                <Image
                  src={cld(item.url, "card")}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-editorial)] group-hover:scale-110"
                />
                <span className="absolute inset-0 flex items-end bg-ink/0 p-3 opacity-0 transition-all duration-500 group-hover:bg-ink/40 group-hover:opacity-100">
                  <span className="label text-[0.5625rem] text-cream">{item.name}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-12 flex justify-center">
          <ButtonLink href={SITE.instagram} external variant="outline">
            <InstagramIcon className="h-4 w-4" />
            Follow on Instagram
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
