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
      className={`flex flex-col items-center justify-center gap-3 bg-sand text-brown ${className}`}
      role="img"
      aria-label={label}
    >
      <svg
        viewBox="0 0 64 32"
        className="h-6 w-12 text-taupe"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        aria-hidden="true"
      >
        <path d="M0 16 Q8 4 16 16 T32 16 T48 16 T64 16" />
      </svg>
      <span aria-hidden="true" className="label text-[0.5625rem] text-brown/80">
        {label}
      </span>
    </div>
  );
}
