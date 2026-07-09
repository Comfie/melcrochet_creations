# MelCrochet Gifted Hands — Website Design Spec

**Date:** 2026-07-09
**Status:** Approved
**Author:** Design brainstorm (Comfort + Claude)

## 1. Overview

A portfolio and product-showcase website for **MelCrochet Gifted Hands**, a handmade
crochet business founded by Melissa Ruvimbo Buchirai. The site presents the brand,
a filterable product catalogue, the founder story, a blog (with optional YouTube
video embeds), and a contact/enquiry channel. Ordering happens over WhatsApp — the
site is a catalogue, **not** a checkout.

An admin panel lets Melissa manage products (with photo upload), testimonials,
categories, blog articles, and view contact enquiries, without touching code.

### Brand

| Token | Hex | Use |
|---|---|---|
| Luxury Black | `#151515` | Headings, strong contrast |
| Warm Gold | `#C8A24A` | Accents, badges, highlights |
| Soft Cream | `#F7F0E3` | Backgrounds, cards |
| Warm Taupe | `#A78B71` | Secondary accents |
| Deep Brown | `#3B2D26` | Subheadings, table headings |

- **Display / headings:** Fraunces — a warm, high-contrast variable "soft serif" with
  real character (via `next/font`), Georgia as system fallback. Honours the portfolio's
  "Georgia or similar serif" intent while avoiding a generic default look.
- **Body:** Inter / sans-serif (via `next/font`, self-hosted at build)
- **Feeling:** warm, elegant, handmade, premium — editorial, tactile, not templated
- **Slogan:** "Providing Warmth, Comfort & Timeless Handmade Creations"

### Contacts (canonical)

- WhatsApp: `067 059 0600` → link `https://wa.me/27670590600`
- Instagram: `@melz.crotchet.creations`
- Currency: ZAR (South African Rand), price badges render as `R450`

## 2. Architecture

**Single full-stack Next.js 16 app** — no separate backend service. Next.js handles
the public site, the admin panel, AND the API (route handlers + server-side data
access). Postgres is the only thing on Railway. This mirrors Comfort's existing,
proven setup and removes cross-origin complexity entirely.

```
melcrochet-gifted-hands/
├── app/
│   ├── (site)/          public pages (Home, Products, About, Blog, Contact)
│   ├── admin/           admin panel (auth-gated)
│   └── api/             route handlers — the "backend" (auth, uploads, mutations)
├── components/          shared UI (ProductCard, WhatsAppButton, …)
├── lib/                 prisma client, auth/session, cloudinary, zod schemas, queries
├── prisma/              schema.prisma, migrations, seed.ts
├── public/
├── docs/
├── proxy.ts              admin route gate (Next.js 16 renamed middleware.ts → proxy.ts)
├── package.json
└── README.md
```

- **Hosting:** the whole app deploys to **Vercel** (one deploy). **Railway hosts only
  the managed Postgres** database — it is not a deployed service, just a
  `DATABASE_URL` the app connects to. **One git push → one Vercel build.**
