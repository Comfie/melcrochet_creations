# SEO Foundation + Product Experience Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Phase 1 (SEO foundation) and Phase 2 (product experience) of `docs/new_spec/melcrochet-improvement-spec.md` — unique per-page metadata, JSON-LD structured data, sitemap/robots, product photo galleries, colour/size selectors that feed the WhatsApp order message, and a Delivery/Payment/FAQ page.

**Architecture:** Server Components render `generateMetadata` per route and emit JSON-LD `<script>` tags server-side. Two new small client components (`ProductGallery`, `OrderViaWhatsApp`) handle interactivity on the product detail page. The `Product` model gains two nullable fields (`gallery`, `careInstructions`); everything else reuses the existing `isActive`/`priceType`/comma-separated `colours`/`sizes` shape rather than introducing a bigger schema migration.

**Tech Stack:** Next.js 16 App Router, TypeScript, Prisma 7 (`@prisma/adapter-pg`), Tailwind v4, Zod, Vitest + Testing Library (jsdom for interactive components, `renderToStaticMarkup` for server components), Cloudinary.

## Global Constraints

- No `any` — use `unknown` and narrow. (CLAUDE.md)
- No new UI component libraries — Tailwind + custom components matching the existing brand tokens (`bg-ink`, `text-cream`, `bg-gold`, `text-brown`, `border-taupe/*`, `font-display`, `font-sans`). Do NOT introduce generic Tailwind grays (`neutral-900` etc.) — this codebase has its own palette.
- Don't hard-delete rows — soft-delete via `isActive`. (CLAUDE.md)
- Route params, `searchParams` are `async` in Next 16 — always `await` them.
- Prisma client import: `import prisma from "@/lib/prisma"`.
- API routes use `jsonError`/`jsonValidationError` from `lib/api-response.ts` and `requireAuth` from `lib/auth.ts`.
- Zod schemas for all API input, co-located in `app/api/[resource]/schema.ts`.
- Commits: conventional commit format, no AI attribution lines. **Only commit when the user explicitly asks** — do not commit at the end of tasks.
- Tests run against a single shared real Postgres DB (`vitest.config.ts` sets `fileParallelism: false`) — no mocking Prisma, clean up any rows you create in `afterEach`.
- Interactive component tests need `// @vitest-environment jsdom` as the first line of the file, `import "@testing-library/jest-dom/vitest"`, and an explicit `afterEach(() => cleanup())` (project does not set `test.globals: true`).
- `app/layout.tsx` imports `next/font/google` — do not add a Vitest unit test that imports this file; verify it via `npx tsc --noEmit` and a manual dev-server check instead.
- Custom domain registration, Google Search Console, and Bing Webmaster Tools (spec §1.4, §1.3.2–3) are manual, non-code tasks for the site owner — **not** part of this plan. `SITE.url` stays pointed at `https://melcrochet-creations.vercel.app` until a custom domain exists; update it in one place (`lib/site.ts`) when that happens.
- Phase 3 (testimonials, related products, mobile category filter, WhatsApp FAB a11y — already fine in this codebase, image performance sweep, blog visibility) and Phase 4 (Vercel Analytics, WhatsApp click tracking, Instagram embed) are explicitly out of scope for this plan — do not add `@vercel/analytics` or click-tracking calls here.
- **Scoping deviations from the spec's example code, and why:**
  - `colours`/`sizes` stay as comma-separated text columns (no `{label, dimensions}[]` migration). Parsed into `string[]` at the display layer via `lib/product-variants.ts`. The implementation bundle's own README calls this out as an acceptable stopgap; a full structured-fields admin UI is bigger than this plan's P1 budget.
  - No admin-editable `seoTitle`/`seoDescription` overrides. The spec's own fallback template (first ~155 chars of description, or a generated fallback) fully satisfies the Phase 1 acceptance criteria without new schema/admin UI.
  - "Publish requires ≥1 image" is enforced against the existing `isActive` flag (there is no separate draft/published enum in this schema) — a product can only be `isActive: true` if it has `imageUrl` set.
  - `OrderViaWhatsApp` takes an explicit `productUrl` prop computed server-side from `SITE.url`, instead of reading `window.location.href` at click time — same result, but SSR-safe and unit-testable.

---

### Task 1: Site constants + price formatter

**Files:**
- Create: `lib/site.ts`
- Create: `lib/site.test.ts`
- Create: `lib/format-price.ts`
- Create: `lib/format-price.test.ts`

**Interfaces:**
- Produces: `SITE` object (`lib/site.ts`) with `name`, `shortName`, `url`, `description`, `email`, `whatsappNumber`, `whatsappDisplay`, `instagram`, `facebook`, `locality` — used by every later task that builds metadata, JSON-LD, or the sitemap.
- Produces: `formatPrice(priceType: "FIXED" | "QUOTE", price: unknown, currency?: string): string` — used by product cards, home page, product detail page, and metadata title generation.

- [ ] **Step 1: Write the failing tests**

```ts
// lib/site.test.ts
import { describe, it, expect } from "vitest";
import { SITE } from "./site";

describe("SITE", () => {
  it("exposes the production URL with no trailing slash", () => {
    expect(SITE.url).toBe("https://melcrochet-creations.vercel.app");
  });

  it("exposes the WhatsApp number in international format with no plus sign", () => {
    expect(SITE.whatsappNumber).toBe("27670590600");
  });

  it("exposes brand name and short name", () => {
    expect(SITE.name).toBe("MelCrochet Gifted Hands");
    expect(SITE.shortName).toBe("MelCrochet");
  });
});
```

```ts
// lib/format-price.test.ts
import { describe, it, expect } from "vitest";
import { formatPrice } from "./format-price";

describe("formatPrice", () => {
  it("formats a FIXED price with the ZAR symbol and no decimals", () => {
    expect(formatPrice("FIXED", 550, "ZAR")).toBe("R550");
  });

  it("does not insert thousands separators (matches existing product page formatting)", () => {
    expect(formatPrice("FIXED", 1600, "ZAR")).toBe("R1600");
  });

  it("returns 'Quote on Request' for QUOTE price type regardless of price value", () => {
    expect(formatPrice("QUOTE", null, "ZAR")).toBe("Quote on Request");
  });

  it("uses the raw currency code as the symbol when currency is not ZAR", () => {
    expect(formatPrice("FIXED", 100, "USD")).toBe("USD100");
  });

  it("accepts a Prisma Decimal-like value (has toString/valueOf)", () => {
    const decimalLike = { valueOf: () => "1200", toString: () => "1200" };
    expect(formatPrice("FIXED", decimalLike, "ZAR")).toBe("R1200");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/site.test.ts lib/format-price.test.ts`
Expected: FAIL — `Cannot find module './site'` / `'./format-price'`

- [ ] **Step 3: Write the implementation**

```ts
// lib/site.ts
/**
 * Single source of truth for absolute site URL and brand constants used by
 * metadata, JSON-LD, and the sitemap.
 *
 * ⚠️ Change `url` to the custom domain once it's live — everything else
 * (metadataBase, canonical URLs, JSON-LD, sitemap.xml) derives from this.
 */
export const SITE = {
  name: "MelCrochet Gifted Hands",
  shortName: "MelCrochet",
  url: "https://melcrochet-creations.vercel.app",
  description:
    "Handmade crochet blankets, bags, hats and gifts, made to order in South Africa. Order via WhatsApp.",
  email: "buchiemel@gmail.com",
  whatsappNumber: "27670590600",
  whatsappDisplay: "067 059 0600",
  instagram: "https://instagram.com/melz_crotchet_creations",
  facebook: "https://www.facebook.com/share/1BUMGQo84u/",
  locality: "Johannesburg",
} as const;
```

```ts
// lib/format-price.ts
/**
 * Formats a product price for display.
 * Matches the existing inline formatting used across ProductCard, the home
 * page, and the product detail page — no thousands separators, so this
 * centralizes the logic without changing what's on screen today.
 */
export function formatPrice(
  priceType: "FIXED" | "QUOTE",
  price: unknown,
  currency: string = "ZAR"
): string {
  if (priceType !== "FIXED" || price === null || price === undefined) {
    return "Quote on Request";
  }
  const symbol = currency === "ZAR" ? "R" : currency;
  return `${symbol}${price}`;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/site.test.ts lib/format-price.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/site.ts lib/site.test.ts lib/format-price.ts lib/format-price.test.ts
git commit -m "feat: add site constants and shared price formatter"
```

---

### Task 2: Image helpers — Cloudinary URL transforms + gallery type

**Files:**
- Create: `lib/cloudinary-url.ts`
- Create: `lib/cloudinary-url.test.ts`
- Create: `lib/product-gallery.ts`
- Create: `lib/product-gallery.test.ts`

**Interfaces:**
- Produces: `cld(url: string, preset: "card" | "thumb" | "detail" | "og"): string` and `IMG_SIZES` (`hero`, `card`, `detail`, `thumb`) — used by `ProductGallery`, the product detail page, JSON-LD image list, and OG image metadata.
- Produces: `ProductGalleryImage { url: string; publicId: string }` and `parseGallery(value: unknown): ProductGalleryImage[]` — used by the product detail page, the admin product form, and the product API route to safely read the Prisma `Json` `gallery` column.
- Note: this is a **new** file, distinct from the existing `lib/cloudinary.ts` (server-only upload/delete via the `cloudinary` SDK, which needs API secrets). `cld()` is pure string manipulation, safe to import from client components.

- [ ] **Step 1: Write the failing tests**

