import { MessageCircle } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";

type WhatsAppButtonProps = {
  href: string;
  variant?: "floating" | "inline";
  label?: string;
  /** Inline only: ink on light grounds, gold on dark grounds. */
  tone?: "ink" | "gold";
  size?: "md" | "lg";
  className?: string;
};

export default function WhatsAppButton({
  href,
  variant = "inline",
  label = "Order via WhatsApp",
  tone = "ink",
  size = "md",
  className = "",
}: WhatsAppButtonProps) {
  if (variant === "floating") {
    // WhatsApp green is kept for the floating shortcut only — instant
    // recognition matters more than palette purity for this one control.
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-ink shadow-lg shadow-black/25 transition-transform duration-300 hover:scale-105 focus-visible:scale-105"
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClasses(tone, size, className)}
    >
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      {label}
    </a>
  );
}
