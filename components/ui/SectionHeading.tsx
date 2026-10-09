import type { ReactNode } from "react";

/**
 * Editorial section header: numbered uppercase eyebrow, oversized serif
 * title, optional supporting copy. `tone` picks contrast-safe colours for
 * light (cream/sand) or dark (ink/brown) grounds.
 */
export default function SectionHeading({
  id,
  index,
  eyebrow,
  title,
  children,
  as: Tag = "h2",
  tone = "light",
  align = "left",
  className = "",
}: {
  /** id for the heading element, for aria-labelledby on the section. */
  id?: string;
  index?: string;
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  as?: "h1" | "h2";
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
}) {
  const accent = tone === "dark" ? "text-gold" : "text-gold-deep";
  const muted = tone === "dark" ? "text-cream/70" : "text-ink/70";
  const centered = align === "center";

  return (
    <header className={`${centered ? "mx-auto text-center" : ""} max-w-3xl ${className}`}>
      <p className={`label flex items-center gap-3 ${accent} ${centered ? "justify-center" : ""}`}>
        {index && <span className="tabular-nums">{index}</span>}
        {index && <span aria-hidden="true" className="h-px w-8 bg-current opacity-60" />}
        <span>{eyebrow}</span>
      </p>
      <Tag id={id} className={`mt-5 ${Tag === "h1" ? "text-display" : "text-section"}`}>{title}</Tag>
      {children && (
        <div className={`mt-5 max-w-xl font-sans text-[0.9375rem] leading-relaxed ${muted} ${centered ? "mx-auto" : ""}`}>
          {children}
        </div>
      )}
    </header>
  );
}