```ts
// lib/cloudinary-url.test.ts
import { describe, it, expect } from "vitest";
import { cld, IMG_SIZES } from "./cloudinary-url";

const SAMPLE = "https://res.cloudinary.com/demo/image/upload/v1699999999/products/abc123.jpg";

describe("cld", () => {
  it("injects the card transformation after /upload/", () => {
    expect(cld(SAMPLE, "card")).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,ar_1:1,w_600/v1699999999/products/abc123.jpg"
    );
  });

  it("injects the detail transformation", () => {
    expect(cld(SAMPLE, "detail")).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_1200/v1699999999/products/abc123.jpg"
    );
  });

  it("injects the og transformation", () => {
    expect(cld(SAMPLE, "og")).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,w_1200,h_630/v1699999999/products/abc123.jpg"
    );
  });

  it("replaces an existing transformation segment rather than stacking it", () => {
    const withTransform =
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_300/v1/products/abc.jpg";
    expect(cld(withTransform, "thumb")).toBe(
      "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,c_fill,ar_1:1,w_150/v1/products/abc.jpg"
    );
  });

  it("returns non-Cloudinary URLs unchanged", () => {
    expect(cld("https://example.com/photo.jpg", "card")).toBe("https://example.com/photo.jpg");
  });
});

describe("IMG_SIZES", () => {
  it("defines sizes attrs for hero, card, detail and thumb", () => {
    expect(IMG_SIZES.hero).toBe("100vw");
    expect(IMG_SIZES.card).toContain("50vw");
    expect(IMG_SIZES.detail).toContain("600px");
    expect(IMG_SIZES.thumb).toBe("80px");
  });
});
```

```ts
// lib/product-gallery.test.ts
import { describe, it, expect } from "vitest";
import { parseGallery } from "./product-gallery";

describe("parseGallery", () => {
  it("returns an empty array for null", () => {
    expect(parseGallery(null)).toEqual([]);
  });

  it("returns an empty array for undefined", () => {
    expect(parseGallery(undefined)).toEqual([]);
  });

  it("returns an empty array for non-array JSON values", () => {
    expect(parseGallery({ url: "x", publicId: "y" })).toEqual([]);
  });

  it("passes through well-formed entries", () => {
    const value = [{ url: "https://a", publicId: "p1" }, { url: "https://b", publicId: "p2" }];
    expect(parseGallery(value)).toEqual(value);
  });

  it("filters out malformed entries instead of throwing", () => {
    const value = [{ url: "https://a", publicId: "p1" }, { url: 5 }, "not-an-object", null];
    expect(parseGallery(value)).toEqual([{ url: "https://a", publicId: "p1" }]);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/cloudinary-url.test.ts lib/product-gallery.test.ts`
Expected: FAIL — modules not found

- [ ] **Step 3: Write the implementation**

```ts
// lib/cloudinary-url.ts
/**
 * Pure Cloudinary URL transformation helpers — no SDK, no secrets, safe to
 * import from client components. `imageUrl`/`gallery[].url` are always full
 * secure_url strings from the upload API (see lib/cloudinary.ts), so this
 * only needs to inject a transformation segment after "/upload/".
 */
type Preset = "card" | "thumb" | "detail" | "og";

const PRESETS: Record<Preset, string> = {
  card: "f_auto,q_auto,c_fill,ar_1:1,w_600",
  thumb: "f_auto,q_auto,c_fill,ar_1:1,w_150",
  detail: "f_auto,q_auto,w_1200",
  og: "f_auto,q_auto,c_fill,w_1200,h_630",
};

export function cld(url: string, preset: Preset): string {
  if (!url.includes("/upload/")) return url;
  return url.replace(/\/upload\/(?:[^/]+\/)?/, `/upload/${PRESETS[preset]}/`);
}

export const IMG_SIZES = {
  hero: "100vw",
  card: "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px",
  detail: "(max-width: 768px) 100vw, 600px",
  thumb: "80px",
} as const;
```

