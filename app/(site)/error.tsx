"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { buttonClasses } from "@/components/ui/Button";
import { buildWhatsAppLink } from "@/lib/whatsapp";

export default function SiteError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="bg-cream">
      <div className="shell flex min-h-[70svh] flex-col items-center justify-center py-24 text-center">
        <p className="label text-gold-deep">Something went wrong</p>
        <h1 className="mt-6 text-display">
          We&apos;ve hit a <span className="italic">snag.</span>
        </h1>
        <p className="mt-6 max-w-md font-sans leading-relaxed text-ink/70">
          This page couldn&apos;t load just now. Please try again — or message us
          on WhatsApp and we&apos;ll help you directly.
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <button type="button" onClick={() => unstable_retry()} className={buttonClasses("ink")}>
            Try again
          </button>
          <a
            href={buildWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("outline")}
          >
            Message us on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
