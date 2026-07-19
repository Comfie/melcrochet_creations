# Landing Page Polish, Mobile Category Filter & Image Performance — Design

**Date:** 2026-07-18
**Author:** Comfort Nyatsine
**Status:** Approved (design), pending spec review

## Context

Phases 1–2 of `docs/new_spec/melcrochet-improvement-spec.md` (SEO + product experience) shipped on `main` (`f1bba6a..be96fee`). That work deliberately left the **landing page visually untouched** (it only gained `LocalBusinessJsonLd` + a `formatPrice` swap under the hood) and deferred two Phase 3 items: the **mobile category filter** (spec §3.3) and the **image-performance sweep** (spec §3.5).

This spec covers all three, as one cohesive "make the public storefront look premium and load fast" effort. They are tightly coupled: the landing-page polish and the image-performance sweep both touch the same image/card surfaces, and the mobile filter shares the products page's category UI.

## Aesthetic direction

The current site is clean but flat — utilitarian rather than "premium handmade." The correction is **real photography carrying each section**, generous whitespace, warm ink/cream/taupe layering for rhythm, and considered hover states — restraint plus quality imagery, not more ornament. All existing brand tokens stay: Fraunces (display) + Inter (body); Luxury Black `#151515`, Warm Gold `#C8A24A`, Soft Cream `#F7F0E3`, Warm Taupe `#A78B71`, Deep Brown `#3B2D26`; the stitch-divider motif. No new UI libraries.

## Decisions locked during brainstorming

1. **Landing-page ambition:** rich visual polish within the *existing* section structure (hero → categories → featured → meet the maker → testimonials). No new sections, no full art-direction redesign.
2. **Category-tile imagery:** **auto** — each tile uses the representative product photo (first active product-with-an-image in that category). No `Category` schema change. Categories whose products all lack photos fall back to a branded textured tile.
3. **Founder photo:** the existing `public/melissa.HEIC` (verified: Melissa wrapped in a chunky cream/brown blanket with a warm mug, portrait 3024×4032, on-palette) is converted to an optimized web JPG and used in "Meet the Maker".

---

## Workstream 1 — Landing page polish

### Hero
- Give it a commanding height: `min-h-[70vh]`.
- Replace the flat `bg-ink/70` overlay with a bottom-weighted gradient scrim (e.g. `from-ink/85 via-ink/55 to-ink/35`), so the photo reads better while the text stays WCAG-legible over the darkest (bottom) region where it sits.
- Add a small uppercase eyebrow label above the `h1` (e.g. "Handmade in South Africa").
- Add a **second CTA**: "Browse products" as an outline/ghost button beside the existing WhatsApp button — a path into the catalogue, not only WhatsApp.
- Keep `priority` + `sizes="100vw"` (LCP).

### Shop by Category (the biggest change)
- Replace the 12 text-only bordered boxes with **image-backed tiles**.
- Each tile: a square (`aspect-square`) image (representative product photo via `cld(url, "card")`), a bottom gradient scrim, the category name in Fraunces overlaid at the bottom, and a "Shop →" affordance revealed on hover/focus.
- **Empty-category fallback:** a branded textured tile — cream/taupe background with the stitch motif and the category name — never a broken/empty box.
- Grid: `grid-cols-2` mobile, `sm:grid-cols-3`, `lg:grid-cols-4` (was 1/2/4 — mobile bumped to 2 for a richer, less-scrolly grid).
- Data via a new `getCategoriesWithImages()` query (see Data layer below).

