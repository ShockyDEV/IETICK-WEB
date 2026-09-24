import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Accessibility, Bus, Car, Landmark, MapPin, Presentation, TrainFront, Users } from "lucide-react";
import { PageArt } from "@/components/ui/page-art";
import { PageHeader } from "@/components/ui/page-header";
import { PendingNote } from "@/components/ui/pending-note";
import { SectionHeading } from "@/components/ui/section-heading";
import { HOTELES } from "@/content/alojamiento";
import { SITE } from "@/content/site";
import { href, isLocale, pick, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getProgramme, tr, type ProgrammeData } from "@/lib/programme";
import { SESSION_TYPE_META } from "@/lib/session-types";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ locale: string }> };

const T = {
  es: {
    eyebrow: "Sede",
    title: "IUCE · Edificio Solís",
    lead: "El congreso se celebra en el Instituto Universitario de Ciencias de la Educación de la Universidad de Salamanca, en el Campus de Educación del Paseo de Canalejas.",
    buildingEyebrow: "El edificio",
    buildingTitle: "Un colegio del siglo XVI para la educación del XXI",
    building: [
      "El IUCE ocupa la primera planta del Edificio Solís, dentro del Campus de Educación (Paseo de Canalejas, 169), a pocos minutos a pie del centro histórico de Salamanca.",
      "El edificio es el antiguo Colegio de la Purísima Concepción de los niños huérfanos —el «Colegio de Huérfanos»—, fundado en 1542 por Francisco de Solís. Entre sus piedras y su claustro, hoy acoge la investigación, la formación y la innovación educativa del Instituto.",
    ],
    spacesEyebrow: "Espacios",
    spacesTitle: "Las salas del congreso",
    spacesLead: "Las sesiones plenarias se celebran en el salón de actos; los talleres y los paneles de comunicaciones, en las aulas del IUCE, las mismas que se reservan a diario en reservas.iuce.usal.es.",
    capacity: (n: number) => `${n} personas`,
    accessible: "Accesible",
    planTitle: "Plano de la primera planta del IUCE",
    planAlt: "Plano de la primera planta del IUCE en el Edificio Solís, con la ubicación de aulas, laboratorios, secretaría y dirección",
    howEyebrow: "Cómo llegar",
    howTitle: "Llegar a Salamanca y al campus",
    how: [
      { icon: "train", title: "En tren", text: "La estación de Salamanca (Paseo de la Estación, s/n) tiene conexiones directas con Madrid, Ávila y Valladolid. Horarios y billetes en renfe.com." },
      { icon: "bus", title: "En autobús", text: "La estación de autobuses (Avda. Filiberto Villalobos, 71-85) conecta Salamanca con las principales ciudades; hay servicio directo con el aeropuerto de Madrid-Barajas." },
      { icon: "car", title: "En coche", text: "Por la A-62 (Valladolid–Portugal) o la A-50 (Ávila–Madrid). El campus está junto al Paseo de Canalejas, con aparcamiento público en la zona." },
      { icon: "bus", title: "Autobús urbano", text: "Varias líneas paran junto al Campus de Educación; consulta el plano de líneas del transporte urbano de Salamanca." },
    ],
    openMap: "Abrir en OpenStreetMap",
    mapTitle: "Mapa de la sede: Paseo de Canalejas, 169, Salamanca",
    stayEyebrow: "Alojamiento",
    stayTitle: "Dónde alojarse",
    stayPending: "Hoteles recomendados: próximamente",
    stayText: "Publicaremos una selección de alojamientos cercanos a la sede y al centro histórico, con las tarifas especiales que se acuerden para las personas inscritas.",
    visit: "El jueves 11, a las 20:00, el programa incluye una visita guiada a la ciudad de Salamanca.",
    visitCta: "Ver en el programa",
  },
  pt: {
    eyebrow: "Local",
    title: "IUCE · Edifício Solís",
    lead: "O congresso realiza-se no Instituto Universitário de Ciências da Educação da Universidade de Salamanca, no Campus de Educação do Paseo de Canalejas.",
    buildingEyebrow: "O edifício",
    buildingTitle: "Um colégio do século XVI para a educação do século XXI",
    building: [
      "O IUCE ocupa o primeiro piso do Edifício Solís, no Campus de Educação (Paseo de Canalejas, 169), a poucos minutos a pé do centro histórico de Salamanca.",
      "O edifício é o antigo Colégio da Puríssima Conceição dos meninos órfãos — o «Colégio de Órfãos» —, fundado em 1542 por Francisco de Solís. Entre as suas pedras e o seu claustro, acolhe hoje a investigação, a formação e a inovação educativa do Instituto.",
    ],
    spacesEyebrow: "Espaços",
    spacesTitle: "As salas do congresso",
    spacesLead: "As sessões plenárias realizam-se no auditório; as oficinas e os painéis de comunicações, nas salas do IUCE, as mesmas que se reservam diariamente em reservas.iuce.usal.es.",
    capacity: (n: number) => `${n} pessoas`,
    accessible: "Acessível",
    planTitle: "Planta do primeiro piso do IUCE",
    planAlt: "Planta do primeiro piso do IUCE no Edifício Solís, com a localização das salas, laboratórios, secretaria e direção",
    howEyebrow: "Como chegar",
    howTitle: "Chegar a Salamanca e ao campus",
    how: [
      { icon: "train", title: "De comboio", text: "A estação de Salamanca (Paseo de la Estación, s/n) tem ligações diretas a Madrid, Ávila e Valladolid. Horários e bilhetes em renfe.com." },
      { icon: "bus", title: "De autocarro", text: "A estação rodoviária (Avda. Filiberto Villalobos, 71-85) liga Salamanca às principais cidades; há serviço direto para o aeroporto de Madrid-Barajas." },
      { icon: "car", title: "De carro", text: "Pela A-62 (Valladolid–Portugal) ou pela A-50 (Ávila–Madrid). O campus fica junto ao Paseo de Canalejas, com estacionamento público na zona." },
      { icon: "bus", title: "Autocarro urbano", text: "Várias linhas param junto ao Campus de Educação; consulta o mapa de linhas do transporte urbano de Salamanca." },
    ],
    openMap: "Abrir no OpenStreetMap",
    mapTitle: "Mapa do local: Paseo de Canalejas, 169, Salamanca",
    stayEyebrow: "Alojamento",
    stayTitle: "Onde ficar",
    stayPending: "Hotéis recomendados: brevemente",
    stayText: "Publicaremos uma seleção de alojamentos perto do local e do centro histórico, com as tarifas especiais que venham a ser acordadas para os participantes inscritos.",
    visit: "Na quinta-feira, dia 11, às 20:00, o programa inclui uma visita guiada à cidade de Salamanca.",
    visitCta: "Ver no programa",
  },
} as const;

