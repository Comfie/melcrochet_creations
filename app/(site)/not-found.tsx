import Link from "next/link";

export default function SiteNotFound() {
  return (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="text-display">Page Not Found</h1>
      <p className="mt-4 font-sans text-ink/70">
        We couldn&apos;t find what you were looking for. It may have been moved,
        or the link might be out of date.
      </p>
      <Link
        href="/"
        className="mt-8 inline-block font-sans text-sm font-semibold uppercase tracking-wide text-brown hover:text-ink"
      >
        Back to Home &rarr;
      </Link>
    </div>
  );
}
