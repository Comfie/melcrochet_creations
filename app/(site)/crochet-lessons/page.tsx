import type { Metadata } from "next";
import Image from "next/image";
import { LESSON_PHOTOS } from "@/lib/lesson-photos";
import { Check, MapPin, MessageCircle, Users, Plus } from "lucide-react";
import { ButtonLink, TextLink } from "@/components/ui/Button";
import { pageMetadata } from "@/lib/seo";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { PHONE_HREF, SITE } from "@/lib/site";
import { BreadcrumbJsonLd, LessonsJsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = pageMetadata({
  title: "Crochet Lessons in Northwold, Johannesburg",
  description: "Crochet lessons in Northwold, Johannesburg from R100. Learn with Melissa in one-hour beginner, private or group classes. Starter kits available. Enquire.",
  path: "/crochet-lessons",
  images: [{ url: LESSON_PHOTOS.students.url, width: 4160, height: 2340, alt: LESSON_PHOTOS.students.alt }],
});

const LESSONS = [
  { name: "Beginner", format: "1 session", description: "Start with the essentials: slip knot, chain and single crochet. A gentle introduction if you’ve never picked up a hook.", price: 100, kit: 180, unit: "per person", includes: "Yarn, hook and notebook", recommended: false },
  { name: "Beginner package", format: "3 sessions", description: "Build your confidence and work towards a small project, such as a beanie or coaster.", price: 280, kit: 420, unit: "per person · full package", includes: "Yarn, hook and accessories", recommended: true },
  { name: "Intermediate", format: "4 sessions", description: "Ready for your next challenge? Learn to make bags, hats or blankets, with different patterns available.", price: 450, kit: 650, unit: "per person · full package", includes: "Yarn, hook and accessories", recommended: false },
  { name: "Project-based", format: "Advanced", description: "Bring a bigger idea to life: blankets, garments, baskets, party dresses and more. Custom options available.", price: 250, kit: 400, unit: "per session", includes: "Yarn, hook and accessories", recommended: false },
  { name: "Private lessons", format: "One-to-one", description: "Personal support for the stitches or project you want to focus on, with a flexible schedule.", price: 200, kit: 350, unit: "per hour", includes: "Yarn, hook and accessories", recommended: false },
];
const enquiry = buildWhatsAppLink("Hi MelCrochet! I'd love to join your crochet lessons in Northwold. Could you help me choose a class and share the available times?");
const FAQS = [
  { question: "Can I join if I’ve never crocheted before?", answer: "Yes. The beginner session starts with slip knots, chains and single crochet. All ages are welcome, and the lessons are beginner friendly and supportive." },
  { question: "Do I need to bring my own supplies?", answer: "You can choose the price without a kit if you have your own supplies, or book with a starter kit. Let Melissa know which lesson you’re interested in so she can confirm what to bring." },
  { question: "Where and when are the lessons?", answer: "Lessons take place at Graceland One, Northwold, Johannesburg. Each session is 1 hour, and class times are flexible. Message Melissa to confirm available dates and arrival details before booking." },
  { question: "Can I book for a group?", answer: "Yes. Group classes are available for 3–6 people, with special rates for groups, churches, community organisations and events. Send your group size and preferred dates for a quote." },
];

export default function CrochetLessonsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: "/" }, { name: "Crochet Lessons", path: "/crochet-lessons" }]} />
      <LessonsJsonLd lessons={LESSONS} image={LESSON_PHOTOS.students.url} />
      <section className="bg-cream">
        <div className="shell grid items-center gap-12 pb-16 pt-12 sm:pb-24 sm:pt-20 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <p className="label text-gold-deep">Crochet lessons in Northwold, Johannesburg</p>
            <h1 className="mt-6 text-hero">Crochet lessons.<br />A skill for life.</h1>
            <p className="mt-8 max-w-xl font-display text-lede">Learn to crochet with Melissa, one patient stitch at a time.</p>
            <p className="mt-5 max-w-lg leading-relaxed text-ink/75">Learn to crochet in Northwold, Johannesburg, with friendly, in-person classes for beginners and experienced makers. From your very first chain to a piece you’re proud to say you made, find your rhythm with Melissa. All ages welcome.</p>
            <div className="mt-8 flex flex-wrap items-center gap-6">
              <ButtonLink href={enquiry} external size="lg"><MessageCircle size={18} aria-hidden="true" />Enquire about lessons</ButtonLink>
              <TextLink href="#lesson-options">Find your class</TextLink>
            </div>
            <p className="mt-5 text-sm text-ink/65">1 hour per session · From R100 per person · Starter kits available</p>
          </div>
          <figure className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image src="/melissa-crochet-bandana.jpg" alt="Melissa, founder of MelCrochet Gifted Hands, wearing her handmade crochet bandana" fill preload sizes="(max-width: 1024px) 100vw, 42vw" className="object-cover object-[50%_30%]" />
            </div>
            <figcaption className="mt-4 flex justify-between gap-4 text-sm text-ink/70"><span>Learn with Melissa</span><span>Learn. Create. Empower.</span></figcaption>
          </figure>
        </div>
      </section>

      <section aria-labelledby="past-lessons-title" className="border-t border-ink/10 bg-cream py-20 sm:py-28">
        <div className="shell">
          <div className="grid items-end gap-6 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="label text-gold-deep">A glimpse of our lessons</p>
              <h2 id="past-lessons-title" className="mt-6 text-display">Real people.<br />Their first stitches.</h2>
            </div>
            <p className="max-w-lg leading-relaxed text-ink/75">Our lessons are off to a lovely start. Meet Melissa and her first two students, and take a look at the garden setting where we’ve been learning and creating together.</p>
          </div>
          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            {([
              { photo: LESSON_PHOTOS.students, caption: "Melissa with her first two students, with crochet projects on the table.", position: "object-center" },
              { photo: LESSON_PHOTOS.setup, caption: "A closer look at our outdoor lesson setup.", position: "object-center" },
              { photo: LESSON_PHOTOS.garden, caption: "Our shaded garden space in Northwold.", position: "object-[50%_60%]" },
            ]).map(({ photo, caption, position }) => (
              <figure key={photo.url}>
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image src={photo.url} alt={photo.alt} fill quality={95} sizes="(max-width: 1024px) 100vw, 33vw" className={`object-cover ${position}`} />
                </div>
                <figcaption className="mt-4 text-sm text-ink/70">{caption}</figcaption>
              </figure>
            ))}
          </div>
          <TextLink href="#lesson-options" className="mt-8">Find a lesson for you</TextLink>
        </div>
      </section>

      <section id="lesson-options" aria-labelledby="options-title" className="scroll-mt-24 bg-sand py-20 sm:py-28">
        <div className="shell">
          <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
            <h2 id="options-title" className="text-display">Find your next stitch.</h2>
            <p className="max-w-lg leading-relaxed text-ink/75">Every session is 1 hour. Try a single lesson, choose a package of 3 or 4 one-hour sessions, or get help with your own project. Bring your supplies or add a kit.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {LESSONS.map((lesson) => (
              <article key={lesson.name} className={`flex flex-col border p-6 sm:p-8 ${lesson.recommended ? "border-ink bg-ink text-cream" : "border-ink/20 bg-cream"}`}>
                <p className={`label ${lesson.recommended ? "text-gold" : "text-gold-deep"}`}>{lesson.recommended ? "A little more time to learn" : lesson.format}</p>
                <h3 className="mt-5 font-display text-4xl">{lesson.name}</h3>
                {lesson.recommended && <p className="mt-2 text-sm text-cream/75">{lesson.format}</p>}
                <p className={`mt-3 text-sm ${lesson.recommended ? "text-cream/80" : "text-ink/75"}`}>1 hour per session</p>
                <p className={`mb-8 mt-4 text-sm leading-relaxed ${lesson.recommended ? "text-cream/80" : "text-ink/75"}`}>{lesson.description}</p>
                <div className={`mt-auto border-t pt-6 ${lesson.recommended ? "border-cream/20" : "border-ink/15"}`}>
                  <dl className="grid grid-cols-2 gap-4">
                    <div><dt className="text-sm">Without kit</dt><dd className="mt-2 font-display text-4xl">R{lesson.price}</dd></div>
                    <div><dt className="text-sm">With starter kit</dt><dd className="mt-2 font-display text-4xl">R{lesson.kit}</dd></div>
                  </dl>
                  <p className="mt-3 text-sm">{lesson.unit}</p>
                  <p className={`mt-2 text-xs leading-relaxed ${lesson.recommended ? "text-cream/75" : "text-ink/70"}`}>Kit price includes: {lesson.includes.toLowerCase()}.</p>
                  <ButtonLink href={buildWhatsAppLink(`Hi MelCrochet! I'm interested in ${lesson.name.toLowerCase()} crochet lessons (${lesson.format.toLowerCase()}). Please share available times and help me book. I would like to discuss the kit options.`)} external variant={lesson.recommended ? "gold" : "outline"} className="mt-6 w-full">Enquire about {lesson.name === "Beginner package" ? "this package" : "this lesson"}</ButtonLink>
                </div>
              </article>
            ))}
            <aside className="flex flex-col justify-center border border-ink/20 p-6 sm:p-8">
              <Users className="h-8 w-8 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
              <h3 className="mt-5 font-display text-4xl">Make it a shared experience.</h3>
              <p className="mt-4 text-sm leading-relaxed text-ink/75">Gather 3–6 people for a group class. Special rates are available for friends, churches, community organisations and events.</p>
              <TextLink href={buildWhatsAppLink("Hi MelCrochet! I'd like to enquire about a group crochet class. Please share your group rates and availability.")} external className="mt-8">Ask about group rates</TextLink>
            </aside>
          </div>
        </div>
      </section>

      <section aria-labelledby="kit-title" className="bg-brown py-20 text-cream sm:py-28">
        <div className="shell grid gap-14 lg:grid-cols-2 lg:gap-24">
          <div>
            <p className="label text-gold">Start with the essentials</p>
            <h2 id="kit-title" className="mt-6 text-display">Your first toolkit for a new favourite craft.</h2>
            <p className="mt-6 max-w-lg leading-relaxed text-cream/80">Choose a starter kit with your lesson and take the guesswork out of getting started. Confirm the supplies for your chosen lesson with Melissa.</p>
            <ul className="mt-8 space-y-4">
              {["1 × yarn (100g)", "1 × crochet hook in a suitable size", "Small scissors", "Stitch markers", "Project notebook with a basic stitch guide"].map((item) => <li key={item} className="flex gap-3"><Check className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" /><span>{item}</span></li>)}
            </ul>
          </div>
          <div className="flex flex-col justify-center border-t border-cream/20 pt-10 lg:border-l lg:border-t-0 lg:pl-14 lg:pt-0">
            <MapPin className="h-8 w-8 text-gold" strokeWidth={1.5} aria-hidden="true" />
            <h3 className="mt-5 font-display text-4xl">Come as you are.<br />Create something beautiful.</h3>
            <p className="mt-6 text-lg">Graceland One, Northwold</p>
            <p className="mt-2 text-cream/75">Johannesburg · Flexible class times</p>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-cream/75">Tell Melissa your experience level and preferred days. She’ll help you choose a lesson and confirm availability and booking details.</p>
            <ButtonLink href={enquiry} external variant="gold" className="mt-8 self-start">Ask about available times</ButtonLink>
          </div>
        </div>
      </section>

      <section aria-labelledby="questions-title" className="bg-cream py-20 sm:py-28">
        <div className="shell grid gap-10 lg:grid-cols-12 lg:gap-20">
          <h2 id="questions-title" className="text-section lg:col-span-4">Before your first stitch.</h2>
          <div className="lg:col-span-8">
            {FAQS.map((faq) => <details key={faq.question} className="group border-b border-ink/20 first:border-t"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-2xl [&::-webkit-details-marker]:hidden">{faq.question}<Plus className="h-5 w-5 shrink-0 transition-transform group-open:rotate-45" aria-hidden="true" /></summary><p className="max-w-2xl pb-6 text-sm leading-relaxed text-ink/75">{faq.answer}</p></details>)}
          </div>
        </div>
      </section>

      <section aria-labelledby="start-title" className="bg-sand py-16 text-center sm:py-24">
        <div className="shell">
          <h2 id="start-title" className="text-display">Your hands can make wonderful things.</h2>
          <p className="mx-auto mt-6 max-w-xl leading-relaxed text-ink/75">Not sure where to start? Say hello to Melissa. Together, we’ll find a lesson that suits you.</p>
          <div className="mt-8"><ButtonLink href={enquiry} external size="lg"><MessageCircle size={18} aria-hidden="true" />Let’s plan your first lesson</ButtonLink></div>
          <p className="mt-6 text-sm">Prefer to call? <a href={PHONE_HREF} className="underline underline-offset-4">{SITE.whatsappDisplay}</a></p>
        </div>
      </section>
    </>
  );
}
