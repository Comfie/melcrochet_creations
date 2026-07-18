# About Page Polish — Design

**Date:** 2026-07-19
**Author:** Comfort Nyatsine
**Status:** Approved, pending self-review

## Context

The landing-page redesign (`docs/superpowers/specs/2026-07-18-landing-page-and-image-performance-design.md`) added a real founder photo (`public/melissa.jpg`) and established a "real photography carrying each section" visual language for the site, but never touched `app/(site)/about/page.tsx` — an oversight caught after the fact. The About page still uses `ImagePlaceholder` for Melissa's photo despite the real photo now existing, and its hero is a flat `bg-ink` text block with no visual richness compared to the polished home page hero.

## Decisions locked during brainstorming

1. **Scope:** full section-by-section refresh — hero, bio photo, Mission/Vision, and Values grid all get attention (not just the photo swap).
2. **Photo reuse:** `melissa.jpg` is used in both the hero (full-bleed background) and the bio section (framed portrait) — same page, same founder, repetition is fine and reinforcing.

## Design

### Hero
Replace the flat `bg-ink` text-only block with a full-bleed `melissa.jpg` background (`next/image fill`), the same dark gradient scrim treatment as the home page hero (`bg-gradient-to-t from-ink/85 via-ink/55 to-ink/35`), an uppercase eyebrow label ("Our Story") above the `h1`, and `min-h-[60vh]` (shorter than home's `70vh` — no CTA row here, just a title moment).

### Bio section
Replace `ImagePlaceholder` with the real photo via `next/image`, reframed from the current `aspect-[4/3]` (landscape) to `aspect-[3/4]` (portrait) to match the photo's actual 1200×1600 orientation and the home page's framing of the same image — the existing landscape crop would awkwardly crop a portrait photo. Text content and layout order (`order-1`/`order-2` responsive swap) unchanged.

### Mission / Vision cards
Add one small `text-brown` lucide icon per card, above the existing "Mission"/"Vision" eyebrow label: `Compass` for Mission, `Eye` for Vision. Brown (not gold) because these cards sit on light `bg-cream` — gold fails the documented contrast rule there. Purely decorative (`aria-hidden`), the eyebrow text remains the accessible label.

### Values grid
Each of the 6 values currently floats as bare text on `bg-ink`. Wrap each in a bordered tile (`border border-cream/10 p-6`) with a small `text-gold` lucide icon above the name (gold is fine here — `bg-ink` background) and a subtle hover treatment (`transition-colors hover:border-gold/40`) echoing the category-tile hover polish from the home page. Icon mapping:

| Value | Icon |
|---|---|
| Quality | `Sparkles` |
| Creativity | `Palette` |
| Excellence | `Star` |
| Integrity | `ShieldCheck` |
| Customer Satisfaction | `Heart` |
| Professionalism | `Briefcase` |

All six icon names verified to exist in the installed `lucide-react` version.

## Out of scope

- Nav/Footer — unchanged.
- Copy — unchanged (Melissa's bio text, Mission/Vision statements, Values descriptions).
- No new UI libraries — `lucide-react` is an existing dependency already used elsewhere (Nav, Footer, WhatsAppButton, TestimonialsCarousel).
- No schema/query changes — this page has no DB dependency.

## Global constraints

- No `any`.
- Brand tokens only (`bg-ink`, `text-cream`, `bg-gold`/`text-gold`, `text-brown`, `border-taupe/*`, `font-display`, `font-sans`) — never generic Tailwind grays.
- Gold/taupe contrast rule: `text-gold` only on `bg-ink` or a dark scrim; `text-brown` on light backgrounds.
- Commits: conventional format, no AI attribution lines. Only commit when explicitly asked.

## Testing

- Existing `app/(site)/about/page.test.ts` (metadata-only assertions) must keep passing.
- No new test file required — this is a static server component with no data-fetching or interactive behavior to unit test; verification is `tsc`/`build` clean plus a manual browser check (screenshot) of the rendered page.
