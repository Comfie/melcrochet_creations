/**
 * Branded stand-in for missing photography. It is deliberately labelled
 * "Photo coming soon" so a missing product shot is never mistaken for a
 * styled image — see the photography brief in docs for what to commission.
 */
export default function ImagePlaceholder({
  className = "",
  label = "Photo coming soon",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 bg-sand bg-[url(/brand/melcrochet-pattern.svg)] bg-[length:320px_auto] text-brown ${className}`}
      role="img"
      aria-label={label}
    >
      <span aria-hidden="true" className="label bg-sand px-3 py-1.5 text-[0.5625rem] text-brown">
        {label}
      </span>
    </div>
  );
}
