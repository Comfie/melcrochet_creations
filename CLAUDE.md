@AGENTS.md


# CLAUDE.md

## Project

MelCrochet Gifted Hands — A handmade crochet business portfolio and product showcase website for founder Melissa Ruvimbo Buchirai, enabling customers to browse products and order via WhatsApp.

## Stack

- Next.js 16 (App Router), React, TypeScript
- Prisma 7 with `@prisma/adapter-pg` driver adapter + `prisma.config.ts` (Prisma 7 moved the DB URL out of `schema.prisma`)
- PostgreSQL (Railway-hosted — used for both local dev and production, no local Docker DB)
- Tailwind CSS v4 (uses `@theme` directive in `globals.css`, not `tailwind.config.ts`)
- `next/font` — Cormorant Garamond (display/headings) + Manrope (body)
- Cloudinary for image storage (Vercel filesystem is ephemeral)
- JWT-based admin auth (cookie: `HttpOnly; Secure; SameSite=Lax; Path=/`)
- Zod for API validation
- Vitest for testing
- Deployed on Vercel

## Brand

- **Business name:** MelCrochet Gifted Hands (always written exactly this way)
- **Colours (exact hex):** Luxury Black `#151515`, Warm Gold `#C8A24A`, Soft Cream `#F7F0E3`, Warm Taupe `#A78B71`, Deep Brown `#3B2D26`
- **Typography:** Cormorant Garamond (Georgia fallback) for headings/display ≥ 20px, Manrope for body, navigation and product info
- **Derived neutrals (contrast only):** Sand `#EDE3D1` (light banding), Gold Deep `#7D5F1F` (gold-family text on light grounds — brand gold fails AA on cream)
- **Logo:** official SVGs in `public/brand/` — always render via `components/Logo.tsx` (`variant` horizontal|stacked|wordmark|icon|badge, `on` light|dark; reversed artwork has its own ink background, dark grounds only)
- **Design system:** fashion-editorial — see `docs/superpowers/specs/2026-10-09-fashion-editorial-redesign.md`
- **Tone:** Warm, elegant, handmade, trustworthy, professional
- **Domain:** https://melcrochet.co.za (`SITE.url` in `lib/site.ts`)
- **Currency:** ZAR — prices render as `R450`
- **WhatsApp:** 067 059 0600 (`https://wa.me/27670590600`)
- **Instagram:** @melz.crotchet.creations (⚠️ site URL uses `melz_crotchet_creations` — confirm; see `lib/site.ts`)
- **Tagline:** "Providing Warmth, Comfort & Timeless Handmade Creations"

## Categories (12, exact names)

Baby Blankets, Throw Blankets, Bags, Baskets, Hats, Scrunchies, Baby Sweaters, Kids Sweaters, Adult Sweaters, Kids Dresses, Custom Orders, Gift Sets

## Structure

```
app/              — pages and routes (App Router)
app/api/          — route handlers (admin CRUD, uploads, enquiries)
app/admin/        — protected admin panel pages
components/       — React components (Server Components by default)
lib/              — shared utilities (prisma.ts, auth.ts, cloudinary.ts, queries.ts, slug.ts, api-response.ts,
                    collections.ts, policies.ts, catalogue.ts, seo.ts, analytics.ts)
prisma/           — schema, migrations, seed data
prisma.config.ts  — Prisma 7 CLI datasource config (repo root)
docs/             — specs, plans, and project documentation (do NOT delete)
```

## Data Models

Five Prisma models — `Category`, `Product` (with `PriceType` enum: FIXED|QUOTE), `Testimonial`, `Enquiry` (with `EnquiryStatus` enum: NEW|READ|ARCHIVED), `BlogPost`. Soft-delete via `isActive` flag — never hard-delete catalogue rows.

## Commands

- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Test: `npm test`
- Type check: `npx tsc --noEmit`
- DB migrate: `npm run db:migrate`
- DB seed: `npm run db:seed`
- DB studio: `npm run db:studio`
- DB reset: `npm run db:reset`
- SEO crawl check: `npm run seo:check -- <base-url>` (defaults to http://localhost:3000)

## Verification

After every change, run in this order:

1. `npx tsc --noEmit` — fix type errors
2. `npm test` — fix failing tests
3. `npm run lint` — fix lint errors
4. `npm run build` — confirm it builds

## Conventions

- Server Components by default, `"use client"` only when needed (interactivity, hooks, browser APIs)
- Route params, searchParams, `cookies()`, and `headers()` are **async** in Next.js 16 — always `await` them
- Prisma client is a singleton at `lib/prisma.ts` — import as `import prisma from "@/lib/prisma"`. Uses `@prisma/adapter-pg` driver adapter, NOT the old `datasource { url = env() }` pattern
- API route handlers use `lib/api-response.ts` helpers (`jsonError`, `jsonValidationError`)
- Admin routes use `requireAuth` from `lib/auth.ts` — JWT cookie auth, no external auth library
- Image uploads go through Cloudinary via `lib/cloudinary.ts` — never store images on disk
- Slugs generated via `lib/slug.ts` `slugify()` helper
- Collections (customer-facing groups of categories) are static config in `lib/collections.ts` — map any new category there
- Policy copy (lead time, payment, delivery, care, returns) lives only in `lib/policies.ts`
- SEO: every indexable page builds metadata with `pageMetadata()` from `lib/seo.ts` (canonical, Open Graph, Twitter in one place — never set `openGraph` by hand, Next merges it shallowly). Category search copy is `CATEGORY_SEO` in `lib/seo.ts`; collection copy is `seo` in `lib/collections.ts`. JSON-LD components live in `components/seo/JsonLd.tsx` — verified facts only (no invented ratings, reviews, SKUs, stock or addresses)
- Don't put `notFound()` behind a `loading.tsx`/Suspense boundary — it can then only stream a soft 404 (HTTP 200). `/products/[slug]` is deliberately outside the `(shop)` group's `loading.tsx`
- Analytics: GA4 is off unless `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set. Track lead actions with `analyticsAttributes()` (server components) or `trackEvent()` (client) from `lib/analytics.ts`; never send names, messages or other form contents
- SEO regression check: `npm run build && npm start`, then `npm run seo:check` (or `npm run seo:check -- https://melcrochet.co.za`)
- Use `next/image` `preload` (not the deprecated `priority`); use the `shell` utility for page gutters and `label` for uppercase eyebrows
- Use Zod schemas for all API input validation (co-located in `app/api/[resource]/schema.ts`)
- Import alias: `@/*` maps to repo root
- Commits: conventional commit format (`feat:`, `fix:`, `chore:`, etc.) — no AI attribution lines
- Env vars live in `.env` (gitignored) with `.env.example` committed as template

## Key Environment Variables

- `DATABASE_URL` — Railway Postgres (use pooled connection in production)
- `JWT_SECRET` — for admin auth token signing
- `ADMIN_USERNAME` / `ADMIN_PASSWORD_HASH` — admin credentials
- `CLOUDINARY_URL` (or `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` — optional GA4 Measurement ID (Production only)
- `GOOGLE_SITE_VERIFICATION` — optional Search Console HTML-tag token

## Don't

- Don't use `any` — use `unknown` and narrow the type
- Don't skip error handling — always show user feedback
- Don't hardcode config values — they live in `.env`
- Don't use `src/` directory — app code lives at repo root
- Don't hard-delete database rows — use `isActive: false` soft-delete
- Don't store images on Vercel filesystem — use Cloudinary
- Don't use the old Prisma `datasource { url = env("DATABASE_URL") }` syntax — Prisma 7 uses `prisma.config.ts` for CLI and driver adapter at runtime
- Don't install new UI component libraries — build with Tailwind + custom components matching the brand
- Don't delete or modify the `docs/` directory structure without explicit instruction
- Don't add `NEXT_PUBLIC_API_URL` or `WEB_ORIGIN` — everything is same-origin on Vercel

## Reference

- Full spec: `docs/superpowers/specs/2026-07-09-melcrochet-website-design.md`
- Redesign spec: `docs/superpowers/specs/2026-10-09-fashion-editorial-redesign.md`
- SEO foundation (audit, keyword map, Search Console/GA4 setup, monitoring): `docs/superpowers/specs/2026-10-09-seo-foundation.md`
- Foundation plan: `docs/superpowers/plans/2026-07-09-01-foundation.md`
- API layer plan: `docs/superpowers/plans/2026-07-09-02-api-layer.md`