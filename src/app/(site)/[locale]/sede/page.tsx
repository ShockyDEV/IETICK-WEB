import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bus, Car, Landmark, MapPin, TrainFront } from "lucide-react";
import { PageArt } from "@/components/ui/page-art";
import { PageHeader } from "@/components/ui/page-header";
import { sectionColor } from "@/content/ui";
import { PendingNote } from "@/components/ui/pending-note";
import { SectionHeading } from "@/components/ui/section-heading";
import { HOTELES } from "@/content/alojamiento";
import { SITE } from "@/content/site";
import { href, isLocale, pick, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { tr } from "@/lib/programme";
import { loadProgramme } from "@/lib/programme-data";
import { monthShort, shortDay } from "@/lib/programme-format";
import { SESSION_TYPE_META } from "@/lib/session-types";

type Props = { params: Promise<{ locale: string }> };

const T = {
  es: {
    eyebrow: "Sede",
    title: "La Facultad de Educación",
    lead: "El congreso se celebra en la Facultad de Educación de la Universidad de Salamanca, en el Campus de Educación del Paseo de Canalejas, a pocos minutos a pie del centro histórico.",
    buildingEyebrow: "Los edificios",
    buildingTitle: "Dos edificios en el Campus de Educación",
    cossio: {
      name: "Edificio Cossío",
      org: "Facultad de Educación",
      text: [
        "El Edificio Cossío es la sede de la Facultad de Educación de la Universidad de Salamanca. En sus aulas se forman los futuros maestros y maestras de Educación Infantil y Primaria, pedagogos y educadores sociales, y se imparten másteres como el de Las TIC en Educación o el de Profesorado de Educación Secundaria.",
      ],
      alt: "Fachada de ladrillo del Edificio Cossío, sede de la Facultad de Educación",
      credit: "Foto: Facultad de Educación, Universidad de Salamanca",
    },
    solis: {
      name: "Edificio Solís",
      org: "Instituto Universitario de Ciencias de la Educación (IUCE)",
      text: [
        "El IUCE ocupa la primera planta del Edificio Solís, en el mismo campus.",
        "El edificio es el antiguo Colegio de la Purísima Concepción de los niños huérfanos —el «Colegio de Huérfanos»—, fundado en 1542 por Francisco de Solís. Entre sus piedras y su claustro, hoy acoge la investigación, la formación y la innovación educativa del Instituto.",
      ],
      web: "Conoce el IUCE en su web",
      altClaustro: "Claustro del Edificio Solís",
      altGaleria: "Galería del claustro del Edificio Solís",
    },
    howEyebrow: "Cómo llegar",
    howTitle: "Llegar a Salamanca y a la Facultad",
    how: [
      { icon: "train", title: "En tren", text: "La estación de Salamanca (Paseo de la Estación, s/n) tiene conexiones directas con Madrid, Ávila y Valladolid. Horarios y billetes en renfe.com." },
      { icon: "bus", title: "En autobús", text: "La estación de autobuses (Avda. Filiberto Villalobos, 71-85) conecta Salamanca con las principales ciudades; hay servicio directo con el aeropuerto de Madrid-Barajas." },
      { icon: "car", title: "En coche", text: "Por la A-62 (Valladolid–Portugal) o la A-50 (Ávila–Madrid). El campus está junto al Paseo de Canalejas, con aparcamiento público en la zona." },
      { icon: "bus", title: "Autobús urbano", text: "Varias líneas paran junto al Campus de Educación; consulta el plano de líneas del transporte urbano de Salamanca." },
    ],
    openMap: "Abrir en OpenStreetMap",
    mapTitle: "Mapa de la sede: Facultad de Educación, Paseo de Canalejas, 169, Salamanca",
    stayEyebrow: "Alojamiento",
    stayTitle: "Dónde alojarse",
    stayPending: "Hoteles recomendados: próximamente",
    stayText: "Publicaremos una selección de alojamientos cercanos a la sede y al centro histórico, con las tarifas especiales que se acuerden para las personas inscritas.",
  },
  pt: {
    eyebrow: "Local",
    title: "A Faculdade de Educação",
    lead: "O congresso realiza-se na Faculdade de Educação da Universidade de Salamanca, no Campus de Educação do Paseo de Canalejas, a poucos minutos a pé do centro histórico.",
    buildingEyebrow: "Os edifícios",
    buildingTitle: "Dois edifícios no Campus de Educação",
    cossio: {
      name: "Edifício Cossío",
      org: "Faculdade de Educação",
      text: [
        "O Edifício Cossío é a sede da Faculdade de Educação da Universidade de Salamanca. Nas suas salas formam-se os futuros educadores de infância e professores do ensino primário, pedagogos e educadores sociais, e lecionam-se mestrados como o de TIC na Educação ou o de Professores do Ensino Secundário.",
      ],
      alt: "Fachada de tijolo do Edifício Cossío, sede da Faculdade de Educação",
      credit: "Foto: Faculdade de Educação, Universidade de Salamanca",
    },
    solis: {
      name: "Edifício Solís",
      org: "Instituto Universitário de Ciências da Educação (IUCE)",
      text: [
        "O IUCE ocupa o primeiro piso do Edifício Solís, no mesmo campus.",
        "O edifício é o antigo Colégio da Puríssima Conceição dos meninos órfãos — o «Colégio de Órfãos» —, fundado em 1542 por Francisco de Solís. Entre as suas pedras e o seu claustro, acolhe hoje a investigação, a formação e a inovação educativa do Instituto.",
      ],
      web: "Conhece o IUCE no seu sítio web",
      altClaustro: "Claustro do Edifício Solís",
      altGaleria: "Galeria do claustro do Edifício Solís",
    },
    howEyebrow: "Como chegar",
    howTitle: "Chegar a Salamanca e à Faculdade",
    how: [
      { icon: "train", title: "De comboio", text: "A estação de Salamanca (Paseo de la Estación, s/n) tem ligações diretas a Madrid, Ávila e Valladolid. Horários e bilhetes em renfe.com." },
      { icon: "bus", title: "De autocarro", text: "A estação rodoviária (Avda. Filiberto Villalobos, 71-85) liga Salamanca às principais cidades; há serviço direto para o aeroporto de Madrid-Barajas." },
      { icon: "car", title: "De carro", text: "Pela A-62 (Valladolid–Portugal) ou pela A-50 (Ávila–Madrid). O campus fica junto ao Paseo de Canalejas, com estacionamento público na zona." },
      { icon: "bus", title: "Autocarro urbano", text: "Várias linhas param junto ao Campus de Educação; consulta o mapa de linhas do transporte urbano de Salamanca." },
    ],
    openMap: "Abrir no OpenStreetMap",
    mapTitle: "Mapa do local: Faculdade de Educação, Paseo de Canalejas, 169, Salamanca",
    stayEyebrow: "Alojamento",
    stayTitle: "Onde ficar",
    stayPending: "Hotéis recomendados: brevemente",
    stayText: "Publicaremos uma seleção de alojamentos perto do local e do centro histórico, com as tarifas especiais que venham a ser acordadas para os participantes inscritos.",
  },
} as const;

const HOW_ICONS = { train: TrainFront, bus: Bus, car: Car } as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  return pageMetadata(locale, "/sede", T[locale].eyebrow, T[locale].lead);
}