```ts
// lib/product-gallery.ts
export interface ProductGalleryImage {
  url: string;
  publicId: string;
}

/** Safely narrows a Prisma `Json` column value to ProductGalleryImage[]. */
export function parseGallery(value: unknown): ProductGalleryImage[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is ProductGalleryImage => {
    if (typeof item !== "object" || item === null) return false;
    const candidate = item as Record<string, unknown>;
    return typeof candidate.url === "string" && typeof candidate.publicId === "string";
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/cloudinary-url.test.ts lib/product-gallery.test.ts`
Expected: PASS (10 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/cloudinary-url.ts lib/cloudinary-url.test.ts lib/product-gallery.ts lib/product-gallery.test.ts
git commit -m "feat: add Cloudinary URL transform and product gallery parsing helpers"
```

---

### Task 3: Product variant parsing + WhatsApp order message

**Files:**
- Create: `lib/product-variants.ts`
- Create: `lib/product-variants.test.ts`
- Modify: `lib/whatsapp.ts`
- Modify: `lib/whatsapp.test.ts`

**Interfaces:**
- Produces: `parseVariantList(raw: string | null | undefined): string[]` — splits the existing comma-separated `colours`/`sizes` text columns into arrays. Used by the product detail page and `OrderViaWhatsApp`.
- Produces: `buildOrderMessage(opts: { productName: string; productUrl: string; colour?: string | null; size?: string | null }): string` — added to `lib/whatsapp.ts`. Used by `OrderViaWhatsApp` together with the existing `buildWhatsAppLink(message)`.
- Consumes: nothing new (existing `buildWhatsAppLink` stays as-is).

- [ ] **Step 1: Write the failing tests**

```ts
// lib/product-variants.test.ts
import { describe, it, expect } from "vitest";
import { parseVariantList } from "./product-variants";

describe("parseVariantList", () => {
  it("splits a comma-separated string and trims whitespace", () => {
    expect(parseVariantList("Cream, Sage Green,  Charcoal")).toEqual([
      "Cream",
      "Sage Green",
      "Charcoal",
    ]);
  });

  it("returns an empty array for null", () => {
    expect(parseVariantList(null)).toEqual([]);
  });

  it("returns an empty array for undefined", () => {
    expect(parseVariantList(undefined)).toEqual([]);
  });

  it("returns an empty array for an empty string", () => {
    expect(parseVariantList("")).toEqual([]);
  });

  it("drops empty entries from trailing/double commas", () => {
    expect(parseVariantList("Cream,, Sage,")).toEqual(["Cream", "Sage"]);
  });
});
```

Add to the existing `lib/whatsapp.test.ts` (append, do not remove existing tests):

```ts
import { buildOrderMessage } from "./whatsapp";

describe("buildOrderMessage", () => {
  it("includes the product name, size, colour and URL when all are given", () => {
    const message = buildOrderMessage({
      productName: "Lap Throw Blanket",
      productUrl: "https://melcrochet-creations.vercel.app/products/lap-throw-blanket",
      colour: "Sage Green",
      size: "80x100cm",
    });
    expect(message).toBe(
      "Hi MelCrochet! I'd like to order the Lap Throw Blanket.\n" +
        "Size: 80x100cm\n" +
        "Colour: Sage Green\n" +
        "https://melcrochet-creations.vercel.app/products/lap-throw-blanket"
    );
  });

  it("omits size and colour lines when not selected", () => {
    const message = buildOrderMessage({
      productName: "Scrunchie",
      productUrl: "https://melcrochet-creations.vercel.app/products/scrunchie",
      colour: null,
      size: null,
    });
    expect(message).toBe(
      "Hi MelCrochet! I'd like to order the Scrunchie.\n" +
        "https://melcrochet-creations.vercel.app/products/scrunchie"
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/product-variants.test.ts lib/whatsapp.test.ts`
Expected: FAIL — `parseVariantList` / `buildOrderMessage` not found

- [ ] **Step 3: Write the implementation**

```ts
// lib/product-variants.ts
/** Parses the comma-separated `colours`/`sizes` text columns into a list. */
export function parseVariantList(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
}
```

Append to `lib/whatsapp.ts` (keep the existing `WHATSAPP_NUMBER`, `DEFAULT_MESSAGE`, `buildWhatsAppLink`, `buildProductWhatsAppLink` exactly as they are):

```ts
interface OrderMessageOptions {
  productName: string;
  productUrl: string;
  colour?: string | null;
  size?: string | null;
}

/**
 * Builds the pre-filled WhatsApp message for the product detail page's
 * colour/size selector. Including the product URL means Mel always knows
 * exactly which item is being asked about, even if the customer edits the
 * message text before sending.
 */
export function buildOrderMessage({
  productName,
  productUrl,
  colour,
  size,
}: OrderMessageOptions): string {
  return [
    `Hi MelCrochet! I'd like to order the ${productName}.`,
    size ? `Size: ${size}` : null,
    colour ? `Colour: ${colour}` : null,
    productUrl,
  ]
    .filter(Boolean)
    .join("\n");
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/product-variants.test.ts lib/whatsapp.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/product-variants.ts lib/product-variants.test.ts lib/whatsapp.ts lib/whatsapp.test.ts
git commit -m "feat: parse comma-separated product variants and build WhatsApp order messages"
```

---

### Task 4: Prisma schema — add `gallery` and `careInstructions` to Product

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_add_product_gallery_and_care_instructions/migration.sql` (generated)

**Interfaces:**
- Produces: `Product.gallery Json?` (array of `{ url, publicId }`, max 6 enforced at the API layer, not the DB) and `Product.careInstructions String?` — consumed by Task 5 (API), Task 12 (product detail page), Task 14 (admin form).

- [ ] **Step 1: Edit the schema**

In `prisma/schema.prisma`, inside `model Product`, add two fields after `leadTime`:

```prisma
model Product {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique
  description   String
  priceType     PriceType @default(QUOTE)
  price         Decimal?  @db.Decimal(10, 2)
  currency      String    @default("ZAR")
  sizes         String?
  colours       String?
  leadTime      String?
  careInstructions String?
  imageUrl      String?
  imagePublicId String?
  gallery       Json?
  featured      Boolean   @default(false)
  isActive      Boolean   @default(true)
  sortOrder     Int       @default(0)
  categoryId    String
  category      Category  @relation(fields: [categoryId], references: [id])
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([categoryId])
}
```

- [ ] **Step 2: Generate and apply the migration**

Run: `npx prisma migrate dev --name add_product_gallery_and_care_instructions`
Expected: Prisma prints `Applying migration ...` then `Your database is now in sync with your schema.` and a new folder appears under `prisma/migrations/`.

- [ ] **Step 3: Verify the generated Prisma client has the new fields**

Run: `npx tsc --noEmit`
Expected: no new type errors (existing code doesn't reference `gallery`/`careInstructions` yet, so this should be clean)

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: add gallery and careInstructions fields to Product"
```

---

### Task 5: Product API — gallery, careInstructions, publish-requires-image

**Files:**
- Modify: `app/api/products/schema.ts`
- Modify: `app/api/products/[id]/route.ts`
- Modify: `app/api/products/route.test.ts`
- Modify: `app/api/products/[id]/route.test.ts`

**Interfaces:**
- Consumes: `parseGallery` is NOT used here (the route trusts already-validated Zod output); `ProductGalleryImage` type from `lib/product-gallery.ts`.
- Produces: `productInputSchema`/`productUpdateSchema` now accept `gallery: { url, publicId }[]` (max 6) and `careInstructions: string` (max 2000). Create requests are rejected with a 400 on `imageUrl` unless the caller explicitly sets `isActive: false`. Update requests are rejected with a 400 if the *resulting* product (existing + patch) would be active with no image.

- [ ] **Step 1: Write the failing tests**

Append to `app/api/products/route.test.ts` (inside the existing `describe("POST /api/products", ...)` block, after the last `it`):

```ts
  it("rejects an active product with no image", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Vitest Tmp No Image",
        description: "no image, defaults to active",
        priceType: "QUOTE",
        categoryId,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("allows an imageless product when explicitly saved as inactive (draft)", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Vitest Tmp Draft",
        description: "draft product, no image yet",
        priceType: "QUOTE",
        categoryId,
        isActive: false,
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    createdProductIds.push(body.id);
  });

  it("accepts a gallery array and careInstructions", async () => {
    const { POST } = await import("./route");
    const req = new NextRequest("http://localhost:3000/api/products", {
      method: "POST",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Vitest Tmp Gallery Product",
        description: "has a gallery",
        priceType: "QUOTE",
        categoryId,
        imageUrl: "https://res.cloudinary.com/demo/image/upload/v1/products/main.jpg",
        gallery: [
          { url: "https://res.cloudinary.com/demo/image/upload/v1/products/a.jpg", publicId: "products/a" },
        ],
        careInstructions: "Hand wash cold, dry flat.",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
    const body = await res.json();
    createdProductIds.push(body.id);
    expect(body.gallery).toEqual([
      { url: "https://res.cloudinary.com/demo/image/upload/v1/products/a.jpg", publicId: "products/a" },
    ]);
    expect(body.careInstructions).toBe("Hand wash cold, dry flat.");
  });
```

Append to `app/api/products/[id]/route.test.ts`. The file already has a `beforeEach` that creates a fresh `productId` fixture *with* an image (`imageUrl`/`imagePublicId` set), a `categoryId` fixture, an `authCookie()` helper, and mocks `deleteImage` from `@/lib/cloudinary` via `vi.mock` — reuse all of these rather than re-creating them:

```ts
describe("PATCH /api/products/[id] — publish requires an image", () => {
  it("rejects setting isActive: true on a product with no image", async () => {
    const name = `Vitest Tmp Imageless ${Date.now()}`;
    const imagelessProduct = await prisma.product.create({
      data: {
        name,
        slug: slugify(name),
        description: "no image yet",
        priceType: "QUOTE",
        categoryId,
        isActive: false,
      },
    });

    const { PATCH } = await import("./route");
    const req = new NextRequest(`http://localhost:3000/api/products/${imagelessProduct.id}`, {
      method: "PATCH",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: true }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: imagelessProduct.id }) });
    expect(res.status).toBe(400);

    await prisma.product.delete({ where: { id: imagelessProduct.id } });
  });

  it("deletes removed Cloudinary gallery images on update", async () => {
    const { deleteImage } = await import("@/lib/cloudinary");
    await prisma.product.update({
      where: { id: productId },
      data: {
        gallery: [
          { url: "https://res.cloudinary.com/demo/image/upload/v1/g1.jpg", publicId: "melcrochet/g1" },
          { url: "https://res.cloudinary.com/demo/image/upload/v1/g2.jpg", publicId: "melcrochet/g2" },
        ],
      },
    });

    const { PATCH } = await import("./route");
    const req = new NextRequest(`http://localhost:3000/api/products/${productId}`, {
      method: "PATCH",
      headers: { Cookie: await authCookie(), "Content-Type": "application/json" },
      body: JSON.stringify({
        gallery: [
          { url: "https://res.cloudinary.com/demo/image/upload/v1/g1.jpg", publicId: "melcrochet/g1" },
        ],
      }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: productId }) });
    expect(res.status).toBe(200);
    expect(deleteImage).toHaveBeenCalledWith("melcrochet/g2");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run app/api/products/route.test.ts "app/api/products/[id]/route.test.ts"`
Expected: FAIL — new assertions fail (400 not returned, `gallery`/`careInstructions` undefined on the response body)

- [ ] **Step 3: Update the schema**

In `app/api/products/schema.ts`, add `gallery` and `careInstructions` to both object shapes, and add the publish-requires-image refine to `productInputSchema`:

```ts
import { z } from "zod";

const galleryImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().min(1),
});

export const productInputSchema = z
  .object({
    name: z.string().min(1).max(200),
    description: z.string().min(1),
    priceType: z.enum(["FIXED", "QUOTE"]),
    price: z.number().positive().nullable().optional(),
    currency: z.string().min(1).max(10).optional(),
    sizes: z.string().max(300).optional(),
    colours: z.string().max(300).optional(),
    leadTime: z.string().max(200).optional(),
    careInstructions: z.string().max(2000).optional(),
    imageUrl: z.string().url().optional(),
    imagePublicId: z.string().optional(),
    gallery: z.array(galleryImageSchema).max(6).optional(),
    featured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    categoryId: z.string().min(1),
  })
  .refine(
    (data) => data.priceType !== "FIXED" || (data.price !== null && data.price !== undefined),
    { message: "price is required when priceType is FIXED", path: ["price"] }
  )
  .refine((data) => data.isActive === false || !!data.imageUrl, {
    message: "Add at least one image before publishing this product (or save it as inactive/draft)",
    path: ["imageUrl"],
  });

// PATCH allows partial updates; the FIXED/price relationship is still worth
// keeping easy to check, so this mirrors the create schema's field set but
// makes every field optional (including priceType/price together).
// The "publish requires image" check needs the existing DB row (a PATCH may
// only touch an unrelated field), so it lives in the route handler instead
// of here — see app/api/products/[id]/route.ts.
export const productUpdateSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    priceType: z.enum(["FIXED", "QUOTE"]).optional(),
    price: z.number().positive().nullable().optional(),
    currency: z.string().min(1).max(10).optional(),
    sizes: z.string().max(300).optional(),
    colours: z.string().max(300).optional(),
    leadTime: z.string().max(200).optional(),
    careInstructions: z.string().max(2000).optional(),
    imageUrl: z.string().url().optional(),
    imagePublicId: z.string().optional(),
    gallery: z.array(galleryImageSchema).max(6).optional(),
    featured: z.boolean().optional(),
    isActive: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
    categoryId: z.string().min(1).optional(),
  })
  .refine(
    (data) => data.priceType !== "FIXED" || data.price !== null,
    { message: "price cannot be null when priceType is FIXED", path: ["price"] }
  );
```

- [ ] **Step 4: Update the PATCH route**

In `app/api/products/[id]/route.ts`, add the cross-field publish check and gallery cleanup. Replace the `PATCH` function:

```ts
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const unauthorized = await requireAuth(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) return jsonValidationError(parsed.error.issues);

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) return jsonError("Product not found", 404);

  const effectiveIsActive = parsed.data.isActive ?? existing.isActive;
  const effectiveImageUrl =
    parsed.data.imageUrl !== undefined ? parsed.data.imageUrl : existing.imageUrl;
  if (effectiveIsActive && !effectiveImageUrl) {
    return jsonError(
      "Add at least one image before making this product active",
      400
    );
  }

  const imageIsReplaced =
    parsed.data.imagePublicId !== undefined &&
    parsed.data.imagePublicId !== existing.imagePublicId &&
    existing.imagePublicId;

  const existingGallery = parseGallery(existing.gallery);
  const removedGalleryPublicIds =
    parsed.data.gallery !== undefined
      ? existingGallery
          .filter((img) => !parsed.data.gallery!.some((next) => next.publicId === img.publicId))
          .map((img) => img.publicId)
      : [];

  let product;
  try {
    product = await prisma.product.update({
      where: { id },
      data: parsed.data,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003") {
      return jsonError("Category does not exist", 400);
    }
    throw error;
  }

  if (imageIsReplaced && existing.imagePublicId) {
    await deleteImage(existing.imagePublicId).catch(() => {});
  }
  for (const publicId of removedGalleryPublicIds) {
    await deleteImage(publicId).catch(() => {});
  }

  return NextResponse.json(product);
}
```

Add the import at the top of the file:

```ts
import { parseGallery } from "@/lib/product-gallery";
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run app/api/products/route.test.ts "app/api/products/[id]/route.test.ts"`
Expected: PASS

- [ ] **Step 6: Run the full test suite to check for regressions**

Run: `npm test`
Expected: PASS — all existing tests still green

- [ ] **Step 7: Commit**

```bash
git add app/api/products/schema.ts "app/api/products/[id]/route.ts" app/api/products/route.test.ts "app/api/products/[id]/route.test.ts"
git commit -m "feat: validate product gallery, care instructions, and publish-requires-image"
```

---

### Task 6: JSON-LD components

**Files:**
- Create: `components/seo/JsonLd.tsx`
- Create: `components/seo/JsonLd.test.tsx`

**Interfaces:**
- Consumes: `SITE` from `lib/site.ts`.
- Produces: `ProductJsonLd(props: { name, description, slug, images: string[], priceType: "FIXED" | "QUOTE", price: number | null })`, `LocalBusinessJsonLd()`, `FaqJsonLd({ items: FaqItem[] })` and the `FaqItem` type — consumed by Task 12 (product page) and Task 16 (FAQ page), and `LocalBusinessJsonLd` by Task 7 (home page).

- [ ] **Step 1: Write the failing tests**

```tsx
// components/seo/JsonLd.test.tsx
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductJsonLd, LocalBusinessJsonLd, FaqJsonLd } from "./JsonLd";

function extractJson(html: string): unknown {
  const match = html.match(/<script[^>]*>(.*)<\/script>/s);
  if (!match) throw new Error("no <script> tag found in rendered output");
  return JSON.parse(match[1]);
}

describe("ProductJsonLd", () => {
  it("includes an Offer for a FIXED price product", () => {
    const html = renderToStaticMarkup(
      <ProductJsonLd
        name="Lap Throw Blanket"
        description="A cosy lap throw."
        slug="lap-throw-blanket"
        images={["https://res.cloudinary.com/demo/image/upload/f_auto/v1/a.jpg"]}
        priceType="FIXED"
        price={650}
      />
    );
    const data = extractJson(html) as Record<string, unknown>;
    expect(data["@type"]).toBe("Product");
    expect(data.name).toBe("Lap Throw Blanket");
    const offers = data.offers as Record<string, unknown>;
    expect(offers.price).toBe(650);
    expect(offers.priceCurrency).toBe("ZAR");
  });

  it("omits the Offer for a QUOTE price product", () => {
    const html = renderToStaticMarkup(
      <ProductJsonLd
        name="Custom Gift Set"
        description="Made to order."
        slug="custom-gift-set"
        images={[]}
        priceType="QUOTE"
        price={null}
      />
    );
    const data = extractJson(html) as Record<string, unknown>;
    expect(data.offers).toBeUndefined();
  });
});

describe("LocalBusinessJsonLd", () => {
  it("renders LocalBusiness with brand contact details", () => {
    const html = renderToStaticMarkup(<LocalBusinessJsonLd />);
    const data = extractJson(html) as Record<string, unknown>;
    expect(data["@type"]).toBe("LocalBusiness");
    expect(data.name).toBe("MelCrochet Gifted Hands");
    expect(data.telephone).toBe("+27670590600");
  });
});

describe("FaqJsonLd", () => {
  it("renders one Question entity per FAQ item", () => {
    const html = renderToStaticMarkup(
      <FaqJsonLd
        items={[
          { question: "How long does delivery take?", answer: "3-5 business days." },
          { question: "Do you accept returns?", answer: "Only for defects." },
        ]}
      />
    );
    const data = extractJson(html) as { mainEntity: { name: string }[] };
    expect(data.mainEntity).toHaveLength(2);
    expect(data.mainEntity[0].name).toBe("How long does delivery take?");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/seo/JsonLd.test.tsx`
Expected: FAIL — `Cannot find module './JsonLd'`

- [ ] **Step 3: Write the implementation**

```tsx
// components/seo/JsonLd.tsx
/**
 * Server components — render inline where relevant:
 *   <ProductJsonLd .../>     on the product detail page
 *   <LocalBusinessJsonLd />  on the home page
 *   <FaqJsonLd items={...}/> on the FAQ page
 * Validate with https://search.google.com/test/rich-results after deploying.
 */
import { SITE } from "@/lib/site";

function JsonLdScript({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify of our own trusted data — no user HTML involved.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

interface ProductJsonLdProps {
  name: string;
  description: string;
  slug: string;
  images: string[];
  priceType: "FIXED" | "QUOTE";
  price: number | null;
}

export function ProductJsonLd({
  name,
  description,
  slug,
  images,
  priceType,
  price,
}: ProductJsonLdProps) {
  const url = `${SITE.url}/products/${slug}`;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: images,
    brand: { "@type": "Brand", name: SITE.name },
    url,
  };

  // Omit Offer entirely for "Quote on Request" items — a priceless Offer
  // fails Rich Results validation.
  if (priceType === "FIXED" && price !== null) {
    data.offers = {
      "@type": "Offer",
      priceCurrency: "ZAR",
      price,
      availability: "https://schema.org/MadeToOrder",
      url,
    };
  }

  return <JsonLdScript data={data} />;
}

export function LocalBusinessJsonLd() {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: SITE.name,
        url: SITE.url,
        email: SITE.email,
        telephone: `+${SITE.whatsappNumber}`,
        address: {
          "@type": "PostalAddress",
          addressLocality: SITE.locality,
          addressCountry: "ZA",
        },
        sameAs: [SITE.instagram, SITE.facebook],
      }}
    />
  );
}

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  return (
    <JsonLdScript
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((f) => ({
          "@type": "Question",
          name: f.question,
          acceptedAnswer: { "@type": "Answer", text: f.answer },
        })),
      }}
    />
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/seo/JsonLd.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add components/seo/JsonLd.tsx components/seo/JsonLd.test.tsx
git commit -m "feat: add Product, LocalBusiness and FAQ JSON-LD components"
```

---

### Task 7: Root layout metadata + home page LocalBusiness JSON-LD

**Files:**
- Modify: `app/layout.tsx`
- Modify: `app/(site)/page.tsx`

**Interfaces:**
- Consumes: `SITE` from `lib/site.ts` (Task 1), `LocalBusinessJsonLd` from `components/seo/JsonLd.tsx` (Task 6), `formatPrice` from `lib/format-price.ts` (Task 1).
- No automated test for `app/layout.tsx` — it imports `next/font/google`, which vitest can't resolve outside the Next build pipeline. Verify manually in Step 3.

- [ ] **Step 1: Update the root layout**

Replace `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} | Handmade Crochet Blankets, Bags & Gifts in South Africa`,
    template: `%s | ${SITE.shortName}`,
  },
  description: SITE.description,
  openGraph: {
    siteName: SITE.name,
    type: "website",
    locale: "en_ZA",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Add LocalBusiness JSON-LD and the formatPrice helper to the home page**

In `app/(site)/page.tsx`, add two imports alongside the existing ones:

```tsx
import { LocalBusinessJsonLd } from "@/components/seo/JsonLd";
import { formatPrice } from "@/lib/format-price";
```

Change the start of the returned JSX from:

```tsx
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-cream">
```

to:

```tsx
  return (
    <>
      <LocalBusinessJsonLd />

      {/* Hero */}
      <section className="relative overflow-hidden bg-ink text-cream">
```

In the "Featured pieces" section, replace:

```tsx
                    <p className="mt-1 font-sans text-sm text-cream/60">
                      {product.priceType === "FIXED" ? `R${product.price}` : "Quote on Request"}
                    </p>
```

with:

```tsx
                    <p className="mt-1 font-sans text-sm text-cream/60">
                      {formatPrice(product.priceType, product.price, product.currency)}
                    </p>
```

- [ ] **Step 3: Verify manually**

Run: `npx tsc --noEmit`
Expected: no errors

Run: `npm run dev` (in one terminal), then in another:
Run: `curl -s http://localhost:3000/ | grep -o '<title>[^<]*</title>'`
Expected: `<title>MelCrochet Gifted Hands | Handmade Crochet Blankets, Bags &amp; Gifts in South Africa</title>`

Run: `curl -s http://localhost:3000/ | grep -o 'application/ld+json'`
Expected: at least one match (the `LocalBusiness` script tag)

Stop the dev server (Ctrl-C) when done.

- [ ] **Step 4: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add app/layout.tsx "app/(site)/page.tsx"
git commit -m "feat: add site-wide metadata template and LocalBusiness JSON-LD to home page"
```

---

### Task 8: Products index page metadata

**Files:**
- Modify: `lib/queries.ts`
- Modify: `lib/queries.test.ts`
- Modify: `app/(site)/products/page.tsx`
- Create: `app/(site)/products/page.test.ts`

**Interfaces:**
- Produces: `getCategoryBySlug(slug: string)` added to `lib/queries.ts`.
- Produces: `generateMetadata` on the products index page — dynamic (reads `searchParams`), per the spec's documented category-metadata caveat (query-param routes can't get unique *static* metadata).

- [ ] **Step 1: Write the failing tests**

Append to `lib/queries.test.ts`:

```ts
import { getCategoryBySlug } from "./queries";

describe("getCategoryBySlug", () => {
  it("finds the Hats category by slug", async () => {
    const category = await getCategoryBySlug("hats");
    expect(category?.name).toBe("Hats");
  });

  it("returns null for an unknown slug", async () => {
    const category = await getCategoryBySlug("does-not-exist-xyz");
    expect(category).toBeNull();
  });
});
```

Create `app/(site)/products/page.test.ts`:

```ts
import "dotenv/config";
import { describe, it, expect } from "vitest";
import { generateMetadata } from "./page";

describe("products index generateMetadata", () => {
  it("uses a generic title/description with no category filter", async () => {
    const metadata = await generateMetadata({ searchParams: Promise.resolve({}) });
    expect(metadata.title).toBe("Shop Handmade Crochet Products");
    expect(metadata.alternates).toEqual({ canonical: "/products" });
  });

  it("uses a category-specific title when a known category slug is given", async () => {
    const metadata = await generateMetadata({ searchParams: Promise.resolve({ category: "hats" }) });
    expect(metadata.title).toBe("Handmade Hats");
    expect(metadata.alternates).toEqual({ canonical: "/products?category=hats" });
  });

  it("falls back to the raw slug when the category is unknown", async () => {
    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ category: "does-not-exist-xyz" }),
    });
    expect(metadata.title).toBe("Handmade does-not-exist-xyz");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/queries.test.ts "app/(site)/products/page.test.ts"`
Expected: FAIL — `getCategoryBySlug` and `generateMetadata` not exported

- [ ] **Step 3: Add `getCategoryBySlug`**

Append to `lib/queries.ts`:

```ts
export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}
```

- [ ] **Step 4: Add `generateMetadata` to the products page**

Replace `app/(site)/products/page.tsx`:

```tsx
import type { Metadata } from "next";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/queries";
import CategoryFilter from "@/components/CategoryFilter";
import ProductCard from "@/components/ProductCard";

export const revalidate = 60;

type Props = {
  searchParams: Promise<{ category?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category } = await searchParams;

  if (!category) {
    return {
      title: "Shop Handmade Crochet Products",
      description:
        "Browse handmade crochet blankets, bags, hats, baskets and gifts — made to order in South Africa. Order via WhatsApp.",
      alternates: { canonical: "/products" },
    };
  }

  const categoryRecord = await getCategoryBySlug(category);
  const label = categoryRecord?.name ?? category;

  return {
    title: `Handmade ${label}`,
    description: `Shop handmade ${label.toLowerCase()} from MelCrochet Gifted Hands — made to order in South Africa. Order via WhatsApp.`,
    alternates: { canonical: `/products?category=${category}` },
  };
}

export default async function ProductsPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({ categorySlug: category }),
  ]);

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <h1 className="text-display">Our Products</h1>
        <p className="mt-3 max-w-2xl font-sans text-ink/70">
          Every piece is made to order by hand. Prices shown are per item — reach
          out on WhatsApp for custom sizes, colours, or bulk orders.
        </p>

        <div className="mt-8">
          <CategoryFilter categories={categories} activeSlug={category} />
        </div>

        {products.length === 0 ? (
          <p className="mt-16 font-sans text-ink/70">
            No products in this category yet — message us on WhatsApp, we&apos;re
            happy to take a custom order.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run lib/queries.test.ts "app/(site)/products/page.test.ts"`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add lib/queries.ts lib/queries.test.ts "app/(site)/products/page.tsx" "app/(site)/products/page.test.ts"
git commit -m "feat: unique per-category metadata on the products index page"
```

---

### Task 9: About, Contact, Blog index and Blog post metadata

**Files:**
- Modify: `app/(site)/about/page.tsx`
- Create: `app/(site)/about/page.test.ts`
- Modify: `app/(site)/contact/page.tsx`
- Create: `app/(site)/contact/page.test.ts`
- Modify: `app/(site)/blog/page.tsx`
- Create: `app/(site)/blog/page.test.ts`
- Modify: `app/(site)/blog/[slug]/page.tsx`
- Create: `app/(site)/blog/[slug]/page.test.ts`

**Interfaces:**
- Consumes: `getBlogPostBySlug` (already in `lib/queries.ts`).
- No new shared interfaces — each page exports either a static `metadata` object or a `generateMetadata` function per Next.js convention.

- [ ] **Step 1: Write the failing tests**

```ts
// app/(site)/about/page.test.ts
import { describe, it, expect } from "vitest";
import { metadata } from "./page";

describe("about page metadata", () => {
  it("has a unique title and description", () => {
    expect(metadata.title).toBe("About MelCrochet Gifted Hands");
    expect(metadata.description).toContain("Melissa");
  });
});
```

```ts
// app/(site)/contact/page.test.ts
import { describe, it, expect } from "vitest";
import { metadata } from "./page";

describe("contact page metadata", () => {
  it("has a unique title and description", () => {
    expect(metadata.title).toBe("Contact Us");
    expect(metadata.description).toContain("WhatsApp");
  });
});
```

```ts
// app/(site)/blog/page.test.ts
import { describe, it, expect } from "vitest";
import { metadata } from "./page";

describe("blog index metadata", () => {
  it("has a unique title and description", () => {
    expect(metadata.title).toBe("Blog");
    expect(metadata.description).toContain("crochet");
  });
});
```

```ts
// app/(site)/blog/[slug]/page.test.ts
import "dotenv/config";
import { describe, it, expect } from "vitest";
import { generateMetadata } from "./page";

describe("blog post generateMetadata", () => {
  it("returns 'Post not found' for an unknown slug", async () => {
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "does-not-exist-xyz" }) });
    expect(metadata.title).toBe("Post not found");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run "app/(site)/about/page.test.ts" "app/(site)/contact/page.test.ts" "app/(site)/blog/page.test.ts" "app/(site)/blog/[slug]/page.test.ts"`
Expected: FAIL — no `metadata`/`generateMetadata` export yet

- [ ] **Step 3: Add metadata to each page**

In `app/(site)/about/page.tsx`, add near the top (after existing imports):

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About MelCrochet Gifted Hands",
  description:
    "Meet Melissa Ruvimbo Buchirai, founder of MelCrochet Gifted Hands — handmade crochet blankets, bags and gifts crafted with patience and care in South Africa.",
};
```

In `app/(site)/contact/page.tsx`, add:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Message MelCrochet Gifted Hands on WhatsApp or by email to order handmade crochet blankets, bags, hats and gifts, or ask about custom orders.",
};
```

In `app/(site)/blog/page.tsx`, add:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Crochet care tips, size guides and behind-the-scenes stories from MelCrochet Gifted Hands.",
};
```

In `app/(site)/blog/[slug]/page.tsx`, add a `generateMetadata` export above the default export:

```tsx
import type { Metadata } from "next";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: "article",
      url: `/blog/${slug}`,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : undefined,
    },
  };
}
```

(The default export already declares its own inline `{ params }: { params: Promise<{ slug: string }> }` type — leave that as-is, or switch it to reuse the new `Props` type for consistency; either works since the shape is identical.)

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run "app/(site)/about/page.test.ts" "app/(site)/contact/page.test.ts" "app/(site)/blog/page.test.ts" "app/(site)/blog/[slug]/page.test.ts"`
Expected: PASS

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add "app/(site)/about/page.tsx" "app/(site)/about/page.test.ts" "app/(site)/contact/page.tsx" "app/(site)/contact/page.test.ts" "app/(site)/blog/page.tsx" "app/(site)/blog/page.test.ts" "app/(site)/blog/[slug]/page.tsx" "app/(site)/blog/[slug]/page.test.ts"
git commit -m "feat: unique metadata for about, contact, blog index and blog post pages"
```

---

### Task 10: ProductGallery component

**Files:**
- Create: `components/product/ProductGallery.tsx`
- Create: `components/product/ProductGallery.test.tsx`

**Interfaces:**
- Consumes: `cld`, `IMG_SIZES` from `lib/cloudinary-url.ts` (Task 2), `ImagePlaceholder` (existing).
- Produces: `ProductGallery({ images: { url: string; alt: string }[] })` — a client component rendering a main image, a thumbnail strip (when >1 image), and a `<dialog>` lightbox. Consumed by Task 12 (product detail page).

- [ ] **Step 1: Write the failing test**

```tsx
// components/product/ProductGallery.test.tsx
// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductGallery } from "./ProductGallery";

