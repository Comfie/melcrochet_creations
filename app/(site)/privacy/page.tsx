import type { Metadata } from "next";
import Link from "next/link";
import { pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";
import { buildWhatsAppLink } from "@/lib/whatsapp";

/**
 * Privacy notice (POPIA). Describes only what the site actually does — keep
 * it in step with the code: the contact form (app/api/enquiries), WhatsApp
 * ordering (lib/whatsapp.ts), Google Analytics (lib/analytics.ts, only when
 * NEXT_PUBLIC_GA_MEASUREMENT_ID is set), YouTube embeds and hosting. Update
 * PRIVACY_UPDATED whenever a practice changes.
 */
const PRIVACY_UPDATED = { iso: "2026-10-09", label: "9 October 2026" } as const;

export const metadata: Metadata = pageMetadata({
  title: "Privacy Notice",
  description:
    "How MelCrochet Gifted Hands collects, uses and protects your personal information — contact form, WhatsApp orders, Google Analytics and your POPIA rights.",
  path: "/privacy",
});

type Section = { id: string; title: string; body: React.ReactNode };

const LINK = "font-semibold text-ink underline underline-offset-4 hover:text-brown";

const SECTIONS: Section[] = [
  {
    id: "who-we-are",
    title: "Who we are",
    body: (
      <>
        <p>
          {SITE.name} is a handmade crochet business based in {SITE.locality}, South Africa, run by
          founder Melissa Ruvimbo Buchirai, who is responsible for your personal information
          (our Information Officer under the Protection of Personal Information Act, 2013 — POPIA).
        </p>
        <p>
          Questions about this notice or your information:{" "}
          <a href={`mailto:${SITE.email}`} className={LINK}>
            {SITE.email}
          </a>{" "}
          or WhatsApp {SITE.whatsappDisplay}.
        </p>
      </>
    ),
  },
  {
    id: "what-we-collect",
    title: "What we collect and why",
    body: (
      <>
        <p>
          <strong>Contact form.</strong>{" "}
          When you send a message on our{" "}
          <Link href="/contact" className={LINK}>
            contact page
          </Link>
          , we receive your name and message, plus your email address and phone number if you
          choose to give them. We use these only to reply to you and to help with your order or
          question.
        </p>
        <p>
          <strong>WhatsApp orders and enquiries.</strong>{" "}
          Our &ldquo;Order via WhatsApp&rdquo; and
          custom-order buttons open WhatsApp with a message already filled in — for example the
          product, the colour and size you chose, and a link to the product. Nothing is sent until
          you press send in WhatsApp. Once you do, your conversation with us takes place on
          WhatsApp (operated by Meta) and is also covered by WhatsApp&apos;s own privacy policy. We
          use what you share there to quote, make and deliver your order.
        </p>
        <p>
          <strong>Website analytics.</strong>{" "}
          We use Google Analytics to understand how visitors
          use the site — for example which pages and products are viewed, how people arrive, the
          type of device and browser, approximate location (country or city) and whether a
          WhatsApp or enquiry button was tapped. This helps us improve the site and see which
          pieces people are interested in. We never send your name, contact details or the content
          of your messages to Google Analytics. See{" "}
          <a href="#cookies" className={LINK}>
            Cookies and analytics
          </a>{" "}
          below.
        </p>
        <p>
          <strong>Technical information.</strong>{" "}
          Like all websites, our hosting provider
          automatically processes technical data such as your IP address and browser details to
          deliver pages securely and to protect the site from abuse (for example, limiting
          repeated contact-form submissions).
        </p>
      </>
    ),
  },
  {
    id: "cookies",
    title: "Cookies and analytics",
    body: (
      <>
        <p>
          The shop itself does not need cookies to work. Google Analytics sets first-party cookies
          (named <code>_ga</code> and <code>_ga_…</code>) to recognise returning visits. We have
          configured it with advertising features, ad personalisation and Google signals switched
          off, so it is not used to show you ads.
        </p>
        <p>
          If your browser sends a{" "}
          <a href="https://globalprivacycontrol.org" target="_blank" rel="noopener noreferrer" className={LINK}>
            Global Privacy Control
          </a>{" "}
          signal, we tell Google Analytics not to store analytics cookies. You can also block or
          delete cookies in your browser settings, or install Google&apos;s{" "}
          <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className={LINK}>
            Analytics opt-out browser add-on
          </a>
          . More about how Google uses this data:{" "}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
            className={LINK}
          >
            How Google uses information from sites that use its services
          </a>
          .
        </p>
        <p>
          Some journal stories include YouTube videos. These use YouTube&apos;s privacy-enhanced
          mode, so YouTube does not set cookies until you choose to play a video.
        </p>
      </>
    ),
  },
  {
    id: "sharing",
    title: "Who we share it with",
    body: (
      <>
        <p>
          We don&apos;t sell or rent your personal information. We share it only with the service
          providers that run this website and our ordering, and only for that purpose: website
          hosting (Vercel), our database host (Railway), image hosting (Cloudinary), Google
          Analytics (Google), WhatsApp (Meta), and the courier you choose when we arrange delivery
          of your order.
        </p>
        <p>
          Some of these providers store information on servers outside South Africa. We use
          established providers that protect personal information under their own data-protection
          terms, as POPIA requires for cross-border transfers.
        </p>
      </>
    ),
  },
  {
    id: "retention",
    title: "How long we keep it",
    body: (
      <p>
        We keep contact-form messages and order conversations for as long as we need them to
        answer you, complete your order and keep reasonable business records, and then delete
        them. Google Analytics data is kept for a maximum of 14 months. You can ask us to delete
        your information sooner (see below).
      </p>
    ),
  },
  {
    id: "security",
    title: "How we protect it",
    body: (
      <p>
        The site is served only over encrypted HTTPS, contact-form messages are stored in a
        password-protected database that only we can access, and we collect only what we need to
        help you.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <>
        <p>Under POPIA you may ask us to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>confirm whether we hold personal information about you, and give you a copy;</li>
          <li>correct or update information that is wrong or out of date;</li>
          <li>delete your information, where we no longer need to keep it;</li>
          <li>stop using your information, or object to how we use it.</li>
        </ul>
        <p>
          Email{" "}
          <a href={`mailto:${SITE.email}`} className={LINK}>
            {SITE.email}
          </a>{" "}
          or{" "}
          <a href={buildWhatsAppLink("Hi MelCrochet, I have a question about my personal information.")} target="_blank" rel="noopener noreferrer" className={LINK}>
            message us on WhatsApp
          </a>{" "}
          and we&apos;ll respond as soon as we can. If you&apos;re unhappy with how we handle your
          information, you may complain to the{" "}
          <a href="https://inforegulator.org.za" target="_blank" rel="noopener noreferrer" className={LINK}>
            Information Regulator (South Africa)
          </a>
          .
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        We make pieces for babies and children, but this website is meant for adults. We don&apos;t
        knowingly collect personal information from children — please ask a parent or guardian to
        get in touch on a child&apos;s behalf.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this notice",
    body: (
      <p>
        If we change how we handle personal information, we&apos;ll update this page and the date
        at the top.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <>
      <section className="bg-cream">
        <div className="shell pb-16 pt-14 sm:pb-20 sm:pt-20">
          <p className="label text-gold-deep">Client Care</p>
          <h1 className="mt-6 max-w-4xl text-display">Privacy Notice</h1>
          <p className="mt-6 max-w-xl font-sans leading-relaxed text-ink/70">
            How we collect, use and protect your personal information when you browse our site,
            send us a message or order on WhatsApp.
          </p>
          <p className="label mt-6 text-ink/65">
            Last updated <time dateTime={PRIVACY_UPDATED.iso}>{PRIVACY_UPDATED.label}</time>
          </p>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-cream py-20 sm:py-28">
        <div className="shell grid gap-14 lg:grid-cols-12">
          <nav aria-label="On this page" className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <p className="label text-gold-deep">On this page</p>
              <ol className="mt-5 flex flex-col gap-3 font-sans text-sm text-ink/75">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="hover:text-ink">
                      {s.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <div className="lg:col-span-7 lg:col-start-6">
            {SECTIONS.map((s) => (
              <section key={s.id} id={s.id} aria-labelledby={`${s.id}-title`} className="scroll-mt-28 border-t border-ink/15 py-10 first:border-t-0 first:pt-0">
                <h2 id={`${s.id}-title`} className="font-display text-2xl sm:text-[1.75rem]">
                  {s.title}
                </h2>
                <div className="mt-5 space-y-4 font-sans text-[0.9375rem] leading-relaxed text-ink/75 [&_code]:font-mono [&_code]:text-[0.8125rem] [&_strong]:text-ink">
                  {s.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