const HOW_ICONS = { train: TrainFront, bus: Bus, car: Car } as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  return pageMetadata(locale, "/sede", T[locale].eyebrow, T[locale].lead);
}

export default async function SedePage({ params }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const t = T[locale];

  let data: ProgrammeData | null = null;
  try {
    data = await getProgramme();
  } catch (e) {
    console.error("[sede] datos no disponibles:", e);
  }
  const visit = data?.sessions.find((s) => s.type === "SOCIAL");
  const { lat, lon } = SITE.venue;
  const bbox = [lon - 0.0065, lat - 0.0032, lon + 0.0065, lat + 0.0032].map((n) => n.toFixed(5)).join(",");

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} lead={t.lead} art={<PageArt />}>
        <p className="mt-6 flex items-center gap-2 text-white/80">
          <MapPin className="h-5 w-5 text-oro-300" aria-hidden /> {SITE.venue.address}
        </p>
      </PageHeader>

      {/* El edificio */}
      <section className="py-20 sm:py-24">
        <div className="contenedor grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading index="01" eyebrow={t.buildingEyebrow} title={t.buildingTitle} />
            <div className="prosa mt-6">
              {t.building.map((p) => (
                <p key={p.slice(0, 20)}>{p}</p>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-5 gap-3">
            <Image
              src="/espacios/edificio-solis-claustro.webp"
              alt={locale === "pt" ? "Claustro do Edifício Solís" : "Claustro del Edificio Solís"}
              width={1000}
              height={750}
              sizes="(min-width: 1024px) 30vw, 60vw"
              className="col-span-3 aspect-[3/4] h-full w-full rounded-3xl object-cover shadow-elevada"
            />
            <div className="col-span-2 flex flex-col gap-3">
              <Image
                src="/espacios/edificio-solis-galeria.webp"
                alt={locale === "pt" ? "Galeria do claustro do Edifício Solís" : "Galería del claustro del Edificio Solís"}
                width={1600}
                height={1201}
                sizes="(min-width: 1024px) 20vw, 40vw"
                className="aspect-square w-full rounded-3xl object-cover"
              />
              <div className="flex flex-1 flex-col justify-end rounded-3xl bg-noche-900 p-5 text-white">
                <Landmark className="h-6 w-6 text-oro-300" aria-hidden />
                <p className="mt-3 font-display text-3xl font-bold">1542</p>
                <p className="text-sm text-white/65">Francisco de Solís</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Espacios */}
      <section id="espacios" className="scroll-mt-24 border-y border-linea bg-papel py-20 sm:py-24">
        <div className="contenedor">
          <SectionHeading index="02" eyebrow={t.spacesEyebrow} title={t.spacesTitle} lead={t.spacesLead} />
          {data && (
            <div className="mt-12 space-y-12">
              {data.venues.map((venue) => {
                const rooms = data!.rooms.filter((r) => r.venueId === venue.id);
                if (!rooms.length) return null;
                return (
                  <div key={venue.id}>
                    <h3 className="flex flex-wrap items-baseline gap-x-3 font-display text-xl font-bold">
                      {tr(venue.name, venue.namePt, locale)}
                      {venue.subtitle && <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-mar-600">{tr(venue.subtitle, venue.subtitlePt, locale)}</span>}
                    </h3>
                    <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                      {rooms.map((room) => (
                        <li key={room.id} id={`sala-${room.id}`} className="tarjeta scroll-mt-28 overflow-hidden">
                          {room.imageUrl ? (
                            <Image src={room.imageUrl} alt={tr(room.name, room.namePt, locale)} width={800} height={600} sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw" className="aspect-[4/3] w-full object-cover" />
                          ) : (
                            <div className="flex aspect-[4/3] w-full items-center justify-center bg-gradient-to-br from-noche-800 to-mar-700 text-cian-300">
                              <Presentation className="h-12 w-12" aria-hidden />
                            </div>
                          )}
                          <div className="p-5">
                            <div className="flex items-start justify-between gap-3">
                              <h4 className="font-display text-lg font-bold">{tr(room.name, room.namePt, locale)}</h4>
                              {room.code && <span className="font-mono text-[0.7rem] text-tinta-tenue">{room.code}</span>}
                            </div>
                            <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-tinta-suave">
                              {room.capacity && (
                                <span className="inline-flex items-center gap-1.5">
                                  <Users className="h-4 w-4 text-mar-600" aria-hidden /> {t.capacity(room.capacity)}
                                </span>
                              )}
                              {room.accessible && (
                                <span className="inline-flex items-center gap-1.5">
                                  <Accessibility className="h-4 w-4 text-mar-600" aria-hidden /> {t.accessible}
                                </span>
                              )}
                            </p>
                            {room.description && <p className="mt-3 text-sm leading-relaxed text-tinta-suave">{tr(room.description, room.descriptionPt, locale)}</p>}
                            {room.equipment.length > 0 && (
                              <ul className="mt-4 flex flex-wrap gap-1.5">
                                {room.equipment.map((e) => (
                                  <li key={e} className="rounded-full bg-mar-50 px-2.5 py-0.5 text-xs text-mar-700">
                                    {e}
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          <figure className="mt-16 overflow-hidden rounded-3xl border border-linea bg-white p-4 sm:p-8">
            <Image src="/espacios/plano-iuce.png" alt={t.planAlt} width={879} height={704} className="mx-auto h-auto w-full max-w-3xl" />
            <figcaption className="mt-4 text-center font-mono text-xs uppercase tracking-[0.14em] text-tinta-tenue">{t.planTitle}</figcaption>
          </figure>
        </div>
      </section>

      {/* Cómo llegar */}
      <section id="como-llegar" className="scroll-mt-24 py-20 sm:py-24">
        <div className="contenedor grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading index="03" eyebrow={t.howEyebrow} title={t.howTitle} />
            <address className="mt-6 not-italic">
              <p className="font-semibold">{pick(SITE.venue.name, locale)}</p>
              <p className="text-tinta-suave">{pick(SITE.venue.building, locale)}</p>
              <p className="text-tinta-suave">{SITE.venue.address}</p>
            </address>
            <ul className="mt-8 space-y-5">
              {t.how.map((h) => {
                const Icon = HOW_ICONS[h.icon as keyof typeof HOW_ICONS];
                return (
                  <li key={h.title} className="flex gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mar-50 text-mar-600">
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
            <div className="overflow-hidden rounded-3xl border border-linea shadow-tarjeta">
              <iframe
                title={t.mapTitle}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`}
                className="h-[26rem] w-full"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <a
              href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`}
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
      <section id="alojamiento" className="scroll-mt-24 border-t border-linea bg-papel py-20 sm:py-24">
        <div className="contenedor grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading index="04" eyebrow={t.stayEyebrow} title={t.stayTitle} />
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
                    {h.offer && <p className="mt-3 rounded-xl bg-oro-50 p-3 text-sm text-oro-800">{pick(h.offer, locale)}</p>}
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
          {visit && (
            <div className="self-end rounded-3xl bg-gradient-to-br from-oro-400 to-oro-500 p-7 text-noche-900">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.14em]">{SESSION_TYPE_META.SOCIAL.label[locale]}</p>
              <p className="mt-3 font-display text-xl font-bold leading-snug">{t.visit}</p>
              <Link href={`${href(locale, "/programa")}?sesion=${visit.id}`} className="mt-5 inline-flex items-center gap-1 font-semibold underline underline-offset-4">
                {t.visitCta} →
              </Link>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
