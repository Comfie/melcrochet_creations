# SEO Foundation — Post-Redesign (2026-10-09)

Technical SEO, structured data, analytics readiness and monitoring for
https://melcrochet.co.za, layered on the approved fashion-editorial redesign
without changing its appearance. Companion to
`2026-10-09-fashion-editorial-redesign.md`.

## 1. Audit — what we found (production, 2026-10-09)

**Already correct, kept as-is:** Next.js 16 App Router with server rendering;
`robots.txt` (allows the site, blocks `/admin` and `/api`, references the sitemap);
a dynamic `sitemap.xml` (51 URLs); `http://` → `https://` 308; trailing-slash
308 (`/products/` → `/products`); canonical tags on product, shop, collections,
custom-orders and journal pages; product `Product` JSON-LD with ZAR
`MadeToOrder` offers and `FAQPage` JSON-LD; `next/image` everywhere with
`sizes`, blur placeholders and Cloudinary `f_auto,q_auto`; alt text on every
`<img>`; `lang="en-ZA"`; branded 404 returning a real 404 for unknown paths and
journal posts; CLS 0 on every page measured.

| # | Issue | Impact |
|---|---|---|
| 1 | Unknown product URLs (`/products/anything`) returned **HTTP 200** (a streamed soft 404). `loading.tsx` at `products/` wrapped `[slug]`, so `notFound()` fired after the 200 header was sent. | Crawl budget; soft-404 reports in Search Console |
| 2 | On dynamic pages (product, shop filters, search) **Googlebot received `<title>`, meta description and `rel=canonical` streamed into `<body>`**. Next 16 streams metadata to non-"HTML-limited" bots, and the main Googlebot isn't on that list. Google only honours canonicals in `<head>`; Lighthouse flagged the product page's meta description as missing (SEO 0.92). | Canonical/title signals unreliable on the pages that matter most |
| 3 | `www.melcrochet.co.za` and `melcrochet-creations.vercel.app` served the full site with **200** (no redirect) — duplicate hosts. | Duplicate content, split signals |
| 4 | No canonical on `/`, `/about`, `/contact`, `/faq`. | Duplicate URL variants (e.g. tracking parameters) can be indexed |
| 5 | `/products?category=<anything>` was indexable with title "Handmade &lt;anything&gt;" and a self-canonical. | Junk URLs can be indexed |
| 6 | Pages that set their own `openGraph` lost the site name, locale and/or share image (Next merges metadata shallowly); no `og:url` outside product pages. | Poor link previews on WhatsApp/Facebook |
| 7 | Home JSON-LD was `LocalBusiness` with no street address, hours or storefront. | Mismatch with Google's LocalBusiness guidelines |
| 8 | No `BreadcrumbList`, `Organization`/`WebSite` or `BlogPosting` structured data. `Product` JSON-LD for quote-only pieces had no offer (invalid for Google's Product results). | Missed rich results; Search Console errors |
| 9 | Listing pages jumped from `<h1>` to `<h3>` (product cards). Two journal posts contain a markdown `# heading`, producing two `<h1>`s. | Weak document outline |
| 10 | Keyword-light titles: product titles never contained "crochet" ("King Throw Blanket – R1600"); category titles were "Handmade Hats"; home title was 83 characters (truncated in results). | Lower relevance for commercial queries |
| 11 | **Thin, duplicate product copy:** 21 of 23 live product descriptions are the seed template "X — handmade by MelCrochet with neat stitches and careful finishing." 4 products have no photo. | Biggest remaining content gap (owner action, §6) |
| 12 | No analytics, no Search Console verification hook. | No measurement |
| 13 | `public/landing-page-hero.jpg` (served as-is at `/landing-page-hero.jpg`) contained iPhone EXIF **including GPS coordinates**. | Privacy |
| 14 | LCP images (home hero, product gallery) had no `fetchpriority="high"`; mobile lab LCP 2.7–3.0 s. | Core Web Vitals |

## 2. What was implemented

**Metadata system — `lib/seo.ts`.** `pageMetadata()` builds title, description,
self-referencing canonical, Open Graph (site name, locale, URL, image) and
Twitter tags for every indexable page. Product titles and descriptions are
generated from catalogue data (`productTitle`, `productMetaDescription`);
category copy is `CATEGORY_SEO`; collection copy is `seo` in `lib/collections.ts`.

**Crawlability.**
- `app/(site)/products/(shop)/` route group: the shop's `loading.tsx` no longer
  wraps product pages → unknown products return a real **404**. URLs unchanged.
- `next.config.ts`:
  - `htmlLimitedBots` = Next's default list + `Googlebot`, so crawlers get
    metadata in `<head>`.
  - 308 redirects from `www.` and the `.vercel.app` production alias to
    `https://melcrochet.co.za` (same path and query, one hop).
  - `X-Robots-Tag: noindex, nofollow` on `/admin` and `/api`.
- Unknown categories, empty categories and search results → `noindex, follow`;
  unknown categories canonicalise to `/products`.
- `robots.ts`: Vercel preview deployments disallow all crawling; production is unchanged.
- `sitemap.ts`: only canonical, indexable URLs; empty categories and collections
  are excluded; `lastModified` comes from catalogue data; image entries use
  Cloudinary-transformed URLs, which have camera metadata stripped.

**Structured data — `components/seo/JsonLd.tsx`.**

| Page | Types |
|---|---|
| Home | `Organization` (logo, founder, Johannesburg/ZA locality only, contact point, social profiles) + `WebSite` |
| Product (fixed price) | `Product` + `Offer` (ZAR, `MadeToOrder`, `NewCondition`) + `BreadcrumbList` |
| Product (quote only) | `BreadcrumbList` only |
| Shop / collection / category | `BreadcrumbList` |
| Journal article | `BlogPosting` (published under the brand) + `BreadcrumbList` |
| FAQ | `FAQPage` (unchanged; Google now shows FAQ rich results only for government and health sites, but the markup is harmless and accurate) |

Not added, deliberately:
- **Ratings or reviews.** Testimonials aren't tied to specific products, and Google doesn't allow self-serving reviews.
- **SKUs.**
- **Stock levels.** Everything is made to order.
- **`shippingDetails` / `hasMerchantReturnPolicy`.** Courier cost is quoted per order, and the returns policy (defects only, within 48 hours) needs Mel's sign-off before it is encoded.
- **`VideoObject`.** Upload dates are unknown.

**Merchant listings:** Product snippets are eligible. Merchant listing
experiences (Shopping tab, free listings) expect an on-site purchase and
shipping/returns data. Ordering here happens on WhatsApp, so treat merchant
listings as out of scope unless Google Merchant Center is set up later.

**Headings & content.**
- Screen-reader-only `<h2>` on shop listings (no visual change).
- Markdown `# headings` in journal posts render as `<h2>`.
- `fetchPriority="high"` on the hero and first gallery image.

**Analytics — `lib/analytics.ts`, `components/analytics/*`.**
- GA4 loads only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set, and never in `/admin`.
- Consent defaults deny all advertising storage and signals; visitors sending
  Global Privacy Control get cookieless measurement only.
- `gtag.js` loads after hydration.

| Event | When | Key parameters |
|---|---|---|
| `view_item` | product page viewed | `items[]`, `value`, `currency` |
| `whatsapp_order_click` | "Order via WhatsApp" (product page) or "Enquire" (product card) | `item_id`, `item_name`, `item_category`, `price`, `colour`, `size`, `link_location` |
| `custom_order_enquiry` | custom-order builder send, custom-orders hero, empty-category CTA | `piece`, `link_location` |
| `contact_form_submit` | contact form sent successfully | `form_location` |
| `whatsapp_click` | any other WhatsApp link | `link_location` (header, footer, floating_button, mobile_menu, announcement_bar, page) |

A WhatsApp click is a **lead**, not a sale. No names, messages or form contents are ever sent.

**Privacy:** EXIF/GPS removed from `public/landing-page-hero.jpg` (pixel data byte-identical).

**Automated checks.**
- Unit tests: `lib/seo.test.ts`, `lib/analytics.test.ts`, `next.config.test.ts`,
  `app/(site)/seo-metadata.test.ts`, plus updated JSON-LD, robots, sitemap and page tests.
- `npm run seo:check -- <base-url>` crawls robots.txt, the sitemap and every listed
  URL as Googlebot. It checks status, head metadata, canonical === sitemap URL,
  one `<h1>`, JSON-LD parsing, alt attributes, internal links, real 404s and
  (against production) host redirects.

## 3. Keyword map (South Africa, en-ZA)

Search-volume and competition figures are deliberately omitted — validate the
priority order with Search Console query data after 4–8 weeks (§7).

| Intent cluster | Primary target page | Supporting pages |
|---|---|---|
| handmade crochet South Africa · crochet products SA | `/` | `/products`, `/about` |
| crochet blankets South Africa · chunky crochet throw | `/products?category=throw-blankets` | `/products?collection=home-living`, throw product pages, journal throw stories |
| crochet baby blankets · newborn crochet gift | `/products?category=baby-blankets` | `/products?collection=baby-kids`, `/products/baby-throw-blanket` |
| crochet baby clothing · crochet baby sweater · kids crochet sweater | `/products?collection=baby-kids` | `baby-sweaters`, `kids-sweaters`, `kids-dresses` categories |
| crochet bags South Africa · crochet laptop/diaper bag | `/products?category=bags` | `/products?collection=bags-accessories`, bag product pages |
| crochet hats South Africa · crochet beanie · bucket hat | `/products?category=hats` | `/products?collection=crochet-fashion`, hat product pages |
| crochet fashion accessories · crochet scrunchies | `/products?collection=bags-accessories` | `scrunchies` category, bandana journal post |
| crochet sweaters (adult) · crochet fashion SA | `/products?collection=crochet-fashion` | `adult-sweaters` category |
| handmade crochet gifts · crochet gift sets | `/products?collection=gifts-custom` | `gift-sets` category |
| custom crochet South Africa · custom crochet order | `/custom-orders` | `custom-orders` category, `/faq` |
| crochet baskets · storage baskets handmade | `/products?category=baskets` | `/products?collection=home-living` |

Category and collection pages keep their existing query-string URLs
(`/products?category=…`). They are crawlable, self-canonical and already
indexed, so moving them to path URLs would need site-wide redirects for
little proven gain. Revisit only if Search Console shows Google
consolidating them.

## 4. Search Console setup (owner)

1. Add a **Domain property** for `melcrochet.co.za` in Search Console and verify
   it with the DNS TXT record at the domain's DNS host. This covers
   http/https/www in one property. *Alternative:* a URL-prefix property for
   `https://melcrochet.co.za/` using the HTML-tag method — put the token in
   Vercel as `GOOGLE_SITE_VERIFICATION` (Production) and redeploy.
2. Sitemaps → submit `https://melcrochet.co.za/sitemap.xml`.
3. URL Inspection → test live URL and request indexing for `/`, `/products`,
   `/collections`, `/custom-orders` and 3–5 key product pages.
4. Watch Indexing → Pages, Enhancements (Breadcrumbs, Product snippets), and
   Performance → Search results.
5. Optional: Bing Webmaster Tools → import from Search Console.

## 5. GA4 setup (owner)

1. In Google Analytics, create a GA4 property (time zone South Africa, currency
   ZAR) and a Web data stream for `https://melcrochet.co.za`. Keep **Enhanced
   measurement** on, including "page changes based on browser history events".
2. In Vercel → Project → Settings → Environment Variables, set
   `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-…` for **Production only**, then redeploy.
3. Admin → Events: mark `whatsapp_order_click`, `custom_order_enquiry` and
   `contact_form_submit` as **Key events**.
4. Admin → Data settings: data retention 14 months; leave Google signals **off**.
5. Link GA4 to Search Console (Admin → Product links).
6. **Before enabling GA4, publish a privacy notice** that mentions Google
   Analytics, as Google's terms require and POPIA expects. A new page, its
   copy and a footer link need owner/design approval.

## 6. Owner content actions (highest impact)

1. **Write real product descriptions.** 21 of 23 are boilerplate. For each:
   - what it is and who it's for;
   - yarn/fibre and feel;
   - dimensions or size range;
   - colours available;
   - care;
   - lead time.

   Aim for 60–150 words, and use the words people search with ("chunky crochet
   throw blanket", "crochet laptop bag"). Then fill `colours`, `sizes` and
   `leadTime` in the admin.
2. **Photograph the 4 products without images** (Adult Beanie Hat, Adult
   Sweater, Large Basket, Medium Basket). Quote-only items without a photo have
   no share image.
3. **Journal posts:** link each post to the products it features (e.g. the
   chunky-throw stories → `/products?category=throw-blankets`); write a unique
   excerpt (it becomes the meta description); avoid `# h1` in the body. Topic
   ideas from the keyword map: "How to wash a crochet blanket", "Choosing a
   throw size for your bed", "Crochet baby gifts", "Custom crochet: how ordering
   works".
4. **Visible headings (needs design approval):** listing `<h1>`s are short
   ("Hats", "Baby & Kids"). "Crochet Hats" / "Crochet Baby & Kids" would add the
   core keyword. Not changed here because it alters approved copy.
5. ~~Confirm the Instagram handle and replace the Facebook short link.~~ Done:
   Instagram @melcrochet_giftedhands, YouTube @melcrochets-85 and the Facebook
   profile URL are in `lib/site.ts` and feed `Organization.sameAs`.
6. **Google Business Profile:** create it as a *service-area business*
   (Johannesburg, address hidden). Only add a street address to the website or
   JSON-LD if customers can actually visit it.

## 7. Monitoring plan

**Days 0–30**
- Verify Search Console and submit the sitemap.
- Check "Pages" for "Soft 404", "Duplicate without user-selected canonical" and
  "Alternate page with proper canonical". The www and `.vercel.app` duplicates
  should move to "Page with redirect".
- Confirm Breadcrumb and Product snippets enhancements report valid items.
- Run `npm run seo:check -- https://melcrochet.co.za` after each deploy.
- In GA4 DebugView, confirm each event fires once per action.

**Days 31–60**
- Search Console → Performance, filtered to country = South Africa: impressions
  and clicks by page and by query cluster (§3).
- Pages with impressions but CTR under 2% → tune their title/description in
  `lib/seo.ts`.
- GA4: Key events by landing page; `whatsapp_order_click` by `item_name` and
  `link_location`.
- Core Web Vitals report (CrUX field data appears once there is enough traffic).

**Days 61–90**
- Compare organic sessions, key events and WhatsApp-order clicks with the
  first 30 days.
- Ask Mel to log which WhatsApp chats came from the site (the prefilled
  message includes the product URL), so leads can be matched with confirmed
  orders.
- Prioritise new journal content and product copy toward the clusters with
  rising impressions.
- Re-run Lighthouse on mobile for `/`, a collection and a product.
