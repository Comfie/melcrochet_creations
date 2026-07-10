export default function ImagePlaceholder({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center bg-taupe/15 ${className}`}
      role="img"
      aria-label="Photo coming soon"
    >
      <svg
        viewBox="0 0 64 32"
        className="h-8 w-16 text-taupe"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M0 16 Q8 4 16 16 T32 16 T48 16 T64 16" />
      </svg>
    </div>
  );
}
