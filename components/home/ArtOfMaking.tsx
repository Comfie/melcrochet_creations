import Image from "next/image";
import { cld } from "@/lib/cloudinary-url";

const PRINCIPLES = [
  {
    title: "Stitch by stitch",
    body: "Every MelCrochet piece is crocheted by hand, with patience and care.",
  },
  {
    title: "Made to order",
    body: "Your piece is started when you order it, so colours and sizes can be tailored to you.",
  },
  {
    title: "Finished to last",
    body: "Neat stitches and careful finishing — made to be used, loved and kept.",
  },
];

/**
 * "The Art of Making" — craftsmanship as design philosophy. The texture
 * close-up is a real crop of the founder photo's chunky throw (zoomed with
 * CSS, not a different image); the wide frame is the studio handbags photo
 * and the last frame a live catalogue photo (see app/(site)/page.tsx).
 */
export default function ArtOfMaking({
  images,
}: {
  images: { url: string; name: string }[];
}) {
  const [first, second] = images;

  return (
    <section aria-labelledby="making-title" className="relative overflow-hidden bg-ink py-24 text-cream sm:py-36">
      <div className="shell">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="label flex items-center gap-3 text-gold">
              <span className="tabular-nums">03</span>
              <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
              <span>Craft</span>
            </p>
            <h2 id="making-title" className="reveal mt-6 text-mega">
              The Art
              <br />
              <span className="italic text-gold">of Making.</span>
            </h2>
          </div>
          <p className="reveal font-display text-lede font-light text-cream/85 lg:col-span-5 lg:pb-4">
            Crochet is slow by nature. Each loop is pulled through by hand, row
            after row, until yarn becomes something you can wrap yourself in,
            carry, or give away. We think that time is the luxury.
          </p>
        </div>

        {/* Editorial collage */}
        <div className="mt-20 grid grid-cols-12 gap-4 sm:gap-6 lg:mt-28">
          <figure className="col-span-12 sm:col-span-7 lg:col-span-6">
            <div className="reveal-img relative aspect-[4/5] overflow-hidden">
              <Image
                src="/melissa.jpg"
                alt="Close-up of chunky hand-crocheted loops in cream, caramel and chocolate brown"
                fill
                // Zoomed 2.4× below, so request the full-resolution source.
                sizes="(max-width: 640px) 240vw, 120vw"
                className="origin-[40%_85%] scale-[2.4] object-cover object-[40%_85%]"
              />
            </div>
            <figcaption className="label mt-4 text-cream/60">Detail &mdash; chunky throw, hand-looped</figcaption>
          </figure>

          <div className="col-span-12 flex flex-col gap-4 sm:col-span-5 sm:gap-6 lg:col-span-5 lg:col-start-8">
            {first && (
              <figure className="lg:mt-24">
                <div className="reveal-img relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={cld(first.url, "wide")}
                    alt={first.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 40vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="label mt-4 text-cream/60">{first.name}</figcaption>
              </figure>
            )}
            {second && (
              <figure className="w-2/3 self-end">
                <div className="reveal-img relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={cld(second.url, "portrait")}
                    alt={second.name}
                    fill
                    sizes="(max-width: 640px) 66vw, 28vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="label mt-4 text-cream/60">{second.name}</figcaption>
              </figure>
            )}
          </div>
        </div>

        <ol className="mt-20 grid gap-10 border-t border-cream/15 pt-12 sm:grid-cols-3 lg:mt-28">
          {PRINCIPLES.map((p, i) => (
            <li key={p.title} className="reveal">
              <span className="font-display text-5xl italic text-gold">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-4 font-display text-2xl">{p.title}</h3>
              <p className="mt-3 max-w-xs font-sans text-sm leading-relaxed text-cream/75">{p.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
