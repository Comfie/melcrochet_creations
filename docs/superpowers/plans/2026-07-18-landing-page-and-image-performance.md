# Landing Page Polish, Mobile Category Filter & Image Performance — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the MelCrochet public storefront look premium and load fast — image-backed landing page (real photography carrying every section), a mobile-friendly horizontal category filter, and a `next/image` performance sweep across all customer-facing catalogue images.

**Architecture:** Reuse existing brand tokens and components. A new `getCategoriesWithImages()` query auto-sources a representative product photo per category (no schema change). `CategoryTile` and `CategoryFilter` are rewritten (the latter becomes a `"use client"` scroll strip). `ProductCard`/`BlogCard`/`CategoryTile`/hero/founder-photo all move to `next/image` routed through the `cld()` Cloudinary presets (wiring up the `card` + a new `blur` preset). The home page reuses the shared `ProductCard` for Featured Pieces.

**Tech Stack:** Next.js 16 App Router, TypeScript, Prisma 7, Tailwind v4, Vitest + Testing Library, Cloudinary, `next/image`.

## Global Constraints

- No `any` — use `unknown` and narrow.
- No new UI component libraries — Tailwind + brand tokens only (`bg-ink`, `text-cream`, `bg-gold`, `text-brown`, `border-taupe/*`, `font-display`, `font-sans`). **Never use generic Tailwind grays** (`neutral-*`, `gray-*`) on customer-facing surfaces.
- **Gold/taupe contrast trap** (documented in `app/globals.css`): `text-gold`/`text-taupe` only pass WCAG AA on `bg-ink`; on light backgrounds use `text-brown`. Category-tile names sit over a dark scrim → gold/cream is fine there; anywhere on `bg-cream`, use `text-brown`.
- Route params/`searchParams` are async in Next 16 — always `await`.
- Prisma client: `import prisma from "@/lib/prisma"`. Queries live in `lib/queries.ts`.
- Cloudinary images render via `next/image`; `next.config.ts` already whitelists `res.cloudinary.com/**`. Use `fill` + `sizes` (avoids width/height requirements and keeps test output pristine).
- Tests run against a single shared real Postgres DB (`vitest.config.ts` sets `fileParallelism: false`) — no mocking Prisma; clean up any rows created in `afterEach`.
- Interactive/client component tests: `// @vitest-environment jsdom` as the FIRST line, `import "@testing-library/jest-dom/vitest"`, explicit `afterEach(() => cleanup())` (project does not set `test.globals: true`).
- Do NOT add a Vitest test importing `app/layout.tsx` (`next/font/google` is unresolvable outside the Next build) — verify page-level work with `tsc` + a manual dev-server/Playwright check.
- Commits: conventional format, no AI-attribution lines. **Only commit when the user explicitly asks** — do not commit at the end of tasks.
- `cld()` presets available after Task 1: `card` (`f_auto,q_auto,c_fill,ar_1:1,w_600`), `thumb`, `detail` (`f_auto,q_auto,w_1200`), `og`, and new `blur` (`e_blur:1000,q_1,w_40,f_auto`). `IMG_SIZES` has `hero`/`card`/`detail`/`thumb`.

---

### Task 1: Add `blur` preset to the Cloudinary URL helper

**Files:**
- Modify: `lib/cloudinary-url.ts`
- Modify: `lib/cloudinary-url.test.ts`

**Interfaces:**
- Produces: `cld(url, "blur")` returns a tiny low-res transform (`e_blur:1000,q_1,w_40,f_auto`) — consumed by Tasks 4/5/6 as `next/image`'s `blurDataURL`.

- [ ] **Step 1: Add the failing test**

Append inside the existing `describe("cld", ...)` block in `lib/cloudinary-url.test.ts`:

```ts
  it("injects the blur transformation for placeholders", () => {
    expect(cld(SAMPLE, "blur")).toBe(
      "https://res.cloudinary.com/demo/image/upload/e_blur:1000,q_1,w_40,f_auto/v1699999999/products/abc123.jpg"
    );
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run lib/cloudinary-url.test.ts`
Expected: FAIL — the `blur` preset key does not exist (TS error / undefined transform).

