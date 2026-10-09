/**
 * Crawl-based SEO regression check. Fetches robots.txt and sitemap.xml, then
 * every sitemap URL as Googlebot, and verifies what search engines see in
 * the raw HTML (no JavaScript):
 *   - 200 status, indexable (no noindex), one <h1>
 *   - <title>, meta description and rel=canonical inside <head>
 *   - canonical === the sitemap URL; titles/descriptions unique
 *   - JSON-LD blocks parse; images have alt attributes
 *   - every internal link resolves (no 4xx/5xx), missing pages return 404
 *
 * Usage:
 *   npm run seo:check                          # http://localhost:3000 (after `npm run build && npm start`)
 *   npm run seo:check -- https://melcrochet.co.za
 * Exits 1 when any error is found; warnings don't fail the run.
 */
import { SITE } from "../lib/site";

const GOOGLEBOT =
  "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

const base = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const errors: string[] = [];
const warnings: string[] = [];

/** Sitemap URLs are production URLs; fetch them from `base` instead. */
const toFetchUrl = (url: string) => (url.startsWith(SITE.url) ? base + url.slice(SITE.url.length) : url);

async function get(url: string, attempt = 1): Promise<Response> {
  try {
    return await fetch(url, { headers: { "user-agent": GOOGLEBOT }, redirect: "manual" });
  } catch (error) {
    if (attempt >= 3) throw error;
    await new Promise((r) => setTimeout(r, attempt * 1000));
    return get(url, attempt + 1);
  }
}

function decode(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function attr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`\\s${name}="([^"]*)"`, "i"));
  return match ? decode(match[1]) : null;
}

type PageReport = { url: string; title: string; description: string };

async function checkPage(url: string, internalLinks: Set<string>): Promise<PageReport | null> {
  const res = await get(toFetchUrl(url));
  if (res.status !== 200) {
    errors.push(`${url} → HTTP ${res.status}${res.headers.get("location") ? ` (→ ${res.headers.get("location")})` : ""}`);
    return null;
  }
  const html = await res.text();
  const headEnd = html.indexOf("</head>");
  const head = headEnd === -1 ? "" : html.slice(0, headEnd);
  const where = (found: boolean, inBody: boolean) => (found ? "" : inBody ? " (only in <body> — streamed)" : "");

  const title = head.match(/<title>([\s\S]*?)<\/title>/)?.[1];
  if (!title) errors.push(`${url}: no <title> in <head>${where(false, /<title>/.test(html))}`);

  const descriptionTag = head.match(/<meta name="description"[^>]*>/)?.[0];
  const description = descriptionTag ? attr(descriptionTag, "content") ?? "" : "";
  if (!descriptionTag) errors.push(`${url}: no meta description in <head>${where(false, /<meta name="description"/.test(html))}`);
  else if (description.length < 50 || description.length > 160)
    warnings.push(`${url}: meta description is ${description.length} chars (aim for 50–160)`);

  const canonicalTag = head.match(/<link rel="canonical"[^>]*>/)?.[0];
  const canonical = canonicalTag ? attr(canonicalTag, "href") : null;
  if (!canonical) errors.push(`${url}: no rel=canonical in <head>${where(false, /rel="canonical"/.test(html))}`);
  else if (canonical !== url) errors.push(`${url}: canonical points elsewhere (${canonical})`);

  if (/<meta name="robots"[^>]*noindex/i.test(html)) errors.push(`${url}: is in the sitemap but marked noindex`);
  if (!/<meta property="og:image"/.test(head)) warnings.push(`${url}: no og:image`);

  const h1s = html.match(/<h1[\s>]/g)?.length ?? 0;
  if (h1s !== 1) errors.push(`${url}: has ${h1s} <h1> elements (expected 1)`);

  for (const block of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(block[1]);
    } catch {
      errors.push(`${url}: JSON-LD block does not parse`);
    }
  }

  const missingAlt = [...html.matchAll(/<img\b[^>]*>/g)].filter((m) => !/\salt="/.test(m[0])).length;
  if (missingAlt > 0) errors.push(`${url}: ${missingAlt} <img> without an alt attribute`);

  for (const m of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    const href = decode(m[1]).split("#")[0];
    if (href.startsWith("/") && !href.startsWith("//")) internalLinks.add(href);
  }

  return title ? { url, title: decode(title), description } : null;
}

async function main() {
  console.log(`SEO check against ${base}\n`);

  const robotsRes = await get(`${base}/robots.txt`);
  const robotsTxt = await robotsRes.text();
  if (robotsRes.status !== 200) errors.push(`/robots.txt → HTTP ${robotsRes.status}`);
  if (!robotsTxt.includes(`Sitemap: ${SITE.url}/sitemap.xml`)) errors.push("/robots.txt does not reference the sitemap");
  if (/^Disallow:\s*\/\s*$/m.test(robotsTxt)) errors.push("/robots.txt blocks the whole site");

  const sitemapRes = await get(`${base}/sitemap.xml`);
  const sitemapXml = await sitemapRes.text();
  if (sitemapRes.status !== 200) errors.push(`/sitemap.xml → HTTP ${sitemapRes.status}`);
  const urls = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]));
  if (urls.length === 0) errors.push("/sitemap.xml lists no URLs");
  if (new Set(urls).size !== urls.length) errors.push("/sitemap.xml lists duplicate URLs");
  console.log(`Sitemap: ${urls.length} URLs`);

  const internalLinks = new Set<string>();
  const reports: PageReport[] = [];
  for (const url of urls) {
    const report = await checkPage(url, internalLinks);
    if (report) reports.push(report);
  }

  for (const key of ["title", "description"] as const) {
    const seen = new Map<string, string>();
    for (const r of reports) {
      if (!r[key]) continue;
      const other = seen.get(r[key]);
      if (other) errors.push(`duplicate ${key} on ${other} and ${r.url}: "${r[key]}"`);
      else seen.set(r[key], r.url);
    }
  }

  const sitemapPaths = new Set(urls.map((u) => u.slice(SITE.url.length) || "/"));
  let checkedLinks = 0;
  for (const path of internalLinks) {
    if (path.startsWith("/_next/") || sitemapPaths.has(path)) continue;
    const res = await get(base + path);
    checkedLinks++;
    if (res.status >= 400) errors.push(`broken internal link ${path} → HTTP ${res.status}`);
    else if (res.status >= 300 && res.status < 400)
      warnings.push(`internal link ${path} redirects to ${res.headers.get("location")}`);
  }
  console.log(`Internal links: ${internalLinks.size} unique (${checkedLinks} outside the sitemap fetched)`);

  for (const path of ["/products/seo-check-missing-product", "/blog/seo-check-missing-post", "/seo-check-missing-page"]) {
    const res = await get(base + path);
    if (res.status !== 404) errors.push(`${path} should return 404, got ${res.status}`);
  }

  if (base === SITE.url) {
    for (const variant of ["https://www.melcrochet.co.za/", "http://melcrochet.co.za/"]) {
      const res = await get(variant);
      const location = res.headers.get("location") ?? "";
      if (![301, 308].includes(res.status) || !location.startsWith(SITE.url))
        errors.push(`${variant} should permanently redirect to ${SITE.url} (got ${res.status} ${location})`);
    }
  }

  for (const w of warnings) console.log(`WARN  ${w}`);
  for (const e of errors) console.log(`ERROR ${e}`);
  console.log(`\n${reports.length}/${urls.length} pages passed fetch · ${errors.length} errors · ${warnings.length} warnings`);
  process.exit(errors.length > 0 ? 1 : 0);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
