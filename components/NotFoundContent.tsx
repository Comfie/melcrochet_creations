import { ButtonLink, TextLink } from "@/components/ui/Button";

/** Branded 404 body, shared by the root and (site) not-found boundaries. */
export default function NotFoundContent() {
  return (
    <section className="bg-cream">
      <div className="shell flex min-h-[70svh] flex-col items-center justify-center py-24 text-center">
        <p className="label text-gold-deep">Error 404</p>
        <h1 className="mt-6 text-display">
          A dropped <span className="italic">stitch.</span>
        </h1>
        <p className="mt-6 max-w-md font-sans leading-relaxed text-ink/70">
          We couldn&apos;t find what you were looking for. It may have been moved,
          or the link might be out of date.
        </p>
        <div className="mt-10 flex flex-col items-center gap-6 sm:flex-row sm:gap-10">
          <ButtonLink href="/products">Shop the Collection</ButtonLink>
          <TextLink href="/" className="text-ink">
            Back to Home
          </TextLink>
        </div>
      </div>
    </section>
  );
}
