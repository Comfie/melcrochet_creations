import Image from "next/image";

/**
 * Official MelCrochet logo system (public/brand/*.svg, from the supplied
 * MelCrochet-Logo-Files pack). `on` is the ground the logo sits on:
 *  - "light" → ink/gold artwork with a transparent background (cream, sand)
 *  - "dark"  → reversed artwork, which carries its own ink (#151515)
 *    background, so only use it on bg-ink sections.
 */
const LOGOS = {
  horizontal: { light: "melcrochet-logo-horizontal", dark: "melcrochet-logo-horizontal-reversed", width: 808, height: 220 },
  stacked: { light: "melcrochet-logo-primary-stacked", dark: "melcrochet-logo-primary-stacked-reversed", width: 767, height: 500 },
  wordmark: { light: "melcrochet-wordmark", dark: "melcrochet-wordmark-reversed", width: 785, height: 300 },
  icon: { light: "melcrochet-icon", dark: "melcrochet-icon-reversed", width: 210, height: 220 },
  badge: { light: "melcrochet-badge", dark: "melcrochet-badge-reversed", width: 360, height: 360 },
} as const;

export type LogoVariant = keyof typeof LOGOS;

export function logoSrc(variant: LogoVariant, on: "light" | "dark" = "light") {
  return `/brand/${LOGOS[variant][on]}.svg`;
}

export default function Logo({
  variant = "horizontal",
  on = "light",
  className = "h-10 w-auto",
  preload = false,
  decorative = false,
}: {
  variant?: LogoVariant;
  on?: "light" | "dark";
  /** Size with height + w-auto; the SVG keeps its aspect ratio. */
  className?: string;
  preload?: boolean;
  /** Set when an adjacent label already names the brand (e.g. a link's aria-label). */
  decorative?: boolean;
}) {
  const { width, height } = LOGOS[variant];
  return (
    <Image
      src={logoSrc(variant, on)}
      alt={decorative ? "" : "MelCrochet Gifted Hands"}
      width={width}
      height={height}
      // Vector artwork: serve the SVG as-is rather than through the optimiser.
      unoptimized
      preload={preload}
      className={className}
    />
  );
}
