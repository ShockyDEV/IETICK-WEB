"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV, UI } from "@/content/ui";
import { href, LOCALES, LOCALE_LABELS, pick, stripLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";

/**
 * Cabecera fija, oscura y translúcida (se funde con el hero nocturno).
 *
 * El conmutador de idioma usa <a> nativo a propósito: fuerza una navegación
 * completa y evita que el router de Next reutilice el árbol del otro idioma
 * (lección aprendida en iuce-web).
 */
export function SiteHeader({ locale }: { locale: Locale }) {
  const pathname = stripLocale(usePathname() || "/");
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (path: string) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-noche-950/85 text-white backdrop-blur-md supports-[backdrop-filter]:bg-noche-950/70">
      <a
        href="#contenido"
        className="sr-only-focusable absolute left-4 top-3 z-[60] rounded-full bg-oro-400 px-4 py-2 text-sm font-semibold text-noche-900"
      >
        {pick(UI.skip, locale)}
      </a>

      <div className="contenedor flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link href={href(locale, "/")} className="flex shrink-0 items-center" aria-label={`ieTIC 2027 — ${pick(UI.home, locale)}`}>
          <Image
            src="/brand/ietic27-logo-oscuro.png"
            alt=""
            width={718}
            height={348}
            priority
            className="h-10 w-auto sm:h-11"
          />
        </Link>

        <nav aria-label={pick(UI.mainNav, locale)} className="hidden lg:block">
          <ul className="flex items-center gap-1 xl:gap-2">
            {NAV.map((item) => {
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    href={href(locale, item.path)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative rounded-full px-3 py-2 text-[0.9rem] font-medium transition",
                      active ? "text-white" : "text-white/70 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    {pick(item.label, locale)}
                    {active && (
                      <span className="absolute inset-x-3 -bottom-[0.95rem] h-0.5 rounded-full bg-oro-400" aria-hidden />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitch locale={locale} pathname={pathname} />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10 lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            <span className="sr-only">{open ? pick(UI.close, locale) : pick(UI.menu, locale)}</span>
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      <div
        id="menu-movil"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto bg-noche-950/98 lg:hidden"
      >
        <nav aria-label={pick(UI.mainNav, locale)} className="contenedor py-6">
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {NAV.map((item, i) => {
              const active = isActive(item.path);
              return (
                <li key={item.path}>
                  <Link
                    href={href(locale, item.path)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex items-baseline gap-4 py-4 font-display text-2xl font-semibold transition",
                      active ? "text-oro-300" : "text-white hover:text-cian-300",
                    )}
                  >
                    <span className="font-mono text-xs font-medium text-cian-300/70">{String(i + 1).padStart(2, "0")}</span>
                    {pick(item.label, locale)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

function LanguageSwitch({ locale, pathname }: { locale: Locale; pathname: string }) {
  return (
    <div
      className="flex items-center rounded-full border border-white/15 p-0.5 font-mono text-xs"
      role="group"
      aria-label={pick(UI.language, locale)}
    >
      {LOCALES.map((l) => {
        const current = l === locale;
        return current ? (
          <span
            key={l}
            className="rounded-full bg-white/15 px-2.5 py-1 font-semibold text-white"
            aria-current="true"
            lang={LOCALE_LABELS[l].htmlLang}
            title={LOCALE_LABELS[l].long}
          >
            {LOCALE_LABELS[l].short}
          </span>
        ) : (
          <a
            key={l}
            href={href(l, pathname)}
            hrefLang={LOCALE_LABELS[l].htmlLang}
            lang={LOCALE_LABELS[l].htmlLang}
            title={LOCALE_LABELS[l].long}
            className="rounded-full px-2.5 py-1 text-white/65 transition hover:text-white"
          >
            {LOCALE_LABELS[l].short}
          </a>
        );
      })}
    </div>
  );
}
