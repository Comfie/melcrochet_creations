"use client";

import { useMemo, useState } from "react";
import { buildOrderMessage, buildWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppButton from "@/components/WhatsAppButton";

/**
 * Colour name → hex for swatch rendering. Names not in the map render as
 * labelled chips with no swatch, so new admin-entered colours never break
 * the page. Extend as Mel's palette grows.
 */
const COLOUR_HEX: Record<string, string> = {
  cream: "#F5F0E1",
  "sage green": "#9CAF88",
  charcoal: "#36454F",
  blue: "#4A6FA5",
  "dusty pink": "#D8A7B1",
  "mustard yellow": "#E1AD01",
  white: "#FFFFFF",
  purple: "#7E5A9B",
  brown: "#7B5E42",
  grey: "#9A9A9A",
  red: "#C0392B",
  maroon: "#6E1423",
  black: "#151515",
};
const LIGHT_COLOURS = new Set(["cream", "white"]);

interface Props {
  productName: string;
  productUrl: string;
  colours: string[];
  sizes: string[];
  className?: string;
}

export function OrderViaWhatsApp({ productName, productUrl, colours, sizes, className }: Props) {
  const [colour, setColour] = useState<string | null>(null);
  // Pre-select when there's exactly one size — no decision to make, but
  // still included in the WhatsApp message.
  const [size, setSize] = useState<string | null>(sizes.length === 1 ? sizes[0] : null);

  const href = useMemo(
    () => buildWhatsAppLink(buildOrderMessage({ productName, productUrl, colour, size })),
    [productName, productUrl, colour, size]
  );

  return (
    <div className={className}>
      {sizes.length > 1 && (
        <fieldset className="mb-4">
          <legend className="mb-2 font-sans text-sm font-medium text-ink">Size</legend>
          <div className="flex flex-wrap gap-2">
            {sizes.map((label) => {
              const selected = size === label;
              return (
                <label
                  key={label}
                  className={`cursor-pointer rounded-full border px-4 py-2 font-sans text-sm transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-ink ${
                    selected ? "border-ink bg-ink text-cream" : "border-taupe/40 text-ink/70 hover:border-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="size"
                    value={label}
                    checked={selected}
                    onChange={() => setSize(label)}
                    className="sr-only"
                  />
                  {label}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {colours.length > 0 && (
        <fieldset className="mb-4">
          <legend className="mb-2 font-sans text-sm font-medium text-ink">
            Colour{colour ? `: ${colour}` : ""}
          </legend>
          <div className="flex flex-wrap gap-2">
            {colours.map((name) => {
              const key = name.trim().toLowerCase();
              const hex = COLOUR_HEX[key];
              const selected = colour === name;
              return (
                <label
                  key={name}
                  title={name}
                  className={`flex cursor-pointer items-center gap-2 rounded-full border px-2 py-1 font-sans text-sm transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-ink ${
                    selected ? "border-ink ring-1 ring-ink" : "border-taupe/40 hover:border-ink"
                  }`}
                >
                  <input
                    type="radio"
                    name="colour"
                    value={name}
                    checked={selected}
                    onChange={() => setColour(name)}
                    className="sr-only"
                  />
                  {hex ? (
                    <span
                      aria-hidden="true"
                      className={`h-5 w-5 rounded-full ${LIGHT_COLOURS.has(key) ? "border border-taupe/40" : ""}`}
                      style={{ backgroundColor: hex }}
                    />
                  ) : null}
                  <span>{name}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <WhatsAppButton href={href} label="Order via WhatsApp" />

      {/* Gentle nudge, not a blocker — customers can still order without selecting. */}
      {colours.length > 0 && !colour && (
        <p className="mt-2 font-sans text-sm text-ink/60">
          Tip: pick a colour above and it&apos;ll be included in your message.
        </p>
      )}
    </div>
  );
}