### Featured Pieces
- Keep the section on `bg-ink` (preserves the page's dark/light contrast rhythm).
- Drop the bespoke inline cards; reuse the shared **`ProductCard`** component. Cream `ProductCard`s pop against the dark background and unify the card treatment with the products page (inheriting the lead-time badge, `formatPrice`, and the next/image sweep).

### Meet the Maker
- Replace `ImagePlaceholder` with the real `melissa.jpg` via `next/image` (portrait frame, `object-cover`). Copy + "Read our story" link unchanged.

### Testimonials
- Light polish only: a decorative gold quotation-mark accent, larger quote type, tightened spacing. Keep the existing `TestimonialsCarousel` behavior.

---

## Workstream 2 — Mobile category filter (spec §3.3)

Rework the products-page category UI from a 13-pill wrapping block (which wraps into 3–4 rows on a ~380px viewport, pushing products below the fold) into a **single horizontal scroll strip** (spec's "Option A"):
- `overflow-x-auto`, hidden scrollbar (`scrollbar-width: none` + `::-webkit-scrollbar` hidden), `-webkit-overflow-scrolling: touch`.
- Right-edge fade gradient (decorative, `aria-hidden`) hinting scrollability.
- "All" pill pinned first.
- The active pill auto-scrolls into view on mount (requires a client component with `useRef`/`useEffect` + `scrollIntoView({ inline: "center", block: "nearest" })`).
- **Preserve** the existing accessibility and brand styling: `aria-current="page"` on the active pill, `aria-label` on the nav, and the gold/ink/taupe token styling already in `CategoryFilter` (NOT the generic Tailwind grays the reference bundle used).

This changes `CategoryFilter` from a server component (plain `Link`s) into a `"use client"` component. Its existing test (`components/CategoryFilter.test.tsx`) must keep passing (or be updated to match — the `aria-current`/href assertions should still hold).

---

## Workstream 3 — Image-performance sweep (spec §3.5)

Move every public-facing catalogue image off raw `<img>` onto **`next/image`**, routed through the `cld()` Cloudinary presets — this also wires up the `card` preset and a new `blur` preset that the Phase-1/2 branch review flagged as currently-dead code.

Surfaces:
- **Product cards** (`ProductCard`) — `next/image` with `src={cld(url, "card")}`, `sizes={IMG_SIZES.card}`, and a blur placeholder. Covers both the products page and (via reuse) home Featured Pieces.
- **Category tiles** — `next/image` + `cld(url, "card")` + `sizes` + blur.
- **Hero** — already `priority` + `sizes="100vw"`; add a blur placeholder (static import or manual `blurDataURL`).
- **Meet the Maker** — `next/image` on the local `melissa.jpg` (auto-optimized by Next).
- **Blog cards** (`BlogCard`) — `next/image` for the public blog card cover images (raw `<img>` today).

Add a `blur` preset to `lib/cloudinary-url.ts` (`e_blur:1000,q_1,w_40,f_auto`) and pass `placeholder="blur" blurDataURL={cld(url, "blur")}` on Cloudinary-backed images.

**Out of scope for the sweep:** admin-panel `<img>` thumbnails (internal, not customer-facing) and the product-detail gallery (already `next/image` via `ProductGallery`).

Target: Lighthouse mobile Performance meaningfully improved (spec's aspiration is ≥90; treat as a direction, not a hard gate, since scores vary by run/network).

---

## Data layer

New query in `lib/queries.ts`:

```ts
// Returns every category (all 12, sorted) with a representative product image:
// the imageUrl of the first active product in that category that has one,
// or null if none. No Category schema change.
export async function getCategoriesWithImages(): Promise<
  { id: string; name: string; slug: string; blurb: string | null; imageUrl: string | null }[]
>
```

Implementation approach: one query for all categories (sorted), plus a query for active products that have `imageUrl != null` (id, categoryId, imageUrl, sortOrder), then in JS pick the lowest-`sortOrder` product image per category. Keeps it to two round-trips regardless of category count, and reuses the existing `isActive` filter semantics.

## Component / file structure

| File | Change |
|---|---|
| `lib/queries.ts` | Add `getCategoriesWithImages()` |
| `lib/cloudinary-url.ts` | Add `blur` preset |
| `public/melissa.jpg` | New — converted from `melissa.HEIC`, optimized |
| `components/CategoryTile.tsx` | Rewrite: image-backed tile + branded fallback; takes `imageUrl` |
| `components/CategoryFilter.tsx` | Rewrite: `"use client"` horizontal scroll strip (active-into-view, edge fade), same brand tokens + a11y |
| `components/ProductCard.tsx` | `next/image` + `cld("card")` + `sizes` + blur placeholder |
| `components/BlogCard.tsx` | `next/image` for cover image |
| `components/TestimonialsCarousel.tsx` | Visual polish (gold quote mark, type) |
| `app/(site)/page.tsx` | Hero refinements; use new `CategoryTile` + `getCategoriesWithImages()`; Featured uses `ProductCard`; real founder photo |

New small pieces may be extracted if a file grows unwieldy (e.g. a `HeroActions` client button pair, or a `CategoryTileFallback`), decided at plan time.

## Testing

- **Unit (`renderToStaticMarkup` / jsdom + Testing Library, per existing conventions):**
  - `CategoryTile`: renders an image when `imageUrl` is set; renders the branded fallback (with category name) when it's null.
  - `ProductCard`: image `src` is routed through the `card` cld preset; `formatPrice` + lead-time badge still render (existing tests updated for next/image).
  - `CategoryFilter`: still marks the active pill with `aria-current`; "All" first; renders one pill per category; is a scroll strip (has the overflow container). Existing test assertions preserved/adapted.
  - `cld`: new `blur` preset returns the expected transform; existing preset tests untouched.
  - `getCategoriesWithImages` (real seeded DB): returns all 12 categories sorted; a category with photographed products gets a non-null `imageUrl`; a category whose products lack images gets `null`.
- **Manual (Playwright, real dev server):** landing page renders with image tiles + founder photo + refined hero + featured cards; empty-category fallback tile shows; mobile-width category filter scrolls horizontally with "All" pinned and active scrolled into view; `next/image` emits a `srcset` on cards/tiles; no console errors.
- Full `npx tsc --noEmit`, `npm test`, `npm run lint`, `npm run build` clean.

## Global constraints (bind every task)

- No `any` — use `unknown` and narrow.
- No new UI component libraries — Tailwind + brand tokens (`bg-ink`, `text-cream`, `bg-gold`, `text-brown`, `border-taupe/*`, `font-display`, `font-sans`). **Do NOT use generic Tailwind grays** (`neutral-*`, `gray-*`) on customer-facing surfaces.
- **Gold/taupe contrast trap** (from `globals.css`): `text-gold` and `text-taupe` only pass WCAG AA on `bg-ink`; on light backgrounds use `text-brown`. Category-tile names sit over a dark scrim, so gold/cream is fine there.
- Route params/`searchParams` are async in Next 16 — always `await`.
- Prisma client import: `import prisma from "@/lib/prisma"`. Queries live in `lib/queries.ts`.
- Cloudinary images render via `next/image`; `next.config.ts` already whitelists `res.cloudinary.com/**`.
- Tests run against a single shared real Postgres DB (`fileParallelism: false`); no mocking Prisma; clean up any rows created.
- Interactive-component tests need `// @vitest-environment jsdom`, `import "@testing-library/jest-dom/vitest"`, explicit `afterEach(cleanup)`.
- Don't add a Vitest test that imports `app/layout.tsx` (`next/font/google` is unresolvable outside the Next build).
- Commits: conventional format, no AI-attribution lines. Only commit when explicitly asked.

## Out of scope (explicitly deferred)

- Any `Category` schema change / admin category-image upload (auto product photo chosen instead).
- New landing-page sections (value strip, how-it-works, Instagram grid) — that was the "Polish + new sections" option, not chosen.
- Full art-direction redesign.
- Admin-panel image optimization, testimonials backend expansion, related products, blog visibility rules, analytics/WhatsApp click tracking, Instagram embed, custom domain — all remain out of scope (later phases).
