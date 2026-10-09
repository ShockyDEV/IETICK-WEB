import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { OrganizersBand } from "@/components/layout/organizers-band";
import { LEGAL_NAV, NAV, UI } from "@/content/ui";
import { SITE } from "@/content/site";
import { href, pick, type Locale } from "@/lib/i18n";

export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="relative overflow-hidden bg-noche-950 text-white/75">
      {/* Entidades organizadoras: en color sobre fondo claro */}
      <section aria-labelledby="pie-organizacion" className="border-t border-linea bg-white py-10 sm:py-12">
        <div className="contenedor">
          <h2 id="pie-organizacion" className="nota text-center text-tinta-suave">
            {pick(UI.organiza, locale)}
          </h2>
          <OrganizersBand locale={locale} className="mt-6" />
        </div>
      </section>

      {/* filete dorado superior */}
      <div className="h-px bg-gradient-to-r from-transparent via-oro-400/60 to-transparent" aria-hidden />

      <div className="contenedor grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Image src="/brand/ietic27-logo-oscuro.png" alt="ieTIC 2027" width={718} height={348} className="h-16 w-auto" />
          <p className="mt-5 max-w-md text-sm leading-relaxed text-white/65">{pick(UI.footerAbout, locale)}</p>
          <p className="nota mt-4 text-cian-200">
            {pick(SITE.datesLabel, locale)}, {pick(SITE.where, locale)}
          </p>
          <ul className="mt-5 space-y-2 text-sm">
            {[
              { label: UI.contactSecretaria, email: SITE.contact.secretaria },
            ].map((c) => (
              <li key={c.email} className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-oro-400" aria-hidden />
                <span>
                  <span className="text-white/50">{pick(c.label, locale)}: </span>
                  <a href={`mailto:${c.email}`} className="transition hover:text-white">
                    {c.email}
                  </a>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <nav aria-label={pick(UI.sections, locale)} className="lg:col-span-3">
          <h2 className="nota text-white/55">{pick(UI.sections, locale)}</h2>
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
          <h2 className="nota text-white/55">{pick(UI.venueTitle, locale)}</h2>
          <address className="mt-4 text-sm not-italic">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-oro-400" aria-hidden />
              <span>
                <span className="block font-medium text-white">{pick(SITE.venue.name, locale)}</span>
                {pick(SITE.venue.building, locale)}
                <br />
                {SITE.venue.address}
              </span>
            </p>
          </address>
          <Link href={`${href(locale, "/sede")}#como-llegar`} className="mt-4 inline-block text-sm font-medium text-cian-300 hover:text-white">
            {pick(UI.howToGet, locale)} →
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="contenedor flex flex-col gap-3 py-7 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
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
            © {SITE.year} ieTIC, {pick(UI.rights, locale)}
          </p>
        </div>
      </div>
    </footer>
  );
}