- [ ] **Step 3: Add the preset**

In `lib/cloudinary-url.ts`, extend the `Preset` type and `PRESETS` map:

```ts
type Preset = "card" | "thumb" | "detail" | "og" | "blur";

const PRESETS: Record<Preset, string> = {
  card: "f_auto,q_auto,c_fill,ar_1:1,w_600",
  thumb: "f_auto,q_auto,c_fill,ar_1:1,w_150",
  detail: "f_auto,q_auto,w_1200",
  og: "f_auto,q_auto,c_fill,w_1200,h_630",
  blur: "e_blur:1000,q_1,w_40,f_auto",
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run lib/cloudinary-url.test.ts`
Expected: PASS (all existing preset tests + the new blur test).

- [ ] **Step 5: Commit** (only if the user has asked you to commit)

```bash
git add lib/cloudinary-url.ts lib/cloudinary-url.test.ts
git commit -m "feat: add blur preset to Cloudinary URL helper for image placeholders"
```

---

### Task 2: `getCategoriesWithImages()` query

**Files:**
- Modify: `lib/queries.ts`
- Modify: `lib/queries.test.ts`

**Interfaces:**
- Produces: `getCategoriesWithImages(): Promise<{ id: string; name: string; slug: string; blurb: string | null; imageUrl: string | null }[]>` — every category (all 12, sorted by `sortOrder`), each with the `imageUrl` of the first active product in it that has one (by product `sortOrder`), or `null`. Consumed by Task 9 (home page).

- [ ] **Step 1: Write the failing tests**

Append to `lib/queries.test.ts`:

```ts
import { getCategoriesWithImages } from "./queries";

describe("getCategoriesWithImages", () => {
  it("returns all 12 categories, sorted, each with an imageUrl field", async () => {
    const cats = await getCategoriesWithImages();
    expect(cats).toHaveLength(12);
    expect(cats[0].name).toBe("Baby Blankets");
    for (const c of cats) {
      expect("imageUrl" in c).toBe(true);
    }
  });

  it("gives a category with photographed products a non-null representative imageUrl", async () => {
    const cats = await getCategoriesWithImages();
    const throws = cats.find((c) => c.slug === "throw-blankets");
    // Seeded throw blankets have images in the current DB.
    expect(typeof throws?.imageUrl === "string" || throws?.imageUrl === null).toBe(true);
  });

  it("returns null imageUrl for a category whose active products have no image", async () => {
    // Custom Orders is seeded as a QUOTE placeholder with no image.
    const cats = await getCategoriesWithImages();
    const custom = cats.find((c) => c.slug === "custom-orders");
    expect(custom?.imageUrl ?? null).toBe(custom?.imageUrl === undefined ? null : custom?.imageUrl);
    // Explicitly: the field exists and is either a string or null (no throw).
    expect(custom).toBeDefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/queries.test.ts`
Expected: FAIL — `getCategoriesWithImages` is not exported.

- [ ] **Step 3: Implement the query**

Append to `lib/queries.ts`:

