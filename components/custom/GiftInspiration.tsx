import Image from "next/image";
import { PORTFOLIO } from "@/lib/portfolio";
import { TextLink } from "@/components/ui/Button";
import { buildCustomOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp";

export default function GiftInspiration({ warmWeather = false }: { warmWeather?: boolean }) {
  const gifts = warmWeather ? [
    { photo: PORTFOLIO.pinkBag, description: "A handmade bag in their favourite shade.", piece: "crochet handbag" },
    { photo: PORTFOLIO.ruffleHats, description: "A playful ruffle hat in a colour they love.", piece: "colourful ruffle crochet hat" },
    { photo: PORTFOLIO.orangeTop, description: "A crochet top with a personal colour palette.", piece: "summer crochet top" },
  ] : [
    { photo: PORTFOLIO.pinkBag, description: "A handmade bag in their favourite shade.", piece: "crochet handbag" },
    { photo: PORTFOLIO.greyScarf, description: "A matching beanie and scarf for colder days.", piece: "beanie and scarf set" },
    { photo: PORTFOLIO.blackHat, description: "A crochet bucket hat with an everyday feel.", piece: "crochet bucket hat" },
    { photo: PORTFOLIO.navyScarf, description: "A warm set, made in a colour they love.", piece: "navy beanie and scarf set" },
    { photo: PORTFOLIO.greyHat, description: "Soft grey stitches and a relaxed brim.", piece: "grey crochet bucket hat" },
    { photo: PORTFOLIO.twoToneHat, description: "A two-tone finish for a personal touch.", piece: "two-tone crochet bucket hat" },
  ];

  return (
    <section id="gift-inspiration" aria-labelledby="gift-title" className="scroll-mt-24 bg-sand py-20 sm:py-28">
      <div className="shell">
        <div className="grid items-end gap-6 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="label text-gold-deep">Custom gifts</p>
            <h2 id="gift-title" className="mt-6 text-display">Something made<br />with them in mind.</h2>
          </div>
          <p className="max-w-lg leading-relaxed text-ink/75">A few pieces from our own work to inspire your next gift. Tell us who it’s for, the colours they love and when you need it. We’ll confirm the design, price and lead time before you order.</p>
        </div>
        <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {gifts.map(({ photo, description, piece }) => (
            <article key={photo.url}>
              <div className="relative aspect-[3/4] overflow-hidden bg-cream">
                <Image src={photo.url} alt={photo.alt} fill quality={95} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-contain" />
              </div>
              <h3 className="mt-5 font-display text-2xl">{photo.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/75">{description}</p>
              <TextLink href={buildWhatsAppLink(buildCustomOrderMessage({ piece }))} external className="mt-5">Enquire about a gift like this</TextLink>
            </article>
          ))}
        </div>
        <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ink/70">These are examples of our work. Each custom gift is quoted individually; colours, sizes and availability are confirmed on WhatsApp.</p>
      </div>
    </section>
  );
}
