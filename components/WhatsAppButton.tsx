import { MessageCircle } from "lucide-react";

type WhatsAppButtonProps = {
  href: string;
  variant?: "floating" | "inline";
  label?: string;
};

export default function WhatsAppButton({
  href,
  variant = "inline",
  label = "Order via WhatsApp",
}: WhatsAppButtonProps) {
  if (variant === "floating") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-ink shadow-lg shadow-black/20 transition-transform hover:scale-105 focus-visible:scale-105"
      >
        <MessageCircle className="h-7 w-7" aria-hidden="true" />
      </a>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 font-sans text-sm font-semibold text-ink transition-colors hover:bg-[#1ebe57] focus-visible:bg-[#1ebe57]"
    >
      <MessageCircle className="h-4 w-4" aria-hidden="true" />
      {label}
    </a>
  );
}
