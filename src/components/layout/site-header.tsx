"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { TraceLine } from "@/components/ui/trace-line";
import { NAV, UI, sectionColor } from "@/content/ui";
import { href, LOCALES, LOCALE_LABELS, pick, stripLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/cn";

/**
 * Cabecera fija, oscura y translúcida (se funde con el hero nocturno).
 *
 * Animación propia («punto y estela»), en el espíritu de DIGIFOLK pero con
 * la firma de ieTIC: cada sección tiene su color; al pasar el ratón el punto
 * de la entrada sale disparado bajo la etiqueta dejando una estela recta y
 * las letras se encienden una a una en ola. La sección activa conserva la
 * estela y el filete inferior de la barra toma su color.
 *
 * El conmutador de idioma (ES / PT, sin cápsula) usa <a> nativo a propósito: fuerza una navegación
 * completa y evita que el router de Next reutilice el árbol del otro idioma
 * (lección aprendida en iuce-web).
 */
export function SiteHeader({ locale }: { locale: Locale }) {
  const pathname = stripLocale(usePathname() || "/");
  const [open, setOpen] = useState(false);
  const current = sectionColor(pathname);

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
    <header
      className="sticky top-0 z-50 bg-noche-950/[0.97] text-white backdrop-blur-md supports-[backdrop-filter]:bg-noche-950/90"
      style={{ ["--seccion" as string]: current }}
    >
      <a
        href="#contenido"
        className="sr-only-focusable absolute left-4 top-3 z-[60] rounded-md bg-oro-400 px-4 py-2 text-sm font-semibold text-noche-900"
      >
        {pick(UI.skip, locale)}
      </a>

      <div className="contenedor flex h-[var(--header-h)] items-center justify-between gap-6">
        <Link
          href={href(locale, "/")}
          className="group flex shrink-0 items-center"
          aria-label={`ieTIC 2027 — ${pick(UI.home, locale)}`}
        >
          <Image
            src="/brand/ietic27-logo-oscuro.png"
            alt=""
            width={718}
            height={348}
            priority
            className="h-10 w-auto transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:drop-shadow-[0_0_14px_rgba(152,221,237,0.55)] sm:h-11"
          />
        </Link>

        <nav aria-label={pick(UI.mainNav, locale)} className="hidden lg:block">
          <ul className="flex items-center gap-0.5 xl:gap-1.5">
            {NAV.map((item) => {
              const active = isActive(item.path);
              const label = pick(item.label, locale);
              return (
                <li key={item.path} className={cn("trazo-hover group/nav relative", active && "is-active")} style={{ ["--c" as string]: item.color }}>
                  <Link
                    href={href(locale, item.path)}
                    aria-current={active ? "page" : undefined}
                    aria-label={label}
                    className={cn(
                      "trazo-hover flex flex-col items-start rounded-md px-3 pb-1.5 pt-2 text-[0.9rem] font-medium transition-colors duration-300",
                      active ? "text-[color:var(--c)]" : "text-white/75 hover:text-[color:var(--c)] focus-visible:text-[color:var(--c)]",
                    )}
                  >
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <span
                        className={cn(
                          "h-2 w-2 shrink-0 rounded-full bg-[color:var(--c)] transition duration-300 [transition-timing-function:var(--rebote)] group-hover/nav:scale-[1.45]",
                          active ? "opacity-100 shadow-[0_0_10px_var(--c)]" : "opacity-70 group-hover/nav:opacity-100",
                        )}
                        aria-hidden
                      />
                      <span aria-hidden>
                        {[...label].map((ch, i) => (
                          <span key={i} className="letra" style={{ ["--i" as string]: i }}>
                            {ch === " " ? " " : ch}
                          </span>
                        ))}
                      </span>
                    </span>
                    <TraceLine mode="hover" width={Math.round(label.length * 7.2 + 12)} color={item.color} className="ml-1 mt-1" />
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-white transition hover:bg-white/10 lg:hidden"
            aria-expanded={open}
            aria-controls="menu-movil"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
            <span className="sr-only">{open ? pick(UI.close, locale) : pick(UI.menu, locale)}</span>
          </button>
        </div>
      </div>

      {/* Filete inferior con el color de la sección (cambia con transición) */}
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[color:var(--seccion)] opacity-70 transition-colors duration-500 [mask-image:linear-gradient(90deg,transparent,#000_20%,#000_80%,transparent)]"
        aria-hidden
      />

      {/* Menú móvil: entradas en cadena */}
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
                <li
                  key={item.path}
                  className={cn("trazo-hover", active && "is-active", open && "entra")}
                  style={{ ["--c" as string]: item.color, animationDelay: `${60 + i * 55}ms` }}
                >
                  <Link
                    href={href(locale, item.path)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "trazo-hover flex items-center gap-4 py-4 font-display text-2xl font-semibold transition-colors",
                      active ? "text-[color:var(--c)]" : "text-white hover:text-[color:var(--c)]",
                    )}
                  >
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[color:var(--c)]" aria-hidden />
                    <span className="flex flex-col">
                      {pick(item.label, locale)}
                      <TraceLine mode="hover" width={Math.round(pick(item.label, locale).length * 12 + 8)} color={item.color} thickness={2.5} className="mt-1.5" />
                    </span>
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
    <div className="flex items-center font-display text-[0.8rem] font-semibold tracking-wide" role="group" aria-label={pick(UI.language, locale)}>
      {LOCALES.map((l, i) => {
        const current = l === locale;
        return (
          <span key={l} className="flex items-center">
            {i > 0 && (
              <span className="px-0.5 text-white/25" aria-hidden>
                /
              </span>
            )}
            {current ? (
              <span
                className="relative px-1.5 py-1 text-white after:absolute after:inset-x-1.5 after:bottom-0 after:h-0.5 after:bg-oro-400"
                aria-current="true"
                lang={LOCALE_LABELS[l].htmlLang}
                title={LOCALE_LABELS[l].long}
              >
                {LOCALE_LABELS[l].short}
              </span>
            ) : (
              <a
                href={href(l, pathname)}
                hrefLang={LOCALE_LABELS[l].htmlLang}
                lang={LOCALE_LABELS[l].htmlLang}
                title={LOCALE_LABELS[l].long}
                className="rounded-sm px-1.5 py-1 text-white/55 transition hover:text-white"
              >
                {LOCALE_LABELS[l].short}
              </a>
            )}
          </span>
        );
      })}
    </div>
  );
}
