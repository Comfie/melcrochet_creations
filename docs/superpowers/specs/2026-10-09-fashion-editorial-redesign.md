# MelCrochet — Fashion Editorial Redesign

**Date:** 2026-10-09
**Scope:** Complete visual and UX redesign of the public site (`app/(site)`), shared components and design tokens. No schema, API or admin changes.

---

## 1. Audit (before)

### Colour identity — verified, preserved exactly

Verified against the live site's compiled CSS (`melcrochet.co.za`) and `app/globals.css`:

| Token | Hex | Role |
|---|---|---|
| `ink` — Luxury Black | `#151515` | Primary dark ground, text |
| `gold` — Warm Gold | `#C8A24A` | Accent on dark grounds only |
| `cream` — Soft Cream | `#F7F0E3` | Primary light ground |
| `taupe` — Warm Taupe | `#A78B71` | Hairlines, decorative strokes |
| `brown` — Deep Brown | `#3B2D26` | Secondary dark ground, text accent |

**Logo:** the official MelCrochet logo pack (`MelCrochet-Logo-Files`) is installed in `public/brand/`. It contains horizontal, primary-stacked, wordmark, icon, badge and pattern artwork, each with a light-ground and a reversed (ink-ground) version, all drawn in the exact brand hex values.

- `components/Logo.tsx` serves every variant.
- The header uses the horizontal logo; the mobile menu uses its reversed version.
- The footer uses the stacked reversed logo.
- Our Story carries the badge as a seal on the founder portrait.
- The pattern textures photo placeholders and the "Made for you" tiles.
- The favicon, `icon.svg` and `apple-icon.png` come from the reversed small icon. The default `opengraph-image.png` is the stacked logo on cream.

### Weaknesses found

- Generic template structure: centred hero, small square category cards, a bordered card grid, and a single carousel.
- Product photos are shot **portrait (3:4)** on phones, but every card cropped them **1:1**, cutting off parts of the pieces.
- Gold was barely used, and only on ink; on cream it fails contrast (2.12:1), so the brand accent was missing from most of the site.
- Flat hierarchy: one heading size per section, with little contrast between headings and body text.
- The 12 categories were shown as a flat list with no customer-friendly grouping.
- There was no custom-order page, even though custom work is a core part of the business.
- Policy text (lead times, payment, delivery) lived only on the FAQ page.
- The Instagram handle is inconsistent: CLAUDE.md says `@melz.crotchet.creations`, the URL and footer use `melz_crotchet_creations`. **Action: confirm the real handle** (`lib/site.ts`).

---

## 2. Creative direction

**Positioning:** a contemporary South African crochet label, presented with the editorial confidence of a fashion house.

### Colour system

- The five brand colours are unchanged.
- Two **derived neutrals** were added, and only to fix contrast and hierarchy:
  - `sand #EDE3D1`: a deeper cream for alternating sections and empty image areas.
  - `gold-deep #7D5F1F`: a gold-family shade for gold-intended text on light grounds (5.25:1 on cream, 4.68:1 on sand).
- Section rhythm alternates cream → ink → sand → deep brown, so each colour has a deliberate job:
  - ink for the hero and craft sections
  - brown for bespoke
  - sand for founder and editorial pages

### Typography

- **Display:** Cormorant Garamond (variable, roman + italic). Used for headlines, pull quotes and numerals, only at 20px and above. Italics carry the emphasis words ("*Distinctively*", "*Made by Hand.*"). Lining figures are on.
- **Sans:** Manrope. Used for navigation, product information and body copy.
- **Labels:** the `label` utility: 11px, 600 weight, 0.22em tracking, uppercase.
- **Fluid scale:** `text-mega`, `text-hero`, `text-display`, `text-section`, `text-lede`, all built with `clamp()`.

### Layout and grid

- `shell` utility: max width 90rem; gutters of 20 / 32 / 56px.
- 12-column asymmetric compositions with staggered offsets.
- Numbered editorial eyebrows ("01 — Curated Collections").
- Square corners throughout. The rounded pills were removed.

### Image treatment

- Portrait 3:4 crops use Cloudinary `g_auto` (the `portrait` preset).
- 4:5 crops (`gallery`) are used for editorial frames; 16:10 crops (`wide`) for the journal.
- Product images zoom slowly on hover, and a second gallery image is revealed when one exists.
- The "Art of Making" texture close-up is a CSS crop of the real founder photo. No stock or generated imagery is used anywhere.

### Motion

All motion respects `prefers-reduced-motion`.

- Staggered entrance on hero copy.
- CSS scroll-driven reveals (`.reveal`, `.reveal-img`), progressively enhanced with **zero JS**: browsers without support simply show the content.
- A slow category marquee that stops under reduced motion.
- Restrained hover transitions using `--ease-editorial`.

---

