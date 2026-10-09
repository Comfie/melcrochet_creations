/**
 * Slow, decorative ticker of category names. Purely ornamental (aria-hidden):
 * the same categories are reachable as real links in the collections grid
 * and the shop filters. Stops entirely under prefers-reduced-motion.
 */
export default function Marquee({ items }: { items: string[] }) {
  const row = (
    <ul className="flex shrink-0 items-center">
      {items.map((item) => (
        <li key={item} className="flex items-center">
          <span className="px-6 font-display text-3xl italic sm:px-10 sm:text-4xl">{item}</span>
          <span className="text-gold-deep">&#10022;</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div aria-hidden="true" className="overflow-hidden border-b border-ink/10 bg-cream py-6 text-ink">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        {row}
        {row}
      </div>
    </div>
  );
}
