import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "ink" | "gold" | "cream" | "outline" | "outline-light";
type Size = "md" | "lg";

const BASE =
  "group/btn inline-flex min-h-11 items-center justify-center gap-3 font-sans text-[0.75rem] font-semibold uppercase tracking-[0.18em] transition-[background-color,color,border-color] duration-300 ease-[var(--ease-editorial)]";

const VARIANTS: Record<Variant, string> = {
  // ink ↔ cream: 16.1:1 · ink on gold: 7.59:1
  ink: "bg-ink text-cream hover:bg-brown",
  gold: "bg-gold text-ink hover:bg-cream",
  cream: "bg-cream text-ink hover:bg-gold",
  outline: "border border-ink/80 text-ink hover:bg-ink hover:text-cream",
  "outline-light": "border border-cream/50 text-cream hover:border-cream hover:bg-cream hover:text-ink",
};

const SIZES: Record<Size, string> = {
  md: "px-6 py-3",
  lg: "px-8 py-4",
};

export function buttonClasses(variant: Variant = "ink", size: Size = "md", className = "") {
  return `${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`.trim();
}

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Opens in a new tab with rel=noopener (WhatsApp, Instagram, etc.). */
  external?: boolean;
  "aria-label"?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "ink",
  size = "md",
  className = "",
  external = false,
  ...rest
}: ButtonLinkProps) {
  const classes = buttonClasses(variant, size, className);
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...rest}>
      {children}
    </Link>
  );
}

/** Understated text link with an animated underline and trailing arrow. */
export function TextLink({
  href,
  children,
  className = "",
  external = false,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
}) {
  const classes = `group/link inline-flex items-center gap-2 label ${className}`;
  const inner = (
    <>
      <span className="link-draw">{children}</span>
      <span
        aria-hidden="true"
        className="transition-transform duration-300 group-hover/link:translate-x-1"
      >
        &rarr;
      </span>
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {inner}
    </Link>
  );
}