beforeAll(() => {
  // jsdom doesn't implement <dialog>'s imperative API.
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute("open", "");
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute("open");
  });
});

afterEach(() => {
  cleanup();
});

const images = [
  { url: "https://res.cloudinary.com/demo/image/upload/v1/a.jpg", alt: "Lap Throw Blanket" },
  { url: "https://res.cloudinary.com/demo/image/upload/v1/b.jpg", alt: "Lap Throw Blanket photo 2" },
];

describe("ProductGallery", () => {
  it("renders a branded placeholder when there are no images", () => {
    render(<ProductGallery images={[]} />);
    expect(screen.getByRole("img", { name: /photo coming soon/i })).toBeInTheDocument();
  });

  it("does not render a thumbnail strip for a single image", () => {
    render(<ProductGallery images={[images[0]]} />);
    expect(screen.queryByLabelText("More photos")).not.toBeInTheDocument();
  });

  it("swaps the main image when a thumbnail is clicked", async () => {
    const user = userEvent.setup();
    render(<ProductGallery images={images} />);

    const beforeButton = screen.getByRole("button", { name: /view larger photo of lap throw blanket$/i });
    expect(beforeButton).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /show photo 2 of 2/i }));

    expect(
      screen.getByRole("button", { name: /view larger photo of lap throw blanket photo 2/i })
    ).toBeInTheDocument();
  });

  it("opens the lightbox dialog when the main image is clicked", async () => {
    const user = userEvent.setup();
    render(<ProductGallery images={images} />);

    await user.click(screen.getByRole("button", { name: /view larger photo of lap throw blanket$/i }));

    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/product/ProductGallery.test.tsx`
Expected: FAIL — `Cannot find module './ProductGallery'`

- [ ] **Step 3: Write the implementation**

```tsx
// components/product/ProductGallery.tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { cld, IMG_SIZES } from "@/lib/cloudinary-url";
import ImagePlaceholder from "@/components/ImagePlaceholder";

export interface GalleryImage {
  url: string;
  alt: string;
}

export function ProductGallery({ images }: { images: GalleryImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);

  if (images.length === 0) {
    return <ImagePlaceholder className="aspect-square w-full" />;
  }

  const active = images[activeIndex];

  return (
    <div>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label={`View larger photo of ${active.alt}`}
        className="block w-full"
      >
        <Image
          src={cld(active.url, "detail")}
          alt={active.alt}
          width={1200}
          height={1200}
          sizes={IMG_SIZES.detail}
          priority
          className="aspect-square w-full rounded-lg object-cover"
        />
      </button>

      {images.length > 1 && (
        <ul className="mt-3 flex gap-2" aria-label="More photos">
          {images.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-current={i === activeIndex ? "true" : undefined}
                aria-label={`Show photo ${i + 1} of ${images.length}`}
                className={`block h-16 w-16 overflow-hidden rounded border transition-colors ${
                  i === activeIndex ? "border-ink" : "border-taupe/30 hover:border-ink"
                }`}
              >
                <Image
                  src={cld(img.url, "thumb")}
                  alt=""
                  width={150}
                  height={150}
                  sizes={IMG_SIZES.thumb}
                  className="h-full w-full object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        aria-label={`${active.alt} — full size photo`}
        onClick={(e) => {
          if (e.target === dialogRef.current) dialogRef.current?.close();
        }}
        className="max-h-[90vh] max-w-[90vw] rounded-lg bg-transparent p-0 backdrop:bg-ink/80"
      >
        <button
          type="button"
          onClick={() => dialogRef.current?.close()}
          aria-label="Close photo"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-cream text-ink shadow"
        >
          &times;
        </button>
        <Image
          src={cld(active.url, "detail")}
          alt={active.alt}
          width={1200}
          height={1200}
          className="max-h-[90vh] w-auto rounded-lg object-contain"
        />
      </dialog>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/product/ProductGallery.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add components/product/ProductGallery.tsx components/product/ProductGallery.test.tsx
git commit -m "feat: add product photo gallery with thumbnail strip and lightbox"
```

---

### Task 11: OrderViaWhatsApp component

**Files:**
- Create: `components/product/OrderViaWhatsApp.tsx`
- Create: `components/product/OrderViaWhatsApp.test.tsx`

**Interfaces:**
- Consumes: `buildOrderMessage`, `buildWhatsAppLink` from `lib/whatsapp.ts` (Task 3), existing `WhatsAppButton` component.
- Produces: `OrderViaWhatsApp({ productName, productUrl, colours: string[], sizes: string[], className? })` — consumed by Task 12 (product detail page).

- [ ] **Step 1: Write the failing test**

```tsx
// components/product/OrderViaWhatsApp.test.tsx
// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderViaWhatsApp } from "./OrderViaWhatsApp";

afterEach(() => {
  cleanup();
});

const productUrl = "https://melcrochet-creations.vercel.app/products/lap-throw-blanket";

describe("OrderViaWhatsApp", () => {
  it("builds a WhatsApp link with just the product name when nothing is selected", () => {
    render(
      <OrderViaWhatsApp productName="Scrunchie" productUrl={productUrl} colours={[]} sizes={[]} />
    );
    const link = screen.getByRole("link", { name: /order via whatsapp/i });
    const decoded = decodeURIComponent(link.getAttribute("href")!.split("?text=")[1]);
    expect(decoded).toContain("Hi MelCrochet! I'd like to order the Scrunchie.");
    expect(decoded).not.toContain("Colour:");
    expect(decoded).not.toContain("Size:");
  });

  it("does not render a size selector for a single size, but includes it in the message", () => {
    render(
      <OrderViaWhatsApp
        productName="Lap Throw Blanket"
        productUrl={productUrl}
        colours={[]}
        sizes={["80x100cm"]}
      />
    );
    expect(screen.queryByText("Size")).not.toBeInTheDocument();
    const link = screen.getByRole("link", { name: /order via whatsapp/i });
    const decoded = decodeURIComponent(link.getAttribute("href")!.split("?text=")[1]);
    expect(decoded).toContain("Size: 80x100cm");
  });

  it("updates the WhatsApp link when a colour is selected", async () => {
    const user = userEvent.setup();
    render(
      <OrderViaWhatsApp
        productName="Lap Throw Blanket"
        productUrl={productUrl}
        colours={["Cream", "Sage Green"]}
        sizes={[]}
      />
    );

    await user.click(screen.getByRole("radio", { name: "Sage Green" }));

    const link = screen.getByRole("link", { name: /order via whatsapp/i });
    const decoded = decodeURIComponent(link.getAttribute("href")!.split("?text=")[1]);
    expect(decoded).toContain("Colour: Sage Green");
  });

  it("shows a hint to pick a colour until one is selected", () => {
    render(
      <OrderViaWhatsApp
        productName="Lap Throw Blanket"
        productUrl={productUrl}
        colours={["Cream"]}
        sizes={[]}
      />
    );
    expect(screen.getByText(/pick a colour above/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/product/OrderViaWhatsApp.test.tsx`
Expected: FAIL — `Cannot find module './OrderViaWhatsApp'`

- [ ] **Step 3: Write the implementation**

```tsx
// components/product/OrderViaWhatsApp.tsx
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/product/OrderViaWhatsApp.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add components/product/OrderViaWhatsApp.tsx components/product/OrderViaWhatsApp.test.tsx
git commit -m "feat: add colour/size selector that composes the WhatsApp order message"
```

---

### Task 12: Product detail page — metadata, JSON-LD, gallery, order component

**Files:**
- Modify: `app/(site)/products/[slug]/page.tsx`
- Create: `app/(site)/products/[slug]/page.test.ts`

**Interfaces:**
- Consumes: `SITE`, `formatPrice`, `cld`, `parseGallery`, `parseVariantList`, `ProductJsonLd`, `ProductGallery`, `OrderViaWhatsApp` (all from earlier tasks).

- [ ] **Step 1: Write the failing test**

```ts
// app/(site)/products/[slug]/page.test.ts
import "dotenv/config";
import { describe, it, expect } from "vitest";
import { generateMetadata } from "./page";

describe("product detail generateMetadata", () => {
  it("builds a unique title with the formatted price for a FIXED product", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "king-throw-blanket" }),
    });
    expect(metadata.title).toBe("King Throw Blanket – R1600");
    expect(metadata.alternates).toEqual({ canonical: "/products/king-throw-blanket" });
  });

  it("returns a not-found title for an unknown slug", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "does-not-exist-xyz" }),
    });
    expect(metadata.title).toBe("Product not found");
  });

  it("keeps the meta description within the ~155-character limit", async () => {
    // The seeded description is short and won't actually trigger truncation
    // (seed.ts: "{name} — handmade by MelCrochet with neat stitches and
    // careful finishing."), but the invariant — never exceed 155 chars —
    // must hold regardless of description length.
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: "king-throw-blanket" }),
    });
    expect((metadata.description as string).length).toBeLessThanOrEqual(155);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "app/(site)/products/[slug]/page.test.ts"`
Expected: FAIL — `generateMetadata` not exported from `./page`

- [ ] **Step 3: Rewrite the product detail page**

Replace `app/(site)/products/[slug]/page.tsx`:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/queries";
import { SITE } from "@/lib/site";
import { formatPrice } from "@/lib/format-price";
import { cld } from "@/lib/cloudinary-url";
import { parseGallery } from "@/lib/product-gallery";
import { parseVariantList } from "@/lib/product-variants";
import { ProductJsonLd } from "@/components/seo/JsonLd";
import { ProductGallery } from "@/components/product/ProductGallery";
import { OrderViaWhatsApp } from "@/components/product/OrderViaWhatsApp";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max - 1).trimEnd() + "…";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };

  const price = formatPrice(product.priceType, product.price, product.currency);
  const title = `${product.name} – ${price}`;
  const description =
    truncate(product.description, 155) ||
    `${product.name}, handmade to order by ${SITE.shortName}. Order via WhatsApp.`;
  const ogImage = product.imageUrl ? cld(product.imageUrl, "og") : undefined;

  return {
    title,
    description,
    alternates: { canonical: `/products/${slug}` },
    openGraph: {
      title: `${title} | ${SITE.shortName}`,
      description,
      type: "website",
      url: `/products/${slug}`,
      siteName: SITE.name,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: product.name }] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: `${title} | ${SITE.shortName}`,
      description,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const gallery = parseGallery(product.gallery);
  const galleryImages = [
    ...(product.imageUrl ? [{ url: product.imageUrl, alt: product.name }] : []),
    ...gallery
      .filter((img) => img.url !== product.imageUrl)
      .map((img) => ({ url: img.url, alt: product.name })),
  ];

  const colours = parseVariantList(product.colours);
  const sizes = parseVariantList(product.sizes);
  const productUrl = `${SITE.url}/products/${product.slug}`;
  const price =
    product.priceType === "FIXED" && product.price !== null ? Number(product.price) : null;

  return (
    <article className="bg-cream">
      <div className="mx-auto max-w-5xl px-5 py-16">
        <ProductJsonLd
          name={product.name}
          description={product.description}
          slug={product.slug}
          images={galleryImages.map((img) => cld(img.url, "detail"))}
          priceType={product.priceType}
          price={price}
        />

        <div className="grid gap-10 md:grid-cols-2">
          <ProductGallery images={galleryImages} />

          <div>
            <p className="font-sans text-sm text-ink/60">{product.category.name}</p>
            <h1 className="mt-1 text-display">{product.name}</h1>
            <p className="mt-2 font-sans text-lg font-semibold text-brown">
              {formatPrice(product.priceType, product.price, product.currency)}
            </p>

            {product.leadTime && (
              <p className="mt-3 inline-block rounded-full bg-taupe/15 px-3 py-1 font-sans text-sm text-ink/70">
                Made to order · {product.leadTime}
              </p>
            )}

            <p className="mt-6 whitespace-pre-wrap font-sans text-ink/80">{product.description}</p>

            <OrderViaWhatsApp
              productName={product.name}
              productUrl={productUrl}
              colours={colours}
              sizes={sizes}
              className="mt-6"
            />

            {product.careInstructions && (
              <details className="mt-6 rounded-lg border border-taupe/30 p-4">
                <summary className="cursor-pointer font-sans font-medium text-ink">
                  Care instructions
                </summary>
                <p className="mt-2 whitespace-pre-wrap font-sans text-sm text-ink/70">
                  {product.careInstructions}
                </p>
              </details>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run "app/(site)/products/[slug]/page.test.ts"`
Expected: PASS (3 tests)

- [ ] **Step 5: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 6: Manual check**

Run: `npm run dev`, then in another terminal:
Run: `curl -s http://localhost:3000/products/king-throw-blanket | grep -o '<title>[^<]*</title>'`
Expected: `<title>King Throw Blanket – R1600 | MelCrochet</title>`

Stop the dev server when done.

- [ ] **Step 7: Commit**

```bash
git add "app/(site)/products/[slug]/page.tsx" "app/(site)/products/[slug]/page.test.ts"
git commit -m "feat: rewrite product detail page with metadata, JSON-LD, gallery and order selector"
```

---

### Task 13: ProductCard — shared price formatting + lead-time badge

**Files:**
- Modify: `components/ProductCard.tsx`
- Create: `components/ProductCard.test.tsx`

**Interfaces:**
- Consumes: `formatPrice` from `lib/format-price.ts` (Task 1).

- [ ] **Step 1: Write the failing test**

```tsx
// components/ProductCard.test.tsx
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import ProductCard from "./ProductCard";

const baseProduct = {
  id: "1",
  slug: "lap-throw-blanket",
  name: "Lap Throw Blanket",
  priceType: "FIXED" as const,
  price: 650,
  currency: "ZAR",
  imageUrl: null,
  leadTime: null,
};

describe("ProductCard", () => {
  it("renders the formatted price", () => {
    const html = renderToStaticMarkup(<ProductCard product={baseProduct} />);
    expect(html).toContain("R650");
  });

  it("renders 'Quote on Request' for QUOTE products", () => {
    const html = renderToStaticMarkup(
      <ProductCard product={{ ...baseProduct, priceType: "QUOTE", price: null }} />
    );
    expect(html).toContain("Quote on Request");
  });

  it("shows a made-to-order badge when leadTime is set", () => {
    const html = renderToStaticMarkup(
      <ProductCard product={{ ...baseProduct, leadTime: "4–6 days" }} />
    );
    expect(html).toContain("Made to order · 4–6 days");
  });

  it("omits the badge when leadTime is not set", () => {
    const html = renderToStaticMarkup(<ProductCard product={baseProduct} />);
    expect(html).not.toContain("Made to order");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/ProductCard.test.tsx`
Expected: FAIL — the `product` type doesn't have `leadTime` yet, and the badge markup doesn't exist

- [ ] **Step 3: Update the component**

Replace `components/ProductCard.tsx`:

```tsx
import Link from "next/link";
import ImagePlaceholder from "@/components/ImagePlaceholder";
import WhatsAppButton from "@/components/WhatsAppButton";
import { buildProductWhatsAppLink } from "@/lib/whatsapp";
import { formatPrice } from "@/lib/format-price";

type Product = {
  id: string;
  slug: string;
  name: string;
  priceType: "FIXED" | "QUOTE";
  price: unknown; // Prisma Decimal — stringify for display, never do arithmetic on it here
  currency: string;
  imageUrl: string | null;
  leadTime: string | null;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex flex-col border border-taupe/30 bg-cream">
      <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
        <div className="aspect-square w-full overflow-hidden">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <ImagePlaceholder className="h-full w-full" />
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <p className="font-display text-lg">{product.name}</p>
          <p className="mt-1 font-sans text-sm font-semibold text-brown">
            {formatPrice(product.priceType, product.price, product.currency)}
          </p>
          {product.leadTime && (
            <p className="mt-1 font-sans text-xs text-ink/50">
              Made to order · {product.leadTime}
            </p>
          )}
        </div>
      </Link>
      <div className="px-4 pb-4">
        <WhatsAppButton href={buildProductWhatsAppLink(product.name)} />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Fix the caller**

`components/ProductCard.tsx`'s `Product` type now requires `leadTime`. `app/(site)/products/page.tsx` passes Prisma `Product` rows straight through (which already include `leadTime` as a scalar column since Task 4), so no caller change is needed — but run the type check to confirm.

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run components/ProductCard.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add components/ProductCard.tsx components/ProductCard.test.tsx
git commit -m "feat: show made-to-order lead time badge on product cards"
```

---

### Task 14: Admin — gallery upload + care instructions

**Files:**
- Create: `components/admin/GalleryUpload.tsx`
- Create: `components/admin/GalleryUpload.test.tsx`
- Modify: `app/admin/products/page.tsx`

**Interfaces:**
- Consumes: existing `ImageUpload` component, `ProductGalleryImage`/`parseGallery` from `lib/product-gallery.ts`.
- Produces: `GalleryUpload({ value: ProductGalleryImage[], onChange, max? })` — used inside the admin product form.

- [ ] **Step 1: Write the failing test**

```tsx
// components/admin/GalleryUpload.test.tsx
// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import GalleryUpload from "./GalleryUpload";

afterEach(() => {
  cleanup();
});

describe("GalleryUpload", () => {
  it("shows an 'Add photo' control when under the max", () => {
    render(<GalleryUpload value={[]} onChange={vi.fn()} />);
    expect(screen.getByRole("button", { name: /add photo/i })).toBeInTheDocument();
  });

  it("renders one thumbnail per existing gallery image with a remove button", () => {
    render(
      <GalleryUpload
        value={[
          { url: "https://res.cloudinary.com/demo/image/upload/v1/a.jpg", publicId: "products/a" },
          { url: "https://res.cloudinary.com/demo/image/upload/v1/b.jpg", publicId: "products/b" },
        ]}
        onChange={vi.fn()}
      />
    );
    expect(screen.getAllByRole("button", { name: /remove photo/i })).toHaveLength(2);
  });

  it("calls onChange with the image removed when its remove button is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <GalleryUpload
        value={[
          { url: "https://res.cloudinary.com/demo/image/upload/v1/a.jpg", publicId: "products/a" },
          { url: "https://res.cloudinary.com/demo/image/upload/v1/b.jpg", publicId: "products/b" },
        ]}
        onChange={onChange}
      />
    );
    await user.click(screen.getAllByRole("button", { name: /remove photo/i })[0]);
    expect(onChange).toHaveBeenCalledWith([
      { url: "https://res.cloudinary.com/demo/image/upload/v1/b.jpg", publicId: "products/b" },
    ]);
  });

  it("hides 'Add photo' once the max is reached", () => {
    render(
      <GalleryUpload
        value={[{ url: "https://res.cloudinary.com/demo/image/upload/v1/a.jpg", publicId: "products/a" }]}
        onChange={vi.fn()}
        max={1}
      />
    );
    expect(screen.queryByRole("button", { name: /add photo/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run components/admin/GalleryUpload.test.tsx`
Expected: FAIL — `Cannot find module './GalleryUpload'`

- [ ] **Step 3: Write the implementation**

```tsx
// components/admin/GalleryUpload.tsx
"use client";

import { useState } from "react";
import ImageUpload from "@/components/admin/ImageUpload";
import type { ProductGalleryImage } from "@/lib/product-gallery";

interface Props {
  value: ProductGalleryImage[];
  onChange: (value: ProductGalleryImage[]) => void;
  max?: number;
}

export default function GalleryUpload({ value, onChange, max = 6 }: Props) {
  const [adding, setAdding] = useState(false);

  function remove(publicId: string) {
    onChange(value.filter((img) => img.publicId !== publicId));
  }

  return (
    <div>
      <p className="mb-2 text-xs text-gray-500">
        Natural light, plain neutral background. Add at least 3 photos: the
        full item, a close-up of the stitch, and the item in use. Up to {max} photos.
      </p>

      {value.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2">
          {value.map((img) => (
            <li key={img.publicId} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-16 w-16 rounded object-cover" />
              <button
                type="button"
                onClick={() => remove(img.publicId)}
                aria-label="Remove photo"
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}

      {value.length < max &&
        (adding ? (
          <ImageUpload
            onUploaded={(url, publicId) => {
              onChange([...value, { url, publicId }]);
              setAdding(false);
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-600 hover:border-gray-400"
          >
            + Add photo
          </button>
        ))}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run components/admin/GalleryUpload.test.tsx`
Expected: PASS (4 tests)

- [ ] **Step 5: Wire GalleryUpload and careInstructions into the admin product form**

In `app/admin/products/page.tsx`:

Add imports:

```ts
import GalleryUpload from "@/components/admin/GalleryUpload";
import { parseGallery, type ProductGalleryImage } from "@/lib/product-gallery";
```

Extend the `Product` interface with the two new fields:

```ts
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceType: "FIXED" | "QUOTE";
  price: string | null;
  currency: string;
  sizes: string | null;
  colours: string | null;
  leadTime: string | null;
  careInstructions: string | null;
  imageUrl: string | null;
  imagePublicId: string | null;
  gallery: unknown;
  featured: boolean;
  isActive: boolean;
  sortOrder: number;
  categoryId: string;
  category: Category;
}
```

Extend `FormState` and `emptyForm`:

```ts
interface FormState {
  name: string;
  description: string;
  priceType: "FIXED" | "QUOTE";
  price: string;
  categoryId: string;
  sizes: string;
  colours: string;
  leadTime: string;
  careInstructions: string;
  imageUrl: string;
  imagePublicId: string;
  gallery: ProductGalleryImage[];
  featured: boolean;
  isActive: boolean;
  sortOrder: string;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  priceType: "QUOTE",
  price: "",
  categoryId: "",
  sizes: "",
  colours: "",
  leadTime: "",
  careInstructions: "",
  imageUrl: "",
  imagePublicId: "",
  gallery: [],
  featured: false,
  isActive: true,
  sortOrder: "0",
};
```

In `openEdit`, add the two fields to the populated form:

```ts
    setForm({
      name: product.name,
      description: product.description,
      priceType: product.priceType,
      price: product.price?.toString() ?? "",
      categoryId: product.categoryId,
      sizes: product.sizes ?? "",
      colours: product.colours ?? "",
      leadTime: product.leadTime ?? "",
      careInstructions: product.careInstructions ?? "",
      imageUrl: product.imageUrl ?? "",
      imagePublicId: product.imagePublicId ?? "",
      gallery: parseGallery(product.gallery),
      featured: product.featured,
      isActive: product.isActive,
      sortOrder: product.sortOrder.toString(),
    });
```

In `handleSave`, add the two fields to `body`:

```ts
    const body = {
      name: form.name,
      description: form.description,
      priceType: form.priceType,
      price: form.priceType === "FIXED" ? Number(form.price) : null,
      categoryId: form.categoryId,
      sizes: form.sizes || undefined,
      colours: form.colours || undefined,
      leadTime: form.leadTime || undefined,
      careInstructions: form.careInstructions || undefined,
      imageUrl: form.imageUrl || undefined,
      imagePublicId: form.imagePublicId || undefined,
      gallery: form.gallery,
      featured: form.featured,
      isActive: form.isActive,
      sortOrder: Number(form.sortOrder) || 0,
    };
```

`updateForm` only handles `string | boolean` values — add a small dedicated setter for the gallery array (it doesn't go through `updateForm`):

```ts
  function updateGallery(gallery: ProductGalleryImage[]) {
    setForm((prev) => ({ ...prev, gallery }));
    setFormError(null);
  }
```

In the JSX, after the existing "Image" field block (`<ImageUpload currentUrl={form.imageUrl} .../>`), add:

```tsx
          <div>
            <label className="block text-sm font-medium text-gray-700">Gallery</label>
            <div className="mt-1">
              <GalleryUpload value={form.gallery} onChange={updateGallery} />
            </div>
          </div>
```

And after the "Lead Time" field block, add a Care Instructions textarea:

```tsx
          <div>
            <label htmlFor="prod-care" className="block text-sm font-medium text-gray-700">
              Care Instructions
            </label>
            <textarea
              id="prod-care"
              value={form.careInstructions}
              onChange={(e) => updateForm("careInstructions", e.target.value)}
              rows={2}
              placeholder="e.g. Hand wash cold, dry flat"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-brown"
            />
          </div>
```

- [ ] **Step 6: Type-check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 7: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add components/admin/GalleryUpload.tsx components/admin/GalleryUpload.test.tsx app/admin/products/page.tsx
git commit -m "feat: admin gallery upload and care instructions field"
```

---

### Task 15: sitemap.xml and robots.txt

**Files:**
- Create: `app/sitemap.ts`
- Create: `app/sitemap.test.ts`
- Create: `app/robots.ts`
- Create: `app/robots.test.ts`

**Interfaces:**
- Consumes: `SITE` (Task 1), `getProducts`, `getPublishedBlogPosts`, `getCategories` (existing/Task 8, all in `lib/queries.ts`).

- [ ] **Step 1: Write the failing tests**

```ts
// app/sitemap.test.ts
import "dotenv/config";
import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  it("includes the core static routes", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://melcrochet-creations.vercel.app");
    expect(urls).toContain("https://melcrochet-creations.vercel.app/products");
    expect(urls).toContain("https://melcrochet-creations.vercel.app/faq");
  });

  it("includes a URL for a known seeded product", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://melcrochet-creations.vercel.app/products/king-throw-blanket");
  });

  it("includes one products URL per category slug", async () => {
    const entries = await sitemap();
    const urls = entries.map((e) => e.url);
    expect(urls).toContain("https://melcrochet-creations.vercel.app/products?category=hats");
  });
});
```

```ts
// app/robots.test.ts
import { describe, it, expect } from "vitest";
import robots from "./robots";

