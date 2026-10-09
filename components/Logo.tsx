/**
 * Typographic wordmark. No vector logo file exists in the repo yet — swap
 * this for the official MelCrochet logo SVG once it's supplied, keeping the
 * same props so every placement updates at once.
 */
export default function Logo({
  size = "md",
  className = "",
}: {
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span
        className={`font-display font-medium tracking-[-0.01em] ${
          size === "lg" ? "text-5xl sm:text-6xl" : "text-[1.75rem] sm:text-[2rem]"
        }`}
      >
        Mel<span className="italic">Crochet</span>
      </span>
      <span
        className={`font-sans font-semibold uppercase ${
          size === "lg" ? "mt-3 text-xs tracking-[0.5em]" : "mt-1 text-[0.5625rem] tracking-[0.42em]"
        }`}
      >
        Gifted Hands
      </span>
    </span>
  );
}
