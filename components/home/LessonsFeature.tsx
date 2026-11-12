import Image from "next/image";
import { LESSON_PHOTOS } from "@/lib/lesson-photos";
import { ButtonLink, TextLink } from "@/components/ui/Button";

export default function LessonsFeature() {
  return (
    <section aria-labelledby="lessons-title" className="border-t border-ink/10 bg-cream py-20 sm:py-28">
      <div className="shell grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <figure>
          <div className="relative aspect-video overflow-hidden">
          <Image src={LESSON_PHOTOS.students.url} quality={95} alt={LESSON_PHOTOS.students.alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
          <figcaption className="flex flex-wrap justify-between gap-3 bg-ink px-5 py-4 text-sm text-cream"><span>Melissa with her first two students</span><span>Lessons from R100</span></figcaption>
        </figure>
        <div>
          <p className="label text-gold-deep">Crochet lessons · Northwold</p>
          <h2 id="lessons-title" className="mt-6 text-display">Beautiful things begin with a single stitch.</h2>
          <p className="mt-6 max-w-lg leading-relaxed text-ink/75">Love handmade? Learn to make it yourself. Join Melissa for friendly, supportive crochet lessons — from holding your first hook to bringing your own project to life.</p>
          <p className="mt-5 text-sm text-ink/75">One-hour sessions. All ages welcome. Flexible class times. Starter kits available.</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <ButtonLink href="/crochet-lessons">Explore crochet lessons</ButtonLink>
            <TextLink href="/crochet-lessons#lesson-options">See lesson prices</TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}