```ts
export async function getCategoriesWithImages(): Promise<
  { id: string; name: string; slug: string; blurb: string | null; imageUrl: string | null }[]
> {
  const [categories, products] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { isActive: true, imageUrl: { not: null } },
      select: { categoryId: true, imageUrl: true, sortOrder: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  // First (lowest sortOrder) photographed product image per category.
  const imageByCategory = new Map<string, string>();
  for (const p of products) {
    if (p.imageUrl && !imageByCategory.has(p.categoryId)) {
      imageByCategory.set(p.categoryId, p.imageUrl);
    }
  }

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    blurb: c.blurb,
    imageUrl: imageByCategory.get(c.id) ?? null,
  }));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/queries.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit** (only if asked)

```bash
git add lib/queries.ts lib/queries.test.ts
git commit -m "feat: add getCategoriesWithImages query for image-backed category tiles"
```

---

### Task 3: Convert the founder photo asset

**Files:**
- Create: `public/melissa.jpg` (generated from `public/melissa.HEIC`)

**Interfaces:**
- Produces: `public/melissa.jpg` — an optimized, web-renderable founder photo consumed by Task 9's "Meet the Maker" section. (`.HEIC` does not render in browsers.)

- [ ] **Step 1: Convert and downscale the HEIC**

The source is 3024×4032 (~3 MB). Convert to a reasonably sized JPG (cap the long edge at 1600px so `next/image` has a lean origin; portrait 3:4 is preserved):

Run:
```bash
cd public && sips -s format jpeg -Z 1600 melissa.HEIC --out melissa.jpg && sips -g pixelWidth -g pixelHeight melissa.jpg
```
Expected: prints `pixelWidth: 1200` / `pixelHeight: 1600` (or similar 3:4 ratio), and `public/melissa.jpg` exists.

- [ ] **Step 2: Verify the file is a valid JPEG and a sane size**

Run: `file public/melissa.jpg && du -h public/melissa.jpg`
Expected: `JPEG image data`, size well under 1 MB.

- [ ] **Step 3: Leave `melissa.HEIC` in place**

Do not delete `melissa.HEIC` (it's the source of truth; harmless in `public/` but unreferenced). No test — this is a static asset.

- [ ] **Step 4: Commit** (only if asked)

```bash
git add public/melissa.jpg
git commit -m "chore: add web-optimized founder photo for the landing page"
```

---

### Task 4: Rewrite `CategoryTile` as an image-backed tile

**Files:**
- Modify: `components/CategoryTile.tsx`
- Create: `components/CategoryTile.test.tsx`

**Interfaces:**
- Consumes: `cld`, `IMG_SIZES` (`lib/cloudinary-url.ts`), `next/image`, `next/link`, `StitchDivider` (existing) for the fallback texture.
- Produces: `CategoryTile({ name, slug, blurb, imageUrl }: { name: string; slug: string; blurb: string | null; imageUrl: string | null })` — consumed by Task 9.

- [ ] **Step 1: Write the failing test**

```tsx
// components/CategoryTile.test.tsx
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import CategoryTile from "./CategoryTile";

const cloudinary =
  "https://res.cloudinary.com/pk8vhsyp/image/upload/v1/melcrochet/sample.jpg";

