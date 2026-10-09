import type { ReactNode } from "react";
import { Plus } from "lucide-react";

export type DetailItem = { title: string; content: ReactNode; open?: boolean };

/**
 * Native <details> accordion — keyboard and screen-reader accessible with
 * zero JavaScript, and content stays in the HTML for search engines.
 */
export default function ProductDetails({ items }: { items: DetailItem[] }) {
  return (
    <div className="border-b border-ink/15">
      {items.map((item) => (
        <details key={item.title} open={item.open} className="group border-t border-ink/15">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-4 [&::-webkit-details-marker]:hidden">
            <span className="label text-ink">{item.title}</span>
            <Plus
              className="h-4 w-4 shrink-0 transition-transform duration-300 group-open:rotate-45"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </summary>
          <div className="pb-6 font-sans text-sm leading-relaxed text-ink/75">{item.content}</div>
        </details>
      ))}
    </div>
  );
}
