export default function StitchDivider({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 16"
      className={`h-4 w-full text-gold ${className}`}
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path d="M0 8 Q5 0 10 8 T20 8 T30 8 T40 8 T50 8 T60 8 T70 8 T80 8 T90 8 T100 8 T110 8 T120 8 T130 8 T140 8 T150 8 T160 8 T170 8 T180 8 T190 8 T200 8" />
    </svg>
  );
}
