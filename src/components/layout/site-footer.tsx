import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { LEGAL_NAV, NAV, UI } from "@/content/ui";
import { SITE } from "@/content/site";
import { href, pick, type Locale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="relative overflow-hidden bg-noche-950 text-white/75">
      {/* filete dorado superior */}
      <div className="h-px bg-gradient-to-r from-transparent via-oro-400/60 to-transparent" aria-hidden />

      <div className="contenedor grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Image src="/brand/ietic27-logo-oscuro.png" alt="ieTIC 2027" width={718} height={348} className="h-16 w-auto" />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/65">{pick(UI.footerAbout, locale)}</p>
          <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-cian-300">
            {pick(SITE.datesLabel, locale)} · {SITE.city}
          </p>
        </div>

        <nav aria-label={pick(UI.sections, locale)} className="lg:col-span-3">
          <h2 className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-white/50">
            {pick(UI.sections, locale)}
          </h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm lg:grid-cols-1">
            {NAV.map((item) => (
              <li key={item.path}>
                <Link href={href(locale, item.path)} className="transition hover:text-white">
                  {pick(item.label, locale)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-4">
          <h2 className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-white/50">
            {pick(UI.venueTitle, locale)}
          </h2>
          <address className="mt-4 space-y-3 text-sm not-italic">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-oro-400" aria-hidden />
              <span>
                <span className="block font-medium text-white">{pick(SITE.venue.name, locale)}</span>
                {pick(SITE.venue.building, locale)}
                <br />
                {SITE.venue.address}
              </span>
            </p>
            <p className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-oro-400" aria-hidden />
              <a href={`mailto:${SITE.venue.email}`} className="transition hover:text-white">
                {SITE.venue.email}
              </a>
            </p>
            <p className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-oro-400" aria-hidden />
              <a href={`tel:${SITE.venue.phone.replace(/\s/g, "")}`} className="transition hover:text-white">
                {SITE.venue.phone}
              </a>
            </p>
          </address>
          <Link href={`${href(locale, "/sede")}#como-llegar`} className="mt-4 inline-block text-sm font-medium text-cian-300 hover:text-white">
            {pick(UI.howToGet, locale)} →
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="contenedor flex flex-col gap-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-6">
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.16em] text-white/45">{pick(UI.organiza, locale)}</span>
            <a href="https://www.usal.es" target="_blank" rel="noopener noreferrer" aria-label="Universidad de Salamanca">
              <Image src="/brand/usal-logo-blanco.png" alt="" width={854} height={232} className="h-9 w-auto opacity-85 transition hover:opacity-100" />
            </a>
            <a href={SITE.venue.web} target="_blank" rel="noopener noreferrer" aria-label="IUCE — Instituto Universitario de Ciencias de la Educación">
              <Image src="/brand/iuce-logo-blanco.png" alt="" width={1200} height={543} className="h-10 w-auto opacity-85 transition hover:opacity-100" />
            </a>
          </div>
          <div className="flex flex-col gap-3 text-xs text-white/50 md:items-end">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL_NAV.map((item) => (
                <li key={item.path}>
                  <Link href={href(locale, item.path)} className="transition hover:text-white">
                    {pick(item.label, locale)}
                  </Link>
                </li>
              ))}
            </ul>
            <p>
              © {SITE.year} ieTIC · {pick(UI.rights, locale)}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
