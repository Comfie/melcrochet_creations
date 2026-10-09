import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { ButtonLink, TextLink } from "@/components/ui/Button";
import { buildCustomOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import { cld } from "@/lib/cloudinary-url";

const STEPS = [
  { title: "Share your idea", body: "Tell us the piece, colours and size you have in mind on WhatsApp." },
  { title: "We confirm the details", body: "We confirm feasibility, price and lead time before anything begins." },
  { title: "Made by hand, for you", body: "A 50% deposit starts your piece; the balance is due before delivery or collection." },
];

export default function BespokeFeature({ image }: { image: { url: string; name: string } | null }) {
  return (
    <section aria-labelledby="bespoke-title" className="bg-brown text-cream">
      {/* Not wrapped in .shell: the image bleeds to the viewport edge while the
          copy's left padding matches the shell gutter at every width. */}
      <div className="grid lg:grid-cols-2">
        <div className="px-5 py-24 sm:px-8 sm:py-32 lg:pl-[max(2rem,calc((100vw-90rem)/2+2rem))] lg:pr-16 xl:pl-[max(3.5rem,calc((100vw-90rem)/2+3.5rem))]">
          <p className="label flex items-center gap-3 text-gold">
            <span className="tabular-nums">05</span>
            <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />
            <span>Bespoke</span>
          </p>
          <h2 id="bespoke-title" className="reveal mt-6 text-display">
            Made for You.
            <br />
            <span className="italic text-gold">Made by Hand.</span>
          </h2>
          <p className="mt-8 max-w-md font-sans leading-relaxed text-cream/80">
            Request your own colours, sizes and designs — from a baby blanket in
            nursery tones to a sweater cut to your measurements. Every request is
            subject to confirmation, so you&apos;ll know exactly what to expect.
          </p>

          <ol className="mt-12 flex flex-col">
            {STEPS.map((step, i) => (
              <li key={step.title} className="reveal flex gap-6 border-t border-cream/15 py-6">
                <span className="label pt-1.5 tabular-nums text-gold">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <h3 className="font-display text-2xl">{step.title}</h3>
                  <p className="mt-1 font-sans text-sm text-cream/75">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
            <ButtonLink href={buildWhatsAppLink(buildCustomOrderMessage())} external variant="gold" size="lg">
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Request a Custom Piece
            </ButtonLink>
            <TextLink href="/custom-orders" className="text-cream">
              How custom orders work
            </TextLink>
          </div>
        </div>

        {image && (
          <div className="relative min-h-[28rem] sm:min-h-[36rem]">
            <Image
              src={cld(image.url, "gallery")}
              alt={image.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <p className="label absolute bottom-5 left-5 bg-brown/90 px-3 py-2 text-cream">{image.name}</p>
          </div>
        )}
      </div>
    </section>
  );
}