function Edificio({ name, org, text, children }: { name: string; org: string; text: readonly string[]; children?: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-display text-2xl font-bold">{name}</h3>
      <p className="nota mt-1 text-mar-700">{org}</p>
      <div className="prosa mt-5">
        {text.map((p) => (
          <p key={p.slice(0, 24)}>{p}</p>
        ))}
      </div>
      {children}
    </div>
  );
}

export default async function SedePage({ params }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const t = T[locale];

  const data = await loadProgramme("sede");
  const socials = data?.sessions.filter((s) => s.type === "SOCIAL") ?? [];
  const { lat, lon } = SITE.venue;
  const bbox = [lon - 0.0065, lat - 0.0032, lon + 0.0065, lat + 0.0032].map((n) => n.toFixed(5)).join(",");

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} lead={t.lead} art={<PageArt />} color={sectionColor("/sede")}>
        <p className="mt-6 flex items-center gap-2 text-white/80">
          <MapPin className="h-5 w-5 text-oro-300" aria-hidden /> {SITE.venue.address}
        </p>
      </PageHeader>

      {/* Los edificios */}
      <section className="py-20 sm:py-24">
        <div className="contenedor">
          <SectionHeading eyebrow={t.buildingEyebrow} title={t.buildingTitle} />

          {/* Edificio Cossío: la Facultad */}
          <div className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <Edificio name={t.cossio.name} org={t.cossio.org} text={t.cossio.text} />
            <figure data-reveal="escala">
              <Image
                src="/espacios/edificio-cossio.webp"
                alt={t.cossio.alt}
                width={934}
                height={526}
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="aspect-[16/9] w-full rounded-xl object-cover shadow-elevada"
              />
              <figcaption className="mt-2 text-xs text-tinta-tenue">{t.cossio.credit}</figcaption>
            </figure>
          </div>

          {/* Edificio Solís: el IUCE */}
          <div className="mt-20 grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <Edificio name={t.solis.name} org={t.solis.org} text={t.solis.text}>
              <a
                href={SITE.venue.iuceWeb}
                target="_blank"
                rel="noopener noreferrer"
                className="enlace mt-5 inline-flex items-center gap-1.5"
              >
                {t.solis.web}: {SITE.venue.iuceWeb.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </a>
            </Edificio>
            <div data-reveal="escala" className="grid grid-cols-5 gap-3 lg:order-first">
              <Image
                src="/espacios/edificio-solis-claustro.webp"
                alt={t.solis.altClaustro}
                width={1000}
                height={750}
                sizes="(min-width: 1024px) 30vw, 60vw"
                className="col-span-3 aspect-[3/4] h-full w-full rounded-xl object-cover shadow-elevada"
              />
              <div className="col-span-2 flex flex-col gap-3">
                <Image
                  src="/espacios/edificio-solis-galeria.webp"
                  alt={t.solis.altGaleria}
                  width={1600}
                  height={1201}
                  sizes="(min-width: 1024px) 20vw, 40vw"
                  className="aspect-square w-full rounded-xl object-cover"
                />
                <div className="flex flex-1 flex-col justify-end rounded-xl bg-noche-900 p-5 text-white">
                  <Landmark className="h-6 w-6 text-oro-300" aria-hidden />
                  <p className="mt-3 font-display text-3xl font-bold">1542</p>
                  <p className="text-sm text-white/65">Francisco de Solís</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cómo llegar */}
      <section id="como-llegar" className="scroll-mt-24 border-y border-linea bg-papel py-20 sm:py-24">
        <div className="contenedor grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading eyebrow={t.howEyebrow} title={t.howTitle} />
            <address className="mt-6 not-italic">
              <p className="font-semibold">{pick(SITE.venue.name, locale)}</p>
              <p className="text-tinta-suave">{pick(SITE.venue.building, locale)}</p>
              <p className="text-tinta-suave">{SITE.venue.address}</p>
            </address>
            <ul className="mt-8 space-y-5">
              {t.how.map((h, i) => {
                const Icon = HOW_ICONS[h.icon as keyof typeof HOW_ICONS];
                return (
                  <li key={h.title} data-reveal style={{ ["--d" as string]: `${i * 80}ms` }} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-mar-50 text-mar-600">
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <p className="font-display font-semibold">{h.title}</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-tinta-suave">{h.text}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="lg:col-span-7">
            <div data-reveal="escala" className="overflow-hidden rounded-xl border border-linea shadow-tarjeta">
              <iframe
                title={t.mapTitle}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`}
                className="h-[26rem] w-full"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <a
              href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`}
              target="_blank"
              rel="noopener noreferrer"
              className="enlace mt-3 inline-flex items-center gap-1 text-sm"
            >
              <MapPin className="h-4 w-4" aria-hidden /> {t.openMap}
            </a>
          </div>
        </div>
      </section>

      {/* Alojamiento */}
      <section id="alojamiento" className="scroll-mt-24 py-20 sm:py-24">
        <div className="contenedor grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow={t.stayEyebrow} title={t.stayTitle} />
            {HOTELES.length === 0 ? (
              <PendingNote title={t.stayPending} className="mt-8">
                {t.stayText}
              </PendingNote>
            ) : (
              <ul className="mt-8 space-y-4">
                {HOTELES.map((h) => (
                  <li key={h.name} className="tarjeta p-5">
                    <p className="flex items-center gap-2 font-display text-lg font-bold">
                      {h.name}
                      {h.stars ? <span className="text-sm text-oro-500" aria-label={`${h.stars} ★`}>{"★".repeat(h.stars)}</span> : null}
                    </p>
                    <p className="mt-1 text-sm text-tinta-suave">{h.address}</p>
                    {h.distance && <p className="mt-1 text-sm text-mar-700">{pick(h.distance, locale)}</p>}
                    {h.offer && <p className="mt-3 rounded-md bg-oro-50 p-3 text-sm text-oro-800">{pick(h.offer, locale)}</p>}
                    <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      {h.web && (
                        <a href={h.web} target="_blank" rel="noopener noreferrer" className="enlace">
                          {h.web.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                        </a>
                      )}
                      {h.phone && <a href={`tel:${h.phone.replace(/\s/g, "")}`} className="enlace">{h.phone}</a>}
                      {h.email && <a href={`mailto:${h.email}`} className="enlace">{h.email}</a>}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {socials.length > 0 && (
            <div className="self-end rounded-xl bg-gradient-to-br from-oro-400 to-oro-500 p-7 text-noche-900">
              <p className="nota text-noche-900/80">{SESSION_TYPE_META.SOCIAL.plural[locale]}</p>
              <ul className="mt-3 space-y-3">
                {socials.map((s) => (
                  <li key={s.id}>
                    <Link href={`${href(locale, "/programa")}?sesion=${s.id}`} className="group block">
                      <span className="block text-sm font-semibold tabular-nums">
                        {shortDay(s.day, locale)} {monthShort(s.day, locale)}, {s.start}–{s.end}
                      </span>
                      <span className="block font-display text-lg font-bold leading-snug underline-offset-4 group-hover:underline">
                        {tr(s.title, s.titlePt, locale)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