describe("robots", () => {
  it("disallows /admin and /api and points at the sitemap", () => {
    const result = robots();
    expect(result.rules).toEqual({
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"],
    });
    expect(result.sitemap).toBe("https://melcrochet-creations.vercel.app/sitemap.xml");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run app/sitemap.test.ts app/robots.test.ts`
Expected: FAIL — `Cannot find module './sitemap'` / `'./robots'`

- [ ] **Step 3: Write the implementation**

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { getProducts, getPublishedBlogPosts, getCategories } from "@/lib/queries";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts, categories] = await Promise.all([
    getProducts(),
    getPublishedBlogPosts(),
    getCategories(),
  ]);
  const base = SITE.url;

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/products`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/faq`, changeFrequency: "monthly", priority: 0.6 },

    ...categories.map((c) => ({
      url: `${base}/products?category=${c.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),

    ...products.map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),

    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
```

```ts
// app/robots.ts
import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run app/sitemap.test.ts app/robots.test.ts`
Expected: PASS

- [ ] **Step 5: Manual check**

Run: `npm run dev`, then: `curl -s http://localhost:3000/sitemap.xml | head -20` and `curl -s http://localhost:3000/robots.txt`
Expected: valid XML with `<urlset>` entries; robots.txt lists `Disallow: /admin`, `Disallow: /api`, and `Sitemap: https://melcrochet-creations.vercel.app/sitemap.xml`. Stop the dev server after.

- [ ] **Step 6: Commit**

```bash
git add app/sitemap.ts app/sitemap.test.ts app/robots.ts app/robots.test.ts
git commit -m "feat: add dynamic sitemap.xml and robots.txt"
```

---

### Task 16: FAQ page

**Files:**
- Create: `app/(site)/faq/page.tsx`
- Create: `app/(site)/faq/page.test.tsx`
- Modify: `components/Nav.tsx`
- Modify: `components/Footer.tsx`

**Interfaces:**
- Consumes: `FaqJsonLd`, `FaqItem` from `components/seo/JsonLd.tsx` (Task 6).

**Content note:** the delivery/payment/returns copy below is a reasonable first draft based on the spec's suggested sections (courier + collection, EFT/cash + 50% deposit on custom orders, made-to-order lead times, hand-wash care, CPA-safe no-returns-except-defects policy). **Flag this copy for Mel to review and correct** before or shortly after shipping — it is not sourced from her actual courier/payment setup.

- [ ] **Step 1: Write the failing test**

```tsx
// app/(site)/faq/page.test.tsx
import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import FaqPage, { metadata } from "./page";

describe("FaqPage", () => {
  it("has a unique title and description", () => {
    expect(metadata.title).toBe("Delivery, Payment & FAQ");
    expect(metadata.description).toContain("Delivery");
  });

  it("renders the page heading and at least one question", () => {
    const html = renderToStaticMarkup(<FaqPage />);
    expect(html).toContain("Delivery, Payment &amp; FAQ");
    expect(html).toContain("How do I pay?");
  });

  it("emits FAQPage JSON-LD", () => {
    const html = renderToStaticMarkup(<FaqPage />);
    expect(html).toContain("FAQPage");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "app/(site)/faq/page.test.tsx"`
Expected: FAIL — `Cannot find module './page'`

- [ ] **Step 3: Write the page**

```tsx
// app/(site)/faq/page.tsx
import type { Metadata } from "next";
import { FaqJsonLd, type FaqItem } from "@/components/seo/JsonLd";

export const metadata: Metadata = {
  title: "Delivery, Payment & FAQ",
  description:
    "Delivery options, payment methods, lead times, care instructions and our returns policy for MelCrochet Gifted Hands handmade crochet orders.",
};

const FAQS: FaqItem[] = [
  {
    question: "How long does an order take?",
    answer:
      "Every piece is made to order by hand. Standard items typically take 4–6 days; custom orders or larger pieces (like queen and king throws) may take 1–2 weeks. We'll confirm your exact lead time on WhatsApp when you order.",
  },
  {
    question: "How do I pay?",
    answer:
      "We accept EFT and cash on collection. For custom orders, we ask for a 50% deposit upfront to begin work, with the balance due before delivery or collection.",
  },
  {
    question: "How is my order delivered?",
    answer:
      "We deliver via courier (PUDO/Paxi or a local courier, depending on your area) or you can arrange collection with us in Johannesburg. Courier costs depend on your location and are quoted separately from the item price.",
  },
  {
    question: "Can I request a custom colour, size or design?",
    answer:
      "Yes — message us on WhatsApp with what you have in mind. We'll confirm feasibility, price and lead time before starting your order.",
  },
  {
    question: "How do I care for my crochet item?",
    answer:
      "Hand wash in cold water with a gentle detergent, avoid wringing, and dry flat away from direct sunlight to keep the stitches and shape looking their best.",
  },
  {
    question: "What is your returns policy?",
    answer:
      "Because every item is handmade to order, we're unable to accept returns or exchanges for change of mind. If your item arrives damaged or with a manufacturing defect, contact us on WhatsApp within 48 hours of delivery and we'll make it right.",
  },
];

export default function FaqPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-3xl px-5 py-16">
        <FaqJsonLd items={FAQS} />
        <h1 className="text-display">Delivery, Payment &amp; FAQ</h1>
        <p className="mt-4 font-sans text-ink/70">
          Answers to the questions we hear most on WhatsApp. Can&apos;t find
          what you need? Message us and we&apos;ll help.
        </p>

        <dl className="mt-10 flex flex-col gap-8">
          {FAQS.map((faq) => (
            <div key={faq.question}>
              <dt className="font-display text-lg text-ink">{faq.question}</dt>
              <dd className="mt-2 font-sans text-ink/70">{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Add the FAQ link to navigation**

In `components/Nav.tsx`, add an entry to `LINKS` (before Contact):

```ts
const LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];
```

In `components/Footer.tsx`, add a link to the "Explore" list:

```tsx
              <li><Link href="/products" className="hover:text-cream">Products</Link></li>
              <li><Link href="/about" className="hover:text-cream">About</Link></li>
              <li><Link href="/blog" className="hover:text-cream">Blog</Link></li>
              <li><Link href="/faq" className="hover:text-cream">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-cream">Contact</Link></li>
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run "app/(site)/faq/page.test.tsx"`
Expected: PASS (3 tests)

- [ ] **Step 6: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add "app/(site)/faq/page.tsx" "app/(site)/faq/page.test.tsx" components/Nav.tsx components/Footer.tsx
git commit -m "feat: add delivery, payment and FAQ page with FAQPage JSON-LD"
```

---

### Task 17: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Type check**

Run: `npx tsc --noEmit`
Expected: no errors

- [ ] **Step 2: Full test suite**

Run: `npm test`
Expected: all tests PASS

- [ ] **Step 3: Lint**

Run: `npm run lint`
Expected: no errors

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: build succeeds, `/sitemap.xml` and `/robots.txt` listed in the route output

- [ ] **Step 5: Manual Definition of Done checklist**

Run `npm run dev` and manually verify against the spec's Phase 1 checklist:
- [ ] Unique title + description on: home, `/products`, `/products?category=hats`, `/products/king-throw-blanket`, `/about`, `/contact`, `/faq` (view-source each)
- [ ] `/products/king-throw-blanket` OG tags: `curl -s http://localhost:3000/products/king-throw-blanket | grep -o 'og:[a-z]*'`
- [ ] `/sitemap.xml` lists all active products and `/robots.txt` references it
- [ ] On `/products/lap-throw-blanket` (or any product with colours/sizes seeded via the admin), selecting a colour and size updates the WhatsApp button's href and opens WhatsApp pre-filled with both plus the page URL
- [ ] Admin: creating a product with `isActive` left at its default and no image is rejected with a clear error; saving with `isActive` unchecked (draft) succeeds with no image
- [ ] Admin: gallery upload adds/removes photos and they appear as thumbnails on the product detail page
- [ ] Tab through a product detail page: gallery thumbnails, lightbox close button, size pills, colour swatches, and the WhatsApp button are all keyboard-reachable with a visible focus ring

Stop the dev server when done.

- [ ] **Step 6: Report to the user**

Summarize what shipped, what's deliberately deferred (Phase 3/4, custom domain, Search Console), and flag the FAQ page copy for Mel's review.

**Do not commit Task 17** — it produces no file changes.