## 3. What changed

| Area | Change |
|---|---|
| Navigation | Announcement bar; split desktop nav (Home, Shop, Collections / Our Story, Custom Orders, Contact) around a centred wordmark; search panel; WhatsApp "Order" button; full-screen numbered mobile menu (Escape closes it, body scroll is locked); skip link. |
| Home | Cinematic split hero ("Handcrafted. *Distinctively* Yours."), category marquee, brand statement, asymmetric 5-collection showcase, signature pieces (swipe rail on mobile), "The Art of Making", founder profile, bespoke feature, testimonials (real ones only; the section is hidden when there are none), journal teaser, studio gallery linking to Instagram. |
| Collections | **New `/collections` page.** The 5 collections are static config in `lib/collections.ts` and together cover all 12 categories (enforced by a test). |
| Shop | Editorial header, sticky collection tabs, category rail scoped to the active collection, search (`?q=`, `noindex`), 3:4 product grid, bespoke prompt after 7 items, empty states, loading skeleton. New `?collection=` filter; `?category=` URLs are unchanged. |
| Product | Breadcrumbs; 3:4 gallery with swipe, arrows, counter and full-screen lightbox; sticky info column; variant selector; reassurance copy; accordion (made to order, customisation, care, delivery & payment, returns); "You may also like". |
| Custom Orders | **New `/custom-orders` page:** hero, personalisation options, 4-step process, live WhatsApp request builder, starting-point products, custom-order FAQ. |
| Our Story | Five-part editorial feature: opening spread, The Maker, The Craft, Mission & Vision, Values, then a closing CTA. |
| Journal | `/blog` (URL unchanged) is restyled as "The Journal", with a lead story and numbered entries; articles get a drop cap, editorial header and "More from the Journal". |
| FAQ / Contact | "At a glance" policy strip, numbered accordion with anchors (`/faq#delivery`), split contact layout. |
| Shared content | `lib/policies.ts` is the single source for lead times, payment, delivery, care and returns. |
| Errors | Branded `error.tsx` (retry + WhatsApp fallback) and a branded 404 page. |

All existing URLs keep working: `/`, `/products`, `/products?category=…`, `/products/[slug]`, `/about`, `/blog`, `/blog/[slug]`, `/faq`, `/contact`, and all admin routes. The sitemap adds `/collections`, `/custom-orders`, `/blog` and the collection URLs.

### Business model preserved

- Ordering stays on WhatsApp. No checkout or online payment was added.
- Prefilled messages are richer:
  - the product page includes the size, colour and product URL
  - the custom-order builder includes the piece, colours, size, needed-by date and notes
- No new claims, discounts, ratings or availability promises were added. All policy text is reused verbatim from the existing FAQ.

---

## 4. Photography brief (to commission)

The current imagery is authentic but casual (phone shots, domestic backgrounds, a market stall). The layouts are built to be upgraded image by image, with no code changes needed for catalogue photos.

| Priority | Shot | Used in |
|---|---|---|
| 1 | **Campaign hero:** a model wearing a statement crochet piece (adult sweater or ruffle bucket hat), warm natural light, plain wall or South African landscape. Landscape and portrait crops. | Home hero (`public/landing-page-hero.jpg`) |
| 2 | **Founder portrait:** Melissa at work, hands visible with yarn and hook, plus one styled portrait. | Founder feature, Our Story |
| 3 | **Studio product set:** every product on a seamless cream (#F7F0E3) or sand backdrop, shot 3:4 portrait, front plus 1–2 detail shots. | All product cards and galleries (upload via admin) |
| 4 | **Texture macros:** stitch close-ups for each yarn type (chunky chenille, cotton, acrylic). | Art of Making, Our Story "The Craft" |
| 5 | **Lifestyle:** throws in a living room, baby blanket in a nursery, bag carried on the street. | Collections pages, bespoke feature |
| 6 | **Adult Sweaters, Custom Orders and Gift Sets** currently have no photography. Their tiles render a typographic "Made for you" panel until photos exist. | Collections, shop |

---

## 5. Verification notes

- Visual QA (375 / 768 / 1280 / 1600px, no horizontal overflow) covered the DB-free pages: About, FAQ, Contact and 404, plus the nav, the mobile menu and search.
- DB-backed pages (Home, Shop, Product, Collections, Custom Orders, Journal) compile and type-check but have not been reviewed rendered. The live Railway Postgres (`hayabusa.proxy.rlwy.net:16010`) is a raw-TCP connection, which the cloud session's network proxy does not carry. Review these pages on a Vercel preview deployment of this branch, or run `npm run dev` locally.
- `SITE.url` is now `https://melcrochet.co.za`. Both the bare domain and `www.` currently serve the site with 200 responses, so add a www → bare-domain redirect in Vercel → Domains to avoid duplicate URLs.