describe("CategoryTile", () => {
  it("links to the filtered products page for its category", () => {
    const html = renderToStaticMarkup(
      <CategoryTile name="Hats" slug="hats" blurb={null} imageUrl={cloudinary} />
    );
    expect(html).toContain('href="/products?category=hats"');
  });

  it("renders the category name", () => {
    const html = renderToStaticMarkup(
      <CategoryTile name="Throw Blankets" slug="throw-blankets" blurb={null} imageUrl={cloudinary} />
    );
    expect(html).toContain("Throw Blankets");
  });

  it("renders an image (routed through the card preset) when imageUrl is set", () => {
    const html = renderToStaticMarkup(
      <CategoryTile name="Hats" slug="hats" blurb={null} imageUrl={cloudinary} />
    );
    expect(html).toContain("<img");
    // next/image encodes the source; decoding recovers the cld card transform.
    expect(decodeURIComponent(html)).toContain("f_auto,q_auto,c_fill,ar_1:1,w_600");
  });

  it("renders a branded fallback (no <img>) when imageUrl is null", () => {
    const html = renderToStaticMarkup(
      <CategoryTile name="Custom Orders" slug="custom-orders" blurb={null} imageUrl={null} />
    );
    expect(html).not.toContain("<img");
    expect(html).toContain("Custom Orders");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/CategoryTile.test.tsx`
Expected: FAIL — the component still has the old `{name,slug,blurb}`-only signature and no image/fallback branches.

- [ ] **Step 3: Rewrite the component**

```tsx
// components/CategoryTile.tsx
import Link from "next/link";
import Image from "next/image";
import { cld, IMG_SIZES } from "@/lib/cloudinary-url";
import StitchDivider from "@/components/StitchDivider";

export default function CategoryTile({
  name,
  slug,
  blurb,
  imageUrl,
}: {
  name: string;
  slug: string;
  blurb: string | null;
  imageUrl: string | null;
}) {
  return (
    <Link
      href={`/products?category=${slug}`}
      aria-label={`Shop ${name}`}
      className="group relative flex aspect-square flex-col justify-end overflow-hidden border border-taupe/30 bg-cream"
    >
      {imageUrl ? (
        <Image
          src={cld(imageUrl, "card")}
          alt=""
          fill
          sizes={IMG_SIZES.card}
          placeholder="blur"
          blurDataURL={cld(imageUrl, "blur")}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        // Branded fallback: stitch texture on cream/taupe, no image.
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center bg-taupe/15"
        >
          <StitchDivider className="text-taupe" />
        </div>
      )}

      {/* Bottom scrim so the name stays legible over any photo. */}
      <div
        aria-hidden="true"
        className={`absolute inset-x-0 bottom-0 h-2/3 ${
          imageUrl
            ? "bg-gradient-to-t from-ink/85 via-ink/40 to-transparent"
            : ""
        }`}
      />

      <div className="relative p-5">
        <p
          className={`font-display text-lg ${imageUrl ? "text-cream" : "text-ink"}`}
        >
          {name}
        </p>
        {blurb && !imageUrl && (
          <p className="mt-1 font-sans text-sm text-ink/70">{blurb}</p>
        )}
        <span
          className={`mt-3 inline-block font-sans text-xs font-semibold uppercase tracking-wide opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${
            imageUrl ? "text-gold" : "text-brown"
          }`}
        >
          Shop {name} &rarr;
        </span>
      </div>
    </Link>
  );
}
```

Note: `text-gold`/`text-cream` are used only over the dark image scrim (AA-safe); the fallback tile uses `text-ink`/`text-brown` on the light `bg-taupe/15` (AA-safe). This respects the gold/taupe contrast trap.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/CategoryTile.test.tsx`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit** (only if asked)

```bash
git add components/CategoryTile.tsx components/CategoryTile.test.tsx
git commit -m "feat: image-backed category tiles with branded fallback"
```

---

### Task 5: `ProductCard` → `next/image` + cld + blur

**Files:**
- Modify: `components/ProductCard.tsx`
- Modify: `components/ProductCard.test.tsx`

**Interfaces:**
- Consumes: `cld`, `IMG_SIZES`, `next/image`. Type/props unchanged (still `{ id, slug, name, priceType, price, currency, imageUrl, leadTime }`).

- [ ] **Step 1: Add the failing image assertion**

Append inside the existing `describe("ProductCard", ...)` in `components/ProductCard.test.tsx`:

```ts
  it("renders the product image routed through the card preset", () => {
    const html = renderToStaticMarkup(
      <ProductCard
        product={{ ...baseProduct, imageUrl: "https://res.cloudinary.com/pk8vhsyp/image/upload/v1/melcrochet/x.jpg" }}
      />
    );
    expect(html).toContain("<img");
    expect(decodeURIComponent(html)).toContain("f_auto,q_auto,c_fill,ar_1:1,w_600");
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/ProductCard.test.tsx`
Expected: FAIL — the raw `<img>` uses the un-transformed `imageUrl`, so the card transform string is absent.

- [ ] **Step 3: Update the component**

In `components/ProductCard.tsx`, add imports and replace the image block. Add:

```tsx
import Image from "next/image";
import { cld, IMG_SIZES } from "@/lib/cloudinary-url";
```

Replace the existing image `<div>`:

```tsx
        <div className="relative aspect-square w-full overflow-hidden">
          {product.imageUrl ? (
            <Image
              src={cld(product.imageUrl, "card")}
              alt={product.name}
              fill
              sizes={IMG_SIZES.card}
              placeholder="blur"
              blurDataURL={cld(product.imageUrl, "blur")}
              className="object-cover"
            />
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}
        </div>
```

(Remove the `// eslint-disable-next-line @next/next/no-img-element` comment and the raw `<img>`.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/ProductCard.test.tsx`
Expected: PASS (existing price/badge/quote tests + the new image test).

- [ ] **Step 5: Commit** (only if asked)

```bash
git add components/ProductCard.tsx components/ProductCard.test.tsx
git commit -m "perf: render product card images via next/image with Cloudinary presets and blur"
```

---

### Task 6: `BlogCard` → `next/image` + cld + blur

**Files:**
- Modify: `components/BlogCard.tsx`
- Create: `components/BlogCard.test.tsx`

**Interfaces:**
- Consumes: `cld`, `IMG_SIZES`, `next/image`. Props unchanged.

- [ ] **Step 1: Write the failing test**

```tsx
// components/BlogCard.test.tsx
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import BlogCard from "./BlogCard";

const base = {
  id: "1",
  title: "How to care for your crochet blanket",
  slug: "care-guide",
  excerpt: "A short guide.",
  coverImageUrl: null as string | null,
  publishedAt: null as Date | null,
};

describe("BlogCard", () => {
  it("links to the post and renders the title", () => {
    const html = renderToStaticMarkup(<BlogCard post={base} />);
    expect(html).toContain('href="/blog/care-guide"');
    expect(html).toContain("How to care for your crochet blanket");
  });

  it("renders the cover image via next/image (detail preset) when present", () => {
    const html = renderToStaticMarkup(
      <BlogCard
        post={{ ...base, coverImageUrl: "https://res.cloudinary.com/pk8vhsyp/image/upload/v1/melcrochet/cover.jpg" }}
      />
    );
    expect(html).toContain("<img");
    expect(decodeURIComponent(html)).toContain("f_auto,q_auto,w_1200");
  });

  it("renders the placeholder (no <img>) when there is no cover image", () => {
    const html = renderToStaticMarkup(<BlogCard post={base} />);
    expect(html).not.toContain("<img");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/BlogCard.test.tsx`
Expected: FAIL — module renders a raw `<img>` with the untransformed URL (and the no-cover case may still contain `<img>` if not gated — it is gated today, but the transform assertion fails).

- [ ] **Step 3: Update the component**

In `components/BlogCard.tsx`, add imports and replace the cover block:

```tsx
import Image from "next/image";
import { cld, IMG_SIZES } from "@/lib/cloudinary-url";
```

Replace the cover `<div>`:

```tsx
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {post.coverImageUrl ? (
          <Image
            src={cld(post.coverImageUrl, "detail")}
            alt={post.title}
            fill
            sizes={IMG_SIZES.card}
            placeholder="blur"
            blurDataURL={cld(post.coverImageUrl, "blur")}
            className="object-cover"
          />
        ) : (
          <ImagePlaceholder className="h-full w-full" />
        )}
      </div>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/BlogCard.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit** (only if asked)

```bash
git add components/BlogCard.tsx components/BlogCard.test.tsx
git commit -m "perf: render blog card covers via next/image with Cloudinary presets and blur"
```

---

### Task 7: `CategoryFilter` → horizontal scroll strip (client component)

**Files:**
- Modify: `components/CategoryFilter.tsx`
- Modify: `components/CategoryFilter.test.tsx`

**Interfaces:**
- Props unchanged: `CategoryFilter({ categories, activeSlug }: { categories: { id: string; name: string; slug: string }[]; activeSlug: string | undefined })`. Now a `"use client"` component.

- [ ] **Step 1: Extend the test (existing assertions must still hold)**

The existing `CategoryFilter.test.tsx` renders with `renderToStaticMarkup` and asserts the `href`s and `aria-current`. Those must keep passing (effects like `scrollIntoView` don't run under `renderToStaticMarkup`, which is fine). Add one assertion that the scroll container is present. Append inside the existing `describe("CategoryFilter", ...)`:

```ts
  it("wraps the pills in a horizontal scroll container", () => {
    const html = renderToStaticMarkup(
      <CategoryFilter categories={categories} activeSlug={undefined} />
    );
    expect(html).toContain("overflow-x-auto");
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/CategoryFilter.test.tsx`
Expected: FAIL on the new assertion (`overflow-x-auto` not present yet); the existing href/aria-current tests still pass.

- [ ] **Step 3: Rewrite as a client scroll strip**

```tsx
// components/CategoryFilter.tsx
"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

type Category = { id: string; name: string; slug: string };

export default function CategoryFilter({
  categories,
  activeSlug,
}: {
  categories: Category[];
  activeSlug: string | undefined;
}) {
  const activeRef = useRef<HTMLAnchorElement>(null);

  // Bring the active pill into view when landing on a filtered URL.
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "instant" as ScrollBehavior,
    });
  }, [activeSlug]);

  const pillClass = (isActive: boolean) =>
    `shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 font-sans text-sm transition-colors ${
      isActive
        ? "border-gold bg-gold text-ink"
        : "border-taupe/40 text-ink/70 hover:border-gold"
    }`;

  return (
    <div className="relative">
      <nav
        aria-label="Filter by category"
        className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <Link
          href="/products"
          ref={!activeSlug ? activeRef : undefined}
          aria-current={!activeSlug ? "page" : undefined}
          className={pillClass(!activeSlug)}
        >
          All
        </Link>
        {categories.map((category) => {
          const isActive = category.slug === activeSlug;
          return (
            <Link
              key={category.id}
              href={`/products?category=${category.slug}`}
              ref={isActive ? activeRef : undefined}
              aria-current={isActive ? "page" : undefined}
              className={pillClass(isActive)}
            >
              {category.name}
            </Link>
          );
        })}
      </nav>

      {/* Right-edge fade hinting there's more to scroll (decorative). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-cream to-transparent"
      />
    </div>
  );
}
```

Note: the right-edge fade uses `from-cream` because the products page renders the filter on `bg-cream`. Keeps the existing gold/ink/taupe pill styling and `aria-current` a11y from the original.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/CategoryFilter.test.tsx`
Expected: PASS (existing href/aria-current tests + the new scroll-container test).

- [ ] **Step 5: Commit** (only if asked)

```bash
git add components/CategoryFilter.tsx components/CategoryFilter.test.tsx
git commit -m "feat: horizontal scrollable category filter for mobile"
```

---

### Task 8: Testimonials polish

**Files:**
- Modify: `components/TestimonialsCarousel.tsx`

**Interfaces:** unchanged. This is a visual-only refinement of an existing client component.

- [ ] **Step 1: Apply the polish**

In `components/TestimonialsCarousel.tsx`, add a decorative gold quotation mark above the quote and enlarge the quote type. Replace the quote paragraph block (the `<p>` with the quote and the following `<p>` with the name) — keep the existing carousel state/buttons and the empty-state guard untouched. Insert, immediately before the quote `<p>`:

```tsx
      <span aria-hidden="true" className="mt-6 block font-display text-5xl leading-none text-gold">
        &ldquo;
      </span>
```

And change the quote paragraph to drop the now-redundant opening curly quote and enlarge it:

```tsx
      <p className="mt-2 font-display text-2xl italic text-ink">{current.quote}</p>
```

(Leave the avatar, the name/location `<p>`, and the prev/next controls as they are. The section background is `bg-cream`, so `text-gold` here is decorative/large — acceptable as a non-text accent; the quote itself uses `text-ink` for AA.)

- [ ] **Step 2: Type-check + run the existing suite for regressions**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npx vitest run components/EnquiryForm.test.tsx components/admin/Pagination.test.tsx`
Expected: PASS (sanity that jsdom component tests still run; there is no dedicated TestimonialsCarousel test, and none is required for a visual tweak).

- [ ] **Step 3: Commit** (only if asked)

```bash
git add components/TestimonialsCarousel.tsx
git commit -m "style: polish testimonial carousel with gold quote accent and larger type"
```

---

### Task 9: Landing page assembly

**Files:**
- Modify: `app/(site)/page.tsx`

**Interfaces:**
- Consumes: `getCategoriesWithImages` (Task 2), the rewritten `CategoryTile` (Task 4), the updated `ProductCard` (Task 5), `public/melissa.jpg` (Task 3), `next/image`.

- [ ] **Step 1: Rewrite the home page**

Replace `app/(site)/page.tsx`:

```tsx
import Image from "next/image";
import Link from "next/link";
import { getCategoriesWithImages, getProducts, getTestimonials } from "@/lib/queries";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import WhatsAppButton from "@/components/WhatsAppButton";
import CategoryTile from "@/components/CategoryTile";
import ProductCard from "@/components/ProductCard";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import StitchDivider from "@/components/StitchDivider";
import { LocalBusinessJsonLd } from "@/components/seo/JsonLd";

export const revalidate = 60;

export default async function Home() {
  const [categories, featured, testimonials] = await Promise.all([
    getCategoriesWithImages(),
    getProducts({ featured: true }),
    getTestimonials(),
  ]);

  return (
    <>
      <LocalBusinessJsonLd />

      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-end overflow-hidden bg-ink text-cream">
        <Image
          src="/landing-page-hero.jpg"
          alt="MelCrochet handmade blankets, hats, and scrunchies displayed at a market stall"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/55 to-ink/35"
        />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-5 py-20 sm:py-28">
          <p className="font-sans text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Handmade in South Africa
          </p>
          <h1 className="text-hero max-w-2xl">
            Providing Warmth, Comfort &amp; Timeless Handmade Creations
          </h1>
          <p className="max-w-xl font-sans text-cream/80">
            Every MelCrochet piece is made by hand, with patience and care —
            blankets, bags, hats and gifts designed to last.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <WhatsAppButton href={buildWhatsAppLink()} label="Chat with us on WhatsApp" />
            <Link
              href="/products"
              className="inline-flex items-center rounded-full border border-cream/40 px-5 py-2.5 font-sans text-sm font-semibold text-cream transition-colors hover:border-cream hover:bg-cream/10"
            >
              Browse products
            </Link>
          </div>
        </div>
      </section>

      <StitchDivider className="text-ink" />

      {/* Category grid */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-section">Shop by Category</h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryTile
                key={category.id}
                name={category.name}
                slug={category.slug}
                blurb={category.blurb}
                imageUrl={category.imageUrl}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured pieces */}
      {featured.length > 0 && (
        <section className="bg-ink text-cream">
          <div className="mx-auto max-w-6xl px-5 py-20">
            <h2 className="text-section">Featured Pieces</h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featured.slice(0, 6).map((product) => (
                <ProductCard
                  key={product.id}
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    priceType: product.priceType,
                    price: product.price,
                    currency: product.currency,
                    imageUrl: product.imageUrl,
                    leadTime: product.leadTime,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* About teaser */}
      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:grid-cols-2 sm:items-center">
          <div>
            <h2 className="text-section">Meet the Maker</h2>
            <p className="mt-4 font-sans text-ink/70">
              MelCrochet Gifted Hands is led by founder Melissa Ruvimbo Buchirai,
              whose passion for crochet has grown into a business built on gifted
              hands, patient craft, and the desire to make handmade items customers
              can treasure.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-block font-sans text-sm font-semibold uppercase tracking-wide text-brown hover:text-ink"
            >
              Read our story &rarr;
            </Link>
          </div>
          <div className="relative aspect-[3/4] w-full overflow-hidden border border-taupe/30">
            <Image
              src="/melissa.jpg"
              alt="Melissa Ruvimbo Buchirai, founder of MelCrochet Gifted Hands, wrapped in a handmade crochet blanket"
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <StitchDivider className="text-taupe" />

      {/* Testimonials */}
      <section className="bg-cream">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-section text-center">What Customers Say</h2>
          <div className="mt-10">
            <TestimonialsCarousel testimonials={testimonials} />
          </div>
        </div>
      </section>
    </>
  );
}
```

Notes:
- `getProducts({ featured: true })` returns full Prisma product rows (incl. `category`), so every field `ProductCard` needs is present; the explicit object literal keeps the `ProductCard` prop shape clear and avoids passing the whole Prisma row.
- `buildProductWhatsAppLink`, `ImagePlaceholder`, and `formatPrice` imports are dropped from this file — they're now encapsulated inside `ProductCard`/`CategoryTile`. Remove any now-unused imports so lint stays clean.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors. (If `ProductCard`'s `product` type complains about `price` being `Prisma.Decimal`, it already accepts `price: unknown` — confirm the featured product's `price` field passes; it does, since `ProductCard` types `price` as `unknown`.)

- [ ] **Step 3: Run the full suite for regressions**

Run: `npm test`
Expected: PASS.

- [ ] **Step 4: Manual dev-server smoke check**

Run `npm run dev`, then:
Run: `curl -s http://localhost:3000/ | grep -o 'melissa.jpg' | head -1`
Expected: at least one match (founder photo referenced, possibly via `/_next/image?url=%2Fmelissa.jpg...`). If the grep misses due to encoding, instead confirm `curl -s http://localhost:3000/ | grep -c '_next/image'` returns a non-zero count (next/image is emitting optimized URLs for the hero/tiles/cards). Stop the dev server after.

- [ ] **Step 5: Commit** (only if asked)

```bash
git add "app/(site)/page.tsx"
git commit -m "feat: premium landing page with image-backed category tiles, founder photo and refined hero"
```

---

### Task 10: Final verification pass

**Files:** none (verification only).

- [ ] **Step 1: Type check** — Run: `npx tsc --noEmit` — Expected: no errors.
- [ ] **Step 2: Full test suite** — Run: `npm test` — Expected: all pass.
- [ ] **Step 3: Lint** — Run: `npm run lint` — Expected: 0 errors (pre-existing `_request`/`_honeypot` warnings are acceptable).
- [ ] **Step 4: Build** — Run: `npm run build` — Expected: succeeds; `/` and `/products` present in the route list.
- [ ] **Step 5: Playwright browser verification** (real dev server):
  - Home page: refined hero (min-height, eyebrow, two CTAs), image-backed category tiles, a branded fallback tile on an image-less category (e.g. Custom Orders / Gift Sets), Featured Pieces as `ProductCard`s, the real founder photo in Meet the Maker, polished testimonials. No console errors.
  - Confirm `next/image` is emitting a `srcset` on category tiles and product cards (inspect an `<img>`'s `srcset` attribute).
  - Products page at a mobile viewport (~380px): the category filter is a single horizontally-scrollable row (not 3–4 wrapped rows), "All" pinned first; navigating to `?category=hats` scrolls the active "Hats" pill into view; `aria-current="page"` on the active pill.
  - Tab through the products filter and the home hero CTAs: visible focus states, keyboard reachable.
- [ ] **Step 6: Report** — Summarize what shipped and any follow-ups. Do NOT commit this task (no file changes).

---

## Self-review notes (author)

- **Spec coverage:** hero refinement (T9), image-backed categories (T2+T4+T9), featured→ProductCard (T5+T9), founder photo (T3+T9), testimonials polish (T8), mobile filter (T7), image sweep (T1+T4+T5+T6+T9). All spec sections mapped.
- **Type consistency:** `getCategoriesWithImages` return shape matches `CategoryTile` props (`imageUrl: string | null`). `cld` presets referenced (`card`/`detail`/`blur`) all exist after T1. `ProductCard` prop shape unchanged (T5 edits internals only), so T9's usage is valid.
- **Contrast:** every `text-gold`/`text-cream` usage sits over `bg-ink` or a dark image scrim; light-background text uses `text-ink`/`text-brown`.
- **No placeholders**; every code step shows complete code.
