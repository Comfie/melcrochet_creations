"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Form from "next/form";
import { usePathname } from "next/navigation";
import { Menu, MessageCircle, Search, X } from "lucide-react";
import Logo from "@/components/Logo";
import { buildWhatsAppLink } from "@/lib/whatsapp";
import { SITE } from "@/lib/site";

const PRIMARY_LEFT = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  { href: "/collections", label: "Collections" },
];
const PRIMARY_RIGHT = [
  { href: "/about", label: "Our Story" },
  { href: "/custom-orders", label: "Custom Orders" },
  { href: "/contact", label: "Contact" },
];
const SECONDARY = [
  { href: "/blog", label: "Journal" },
  { href: "/faq", label: "Delivery & FAQ" },
];
const MOBILE_PRIMARY = [...PRIMARY_LEFT, ...PRIMARY_RIGHT];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export default function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Lock page scroll behind the full-screen menu; Escape closes either panel.
  useEffect(() => {
    if (!menuOpen && !searchOpen) return;
    const previous = document.body.style.overflow;
    if (menuOpen) document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      setSearchOpen(false);
      menuButtonRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen, searchOpen]);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const closeAll = () => {
    setMenuOpen(false);
    setSearchOpen(false);
  };

  const desktopLink = (link: { href: string; label: string }) => {
    const active = isActive(pathname, link.href);
    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={active ? "page" : undefined}
        className={`label relative whitespace-nowrap py-2 transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-ink after:transition-transform after:duration-500 hover:text-ink ${
          active ? "text-ink after:scale-x-100" : "text-ink/70 after:scale-x-0 hover:after:scale-x-100"
        }`}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[70] bg-ink px-4 py-3 font-sans text-sm text-cream focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      {/* Announcement bar — factual service promise only. */}
      <div className="bg-ink text-cream/80">
        <p className="shell label flex h-9 items-center justify-center gap-2 text-center text-[0.625rem]">
          <span>Handmade to order in South Africa</span>
          <span aria-hidden="true" className="hidden text-gold sm:inline">&middot;</span>
          <a
            href={buildWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden text-cream hover:text-gold sm:inline"
          >
            Order on WhatsApp {SITE.whatsappDisplay}
          </a>
        </p>
      </div>

      <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/92 backdrop-blur-md supports-[backdrop-filter]:bg-cream/85">
        <div className="shell grid h-[4.5rem] grid-cols-[1fr_auto_1fr] items-center gap-4 lg:h-20">
          {/* Left */}
          <div className="flex items-center">
            <button
              ref={menuButtonRef}
              type="button"
              className="-ml-2 flex h-11 w-11 items-center justify-center lg:hidden"
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => {
                setSearchOpen(false);
                setMenuOpen(true);
              }}
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </button>
            <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex xl:gap-8">
              {PRIMARY_LEFT.map(desktopLink)}
            </nav>
          </div>

          {/* Centre */}
          <Link href="/" aria-label={`${SITE.name} — home`} className="text-ink" onClick={closeAll}>
            <Logo />
          </Link>

          {/* Right */}
          <div className="flex items-center justify-end gap-1 lg:gap-6 xl:gap-8">
            <nav aria-label="Secondary" className="hidden items-center gap-6 lg:flex xl:gap-8">
              {PRIMARY_RIGHT.map(desktopLink)}
            </nav>
            <div className="flex items-center gap-1">
              <button
                type="button"
                aria-label={searchOpen ? "Close search" : "Search products"}
                aria-expanded={searchOpen}
                aria-controls="site-search"
                onClick={() => setSearchOpen((v) => !v)}
                className="flex h-11 w-11 items-center justify-center text-ink/80 transition-colors hover:text-ink"
              >
                {searchOpen ? (
                  <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <Search className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                )}
              </button>
              <a
                href={buildWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Order on WhatsApp"
                className="flex h-11 w-11 items-center justify-center text-ink/80 transition-colors hover:text-ink xl:w-auto xl:gap-2 xl:border xl:border-ink/80 xl:px-4 xl:text-ink xl:hover:bg-ink xl:hover:text-cream"
              >
                <MessageCircle className="h-5 w-5 xl:h-4 xl:w-4" strokeWidth={1.5} aria-hidden="true" />
                <span className="label hidden xl:inline">Order</span>
              </a>
            </div>
          </div>
        </div>

        {/* Search panel */}
        <div
          id="site-search"
          hidden={!searchOpen}
          className="absolute inset-x-0 top-full border-b border-ink/10 bg-cream shadow-[0_24px_48px_-24px_rgba(21,21,21,0.25)]"
        >
          <Form action="/products" className="shell flex items-center gap-4 py-6 sm:py-8" onSubmit={closeAll}>
            <label htmlFor="site-search-input" className="sr-only">
              Search the collection
            </label>
            <Search className="h-6 w-6 shrink-0 text-ink/60" strokeWidth={1.25} aria-hidden="true" />
            <input
              ref={searchInputRef}
              id="site-search-input"
              name="q"
              type="search"
              placeholder="Search blankets, bags, sweaters…"
              autoComplete="off"
              className="min-w-0 flex-1 border-0 border-b border-ink/20 bg-transparent py-1 font-display text-2xl placeholder:text-ink/45 focus:border-ink focus:outline-none focus-visible:outline-none focus-visible:shadow-[0_1px_0_0_var(--color-ink)] sm:text-4xl"
            />
            <button type="submit" className="label shrink-0 border-b border-ink pb-1 hover:text-gold-deep">
              Search
            </button>
          </Form>
        </div>
      </header>

      {/* Full-screen mobile menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        hidden={!menuOpen}
        className="fixed inset-0 z-[60] overflow-y-auto bg-ink text-cream lg:hidden"
      >
        <div className="shell flex min-h-full flex-col pb-10">
          <div className="flex h-[4.5rem] items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                menuButtonRef.current?.focus();
              }}
              aria-label="Close menu"
              className="-ml-2 flex h-11 w-11 items-center justify-center"
            >
              <X className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
            </button>
            <Logo />
            <span className="w-11" aria-hidden="true" />
          </div>

          <nav aria-label="Mobile" className="mt-8">
            <ol className="flex flex-col">
              {MOBILE_PRIMARY.map((link, i) => {
                const active = isActive(pathname, link.href);
                return (
                  <li
                    key={link.href}
                    className={`border-b border-cream/10 ${menuOpen ? "enter" : ""}`}
                    style={{ "--i": i } as React.CSSProperties}
                  >
                    <Link
                      href={link.href}
                      onClick={closeAll}
                      aria-current={active ? "page" : undefined}
                      className="flex items-baseline gap-4 py-4"
                    >
                      <span className="label w-6 tabular-nums text-gold">{String(i + 1).padStart(2, "0")}</span>
                      <span className={`font-display text-4xl ${active ? "italic text-gold" : ""}`}>
                        {link.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
            <ul className="mt-8 flex gap-8">
              {SECONDARY.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} onClick={closeAll} className="label text-cream/80 hover:text-cream">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-auto pt-12">
            <a
              href={buildWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center gap-3 bg-gold px-6 font-sans text-xs font-semibold uppercase tracking-[0.18em] text-ink"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Order on WhatsApp
            </a>
            <p className="label mt-6 text-center text-cream/60">
              {SITE.whatsappDisplay} &middot; {SITE.email}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