- **Image storage:** Cloudinary (Vercel's filesystem is ephemeral, so local disk
  isn't an option; free tier is sufficient to launch and run).
- **Data access:** public pages (Server Components) query Postgres **directly via
  Prisma** — no HTTP hop. Mutations (admin CRUD, uploads) and the public enquiry
  submit go through **route handlers under `app/api/*`**, called same-origin.
- **Auth cookies are same-origin** → `HttpOnly; Secure; SameSite=Lax; Path=/`
  (simpler and safer than the cross-origin `SameSite=None` a split would have needed).
  No CORS configuration required.
- **Config:** fully env-driven; no custom domain required to build/deploy. The default
  Vercel domain works; attaching a domain later is a DNS change, no code change.

### Serverless + Postgres note

Vercel runs serverless functions, so many short-lived connections can exhaust a raw
Postgres connection limit. Use a **pooled connection** — Railway's connection pooling
(or Prisma's `?connection_limit=` / a pooler URL) — for `DATABASE_URL` in production.
Prisma client is instantiated as a singleton in `lib/prisma.ts` to avoid connection
churn in dev. (This is the same gotcha Comfort's other Next.js + Railway project
already handles.)

### Key environment variables

`DATABASE_URL` (Railway Postgres, pooled), `JWT_SECRET`, `ADMIN_USERNAME`,
`ADMIN_PASSWORD_HASH`, `CLOUDINARY_URL` (or cloud name / key / secret).
No `NEXT_PUBLIC_API_URL` or `WEB_ORIGIN` needed — everything is same-origin.

## 3. Data Model (Prisma)

Five models. Soft-delete via `isActive` (never hard-delete catalogue items).

```prisma
model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  blurb     String?
  sortOrder Int       @default(0)
  products  Product[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

enum PriceType { FIXED  QUOTE }

model Product {
  id            String    @id @default(cuid())
  name          String
  slug          String    @unique
  description   String
  priceType     PriceType @default(QUOTE)
  price         Decimal?  @db.Decimal(10, 2)   // null when QUOTE
  currency      String    @default("ZAR")
  sizes         String?                        // free text
  colours       String?                        // comma-separated, e.g. "Cream, sage, charcoal"
  leadTime      String?                        // free text, e.g. "2–3 weeks"
  imageUrl      String?
  imagePublicId String?                        // Cloudinary id for delete/replace
  featured      Boolean   @default(false)
  isActive      Boolean   @default(true)
  sortOrder     Int       @default(0)
  categoryId    String
  category      Category  @relation(fields: [categoryId], references: [id])
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([categoryId])
}

model Testimonial {
  id            String   @id @default(cuid())
  customerName  String
  quote         String
  location      String?
  productName   String?
  imageUrl      String?
  imagePublicId String?
  rating        Int?
  isActive      Boolean  @default(true)
  sortOrder     Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

enum EnquiryStatus { NEW  READ  ARCHIVED }

model Enquiry {
  id        String        @id @default(cuid())
  name      String
  email     String?
  phone     String?
  message   String
  status    EnquiryStatus @default(NEW)
  createdAt DateTime      @default(now())

  @@index([status])
}

model BlogPost {
  id                 String    @id @default(cuid())
  title              String
  slug               String    @unique
  excerpt            String?                  // short summary for cards / SEO
  content            String                   // Markdown body
  coverImageUrl      String?
  coverImagePublicId String?                  // Cloudinary id for delete/replace
  youtubeUrl         String?                  // optional featured video embed
  published          Boolean   @default(false)
  publishedAt        DateTime?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  @@index([published, publishedAt])
}
```

### Design decisions

- **Single image per product** at launch. Multi-colour handled via the free-text
  `colours` field (matches the FAQ: colour chosen before production). A multi-image
  gallery (`ProductImage` model) can be added later without disruption.
- **`sizes` / `colours` / `leadTime` as free text** — the portfolio phrases these as
  free-form ("custom-size rules", "average production time").
- **`imagePublicId` stored** so replace/delete cleans up Cloudinary instead of orphaning.
- **`featured`** drives an optional "Featured Pieces" strip on Home.
- **No `Order` model** — ordering is entirely WhatsApp. Enquiries are the only
  inbound data captured.
- **Blog `content` is Markdown**, rendered with `react-markdown` + sanitisation (not a
  heavy WYSIWYG). `youtubeUrl` renders as a responsive lazy-loaded embed; Markdown
  links cover any additional videos referenced inline. `published`/`publishedAt`
  gate visibility so drafts stay hidden.

### Categories (seeded, 12)

Baby Blankets, Throw Blankets (includes chunky throws), **Bags** (renamed from
portfolio's "Handbags"), **Baskets** (new — from price list), Hats, Scrunchies,
Baby Sweaters, **Kids Sweaters** (new), Adult Sweaters, Kids Dresses, Custom Orders,
Gift Sets.

Note: "Chunky Blankets" from the original portfolio is **not** a separate category —
chunky throws are a style within Throw Blankets.

### Seed content — real products (from MelCrochet price list)

Prisma seed creates the 12 categories plus the following **real, fixed-price**
products (currency ZAR, stock placeholder image until Melissa uploads real photos):

| Product | Price | Category |
|---|---|---|
| Baby Throw Blanket | R550 | Baby Blankets |
| Lap Throw Blanket | R650 | Throw Blankets |
| Double Throw Blanket | R1,200 | Throw Blankets |
| Queen Throw Blanket | R1,400 | Throw Blankets |
| King Throw Blanket | R1,600 | Throw Blankets |
| Kids Beanie Hat | R100 | Hats |
| Adult Beanie Hat | R150 | Hats |
| Adult Ruffle Bucket Hat | R250 | Hats |
| Laptop Bag | R450 | Bags |
| Diaper Bag | R350 | Bags |
| Picnic Bag | R300 | Bags |
| Small Basket | R200 | Baskets |
| Medium Basket | R300 | Baskets |
| Large Basket | R400 | Baskets |
| Kids Party Dress | R300 | Kids Dresses |
| Scrunchie | R50 | Scrunchies |
| Kids Sweater | R300 | Kids Sweaters |
| Adult Sweater | R650 | Adult Sweaters |

The three categories without priced products yet (Baby Sweaters, Gift Sets,
Custom Orders) are seeded with 1–2 **quote-based** (`QUOTE` / "Quote on Request")
placeholder products each, so the grid looks full and customers can still enquire.
Melissa replaces placeholders and adds photos/prices via the admin panel.

## 4. API Layer (Next.js route handlers + server-side data access)

The "backend" lives inside the same Next.js app. Two access patterns:

- **Public reads** — Server Components call typed query functions in `lib/queries.ts`
  that hit Prisma directly (no HTTP round-trip, cached per route). These cover
  categories, products, testimonials, and published blog posts on the public pages.
- **Mutations + auth + uploads + enquiry submit** — **route handlers** under
  `app/api/*`, called same-origin (admin client with `fetch`; enquiry form on Contact).

### Route handlers

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | — | Verify creds → set httpOnly cookie |
| POST | `/api/auth/logout` | — | Clear cookie |
| GET | `/api/auth/me` | cookie | Session check for admin UI |
| POST | `/api/enquiries` | — | Contact form submit (rate-limited + honeypot) |
| POST | `/api/uploads` | cookie | multipart image → Cloudinary → `{ url, publicId }` |
| POST/PATCH/DELETE | `/api/products[/:id]` | cookie | Product management (sees inactive) |
| POST/PATCH/DELETE | `/api/categories[/:id]` | cookie | Category management |
| POST/PATCH/DELETE | `/api/testimonials[/:id]` | cookie | Testimonial management |
| POST/PATCH/DELETE | `/api/blog[/:id]` | cookie | Blog post management (sees drafts) |
| GET, PATCH | `/api/enquiries[/:id]` | cookie | List + mark read/archived |

Public GET reads are served by Server Components via Prisma, so they don't need
dedicated public GET route handlers (admin GET lists that must include
inactive/draft rows do use route handlers).

### Auth flow

```
POST /api/auth/login { username, password }
  → username === ADMIN_USERNAME
  → bcrypt.compare(password, ADMIN_PASSWORD_HASH)
  → sign JWT (7-day expiry) with jose
  → Set-Cookie: mc_admin=<jwt>; HttpOnly; Secure; SameSite=Lax; Path=/
Protected route handlers → shared requireAuth() helper reads the cookie, verifies
sig+expiry (jose), returns 401 otherwise. This is the real security boundary.
```

### Decisions

- Admin credentials in env, password **bcrypt-hashed** (`ADMIN_PASSWORD_HASH`).
  Provide `npm run hash-password` helper. No plaintext password in repo.
- JWT signed/verified with **`jose`** (Edge-compatible, works in `proxy.ts`), stored in
  an **httpOnly cookie** (not localStorage) — XSS-safe.
- **Zod** schemas validate every mutation's input at the route-handler boundary
  (replaces NestJS `class-validator`); unknown fields stripped, clean 400 on failure.
- **Enquiry spam guard** — a hidden honeypot field plus a lightweight per-IP rate
  limit. (In-memory limiting is unreliable across serverless instances; if abuse
  appears, drop in Upstash Redis rate-limiting — a small, isolated change.)
- Uploads go through `/api/uploads` (keeps the Cloudinary secret server-side, enforces
  auth + image-only + ~5MB cap).
- Slugs generated server-side from `name` (slugify + dedupe).

## 5. Frontend (Next.js 16)

### Routes

```
app/
├── (site)/
│   ├── page.tsx            Home
│   ├── products/page.tsx   Catalogue (filterable)
│   ├── about/page.tsx      Founder story
│   ├── blog/page.tsx       Blog index (published posts)
│   ├── blog/[slug]/page.tsx  Article detail (Markdown + optional YouTube embed)
│   ├── contact/page.tsx    Enquiry form + links
│   └── layout.tsx          Nav, footer, floating WhatsApp button
├── admin/
│   ├── login/page.tsx
│   ├── products/page.tsx
│   ├── testimonials/page.tsx
│   ├── blog/page.tsx       Article authoring + publish
│   ├── enquiries/page.tsx
│   └── layout.tsx          Sidebar + auth gate
├── api/                    route handlers (see §4)
├── layout.tsx              Root: fonts, global CSS, metadata
└── globals.css
```

### Pages

- **Home:** hero with slogan + WhatsApp CTA; **12-category grid** (each links into the
  filtered catalogue); optional "Featured Pieces" strip (from `featured` flag);
  about/founder teaser; testimonials carousel; inline + floating WhatsApp CTA.
- **Products:** filterable catalogue. Filter is a small Client Component that sets the
  `?category=` URL param; the Server Component reads it (Next 16 async `searchParams`)
  and queries Prisma. Cards: image, name, price/quote badge, "Order via WhatsApp".
- **About:** founder story (Melissa Ruvimbo Buchirai), mission/vision/values.
- **Blog:** `/blog` index of published posts (cover image, title, excerpt, date as
  editorial cards); `/blog/[slug]` article — cover, Markdown body rendered with
  typographic care, optional responsive YouTube embed, and share/WhatsApp CTA.
  Server-rendered for SEO; unknown/unpublished slug → `notFound()`.
- **Contact:** WhatsApp link, Instagram, enquiry form → `POST /api/enquiries`.

### Data fetching

- Public pages are **Server Components** that query Postgres **directly via Prisma**
  (`lib/queries.ts`) — no HTTP hop. Route segments use `revalidate` (e.g. 60s) so the
  site is cached but picks up admin edits within a minute; admin mutations can also
  call `revalidatePath`/`revalidateTag` for instant refresh. SEO-friendly.
- Category filter = URL-param driven, works as plain links without JS.
- Enquiry form = Client Component posting to `/api/enquiries` with inline validation
  + success/error states.

### Design language & art direction

The explicit brief: **modern, well-considered, super-responsive, and NOT generic.**
The aesthetic is **editorial craft** — the polish of a premium print magazine applied
to a warm, tactile handmade brand. Distinctive by intent, never a template.

**Type**
- Display/headings in **Fraunces** (warm high-contrast variable serif) at large,
  confident sizes; Georgia fallback. Body in **Inter**.
- **Fluid type scale** with `clamp()` so headings breathe on desktop and stay
  legible on mobile — no fixed pixel jumps.

**Layout**
- **Asymmetric editorial grids** and generous negative space, not centred-everything
  boxes. Large imagery, layered/overlapping elements, off-grid gold hairline accents.
- Deliberate rhythm: alternating cream and dramatic **luxury-black** sections for
  contrast and pacing down the page.

**Texture & depth**
- Subtle paper/knit grain and soft, warm, role-based shadows (tactile, not flat).
- A refined **crochet-stitch / scalloped motif** (echoing the portfolio) used sparingly
  as section dividers and accents — the handmade signature, done tastefully.

**Motion** (via the `motion` skill guardrails)
- Purposeful, **tokenised durations/easing**; `transform`/`opacity` only.
- Scroll-reveal on sections, subtle hero parallax, product cards that lift and reveal
  a quick-detail + WhatsApp CTA on hover, smooth carousel transitions.
- **`prefers-reduced-motion` fully respected** — everything degrades to no-motion.

**Components**
- `ProductCard`, `CategoryFilter`, `TestimonialCarousel`, `WhatsAppButton`
  (floating FAB + inline), `Hero`, `SectionHeading`, `BlogCard`, plus a shared
  responsive nav (hamburger drawer on mobile).

**Responsiveness — mobile-first, strict** (via `responsive` skill guardrails)
- Single-column base scaling up; product grid 1 → 2 (sm) → 3 (lg); touch targets
  ≥44px; WhatsApp FAB fixed bottom-right on every viewport.
- Verified in a **real browser across breakpoints** during the build, not eyeballed
  in markup.

**Quality bar**
- During implementation, apply the `typography`, `color`, `spacing`, `depth`,
  `motion`, and `responsive` skills as a polish pass so the whole site reads as one
  intentional system. Accessibility: WCAG AA contrast, visible focus states.

### WhatsApp deep links

```
https://wa.me/27670590600?text=Hi%20MelCrochet!%20I'm%20interested%20in%20the%20{Product Name}
```

Product cards inject their own name; floating FAB uses the generic link.

## 6. Admin Panel

- Lives at `/admin` in the same Next.js app, gated by the `mc_admin` cookie.
- `proxy.ts` (Next.js 16's renamed `middleware.ts`) matches `/admin/:path*` (except
  `/admin/login`) and **verifies the JWT** (jose is Edge-compatible), redirecting
  invalid/expired sessions to login.
  Defense in depth: every protected `/api/*` route handler **independently re-verifies**
  via `requireAuth()` — the API is the real security boundary, so a request that skips
  the page still can't mutate data. UI treats a 401 as session-dead → bounce to login.
- Screens: **Login**, **Products** (CRUD + drag-drop image upload, category dropdown,
  price-type toggle, sizes/colours/lead-time, active/feature/delete), **Testimonials**
  (CRUD + optional photo, rating), **Blog** (CRUD: title, cover-image upload, Markdown
  body with live preview, optional YouTube URL, draft/publish toggle), **Enquiries**
  (read-only list, mark read/archived, unread badge).
- Admin screens are **Client Components** (behind auth, interactive), calling the
  same-origin `/api/*` route handlers (the cookie is sent automatically).
- Image replace sends old `publicId` so the API deletes the stale Cloudinary file.
- Category delete guards against removing a category that still has products.

### Out of scope (YAGNI, deferrable)

Analytics dashboard, WYSIWYG rich-text editor (blog uses Markdown), bulk import,
multi-admin roles, product image gallery, blog comments, checkout/payments.

## 7. Error Handling, Validation & Testing

- API: **Zod** schemas validate every route-handler mutation; unknown fields stripped;
  consistent error shape (`{ error, details? }`) with proper status codes.
- Uploads: reject non-images / >5MB with a clean 400 before hitting Cloudinary.
- Frontend: DB/query failure → intact empty layout, "products coming soon" state,
  no crash. Forms show inline + top-level errors. Unknown slug → `notFound()` →
  branded 404.
- Testing (pragmatic):
  - Unit — query/util logic (product filtering, slug generation, `jose` JWT
    sign/verify, WhatsApp link-building).
  - Route handlers — integration tests on critical paths (login, create product,
    submit enquiry, upload auth rejection).
  - Component — logic pieces (`CategoryFilter`, enquiry form validation).
  - Real-browser end-to-end verification of mobile responsiveness and the
    WhatsApp/upload flows before completion.

## 8. Build Order (phases)

1. **Foundation** — Next.js app scaffold, Tailwind + fonts, Prisma schema + migration +
   seed, `lib/prisma.ts` singleton, env config.
2. **API layer** — `lib/queries.ts` (public reads), auth (login/logout/me + `jose` +
   `requireAuth`), `proxy.ts` route gate, uploads → Cloudinary, Zod schemas, route handlers
   for products/categories/testimonials/blog/enquiries, tests.
3. **Public site** — design language/system, Home, Products, About, Blog, Contact,
   WhatsApp.
4. **Admin panel** — login, Products/Testimonials/Blog/Enquiries management, uploads.
5. **Quality + deploy prep** — tests, browser verification across breakpoints,
   Vercel + Railway-Postgres deploy config, README/deploy docs.
