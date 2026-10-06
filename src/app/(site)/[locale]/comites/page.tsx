import type { Metadata } from "next";
import { PageArt } from "@/components/ui/page-art";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { COMITE_CIENTIFICO, COMITE_ORGANIZADOR, PAISES, type MiembroComite, type PaisId } from "@/content/comites";
import { sectionColor } from "@/content/ui";
import { isLocale, pick, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

const T = {
  es: {
    eyebrow: "Comités",
    title: "Quién hace ieTIC 2027",
    lead: "Organiza ieTIC 2027 el consorcio de la red de universidades hispano-lusa formada por la Universidade Politécnica de Bragança, la Universidad de Salamanca, la Universidade Aberta y la UNED, con la colaboración de la Asociación de Atención Temprana AMPA.",
    organizing: "Comité organizador",
    organizingTitle: "El equipo que prepara ieTIC 2027",
    scientific: "Comité científico",
    scientificTitle: (n: number, k: number) => `${n} especialistas de ${k} países`,
    members: (n: number) => (n === 1 ? "1 miembro" : `${n} miembros`),
  },
  pt: {
    eyebrow: "Comissões",
    title: "Quem faz o ieTIC 2027",
    lead: "O ieTIC 2027 é organizado pelo consórcio da rede de universidades luso-espanhola formada pela Universidade Politécnica de Bragança, pela Universidade de Salamanca, pela Universidade Aberta e pela UNED, com a colaboração da Asociación de Atención Temprana AMPA.",
    organizing: "Comissão organizadora",
    organizingTitle: "A equipa que prepara o ieTIC 2027",
    scientific: "Comissão científica",
    scientificTitle: (n: number, k: number) => `${n} especialistas de ${k} países`,
    members: (n: number) => (n === 1 ? "1 membro" : `${n} membros`),
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  return pageMetadata(locale, "/comites", T[locale].eyebrow, T[locale].lead);
}

function Miembro({ m }: { m: MiembroComite }) {
  return (
    <li className="leading-snug">
      <span className="block font-medium text-tinta">{m.name}</span>
      <span className="mt-0.5 block text-sm text-tinta-suave">{m.affiliation}</span>
    </li>
  );
}

function CabeceraPais({ label, count }: { label: string; count: string }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-linea pb-3">
      <h3 className="font-display text-xl font-bold text-tinta">{label}</h3>
      <p className="nota text-tinta-suave">{count}</p>
    </div>
  );
}

export default async function ComitesPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const t = T[locale];

  // Comité científico por país: los países grandes con su propia fila (de más
  // a menos miembros) y los pequeños juntos al final, en orden alfabético.
  const collator = new Intl.Collator(locale, { sensitivity: "base" });
  const paises = (Object.keys(PAISES) as PaisId[])
    .map((id) => ({
      id,
      label: pick(PAISES[id], locale),
      members: COMITE_CIENTIFICO.filter((m) => m.country === id).sort((a, b) => collator.compare(a.name, b.name)),
    }))
    .filter((p) => p.members.length > 0);
  const grandes = paises.filter((p) => p.members.length >= 6).sort((a, b) => b.members.length - a.members.length);
  const pequenos = paises.filter((p) => p.members.length < 6).sort((a, b) => collator.compare(a.label, b.label));

  return (
    <>
      <PageHeader eyebrow={t.eyebrow} title={t.title} lead={t.lead} art={<PageArt />} color={sectionColor("/comites")} />

      {/* Comité organizador */}
      <section className="py-20 sm:py-24">
        <div className="contenedor">
          <SectionHeading eyebrow={t.organizing} title={t.organizingTitle} />
          <ul data-reveal className="mt-10 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
            {COMITE_ORGANIZADOR.map((m) => (
              <Miembro key={m.name} m={m} />
            ))}
          </ul>
        </div>
      </section>

      {/* Comité científico */}
      <section className="border-t border-linea bg-papel py-20 sm:py-24">
        <div className="contenedor">
          <SectionHeading eyebrow={t.scientific} title={t.scientificTitle(COMITE_CIENTIFICO.length, paises.length)} />
          <div className="mt-12 space-y-14">
            {grandes.map((p) => (
              <div key={p.id} data-reveal>
                <CabeceraPais label={p.label} count={t.members(p.members.length)} />
                <ul className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  {p.members.map((m) => (
                    <Miembro key={m.name} m={m} />
                  ))}
                </ul>
              </div>
            ))}
            {pequenos.length > 0 && (
              <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
                {pequenos.map((p) => (
                  <div key={p.id} data-reveal>
                    <CabeceraPais label={p.label} count={t.members(p.members.length)} />
                    <ul className="mt-6 space-y-5">
                      {p.members.map((m) => (
                        <Miembro key={m.name} m={m} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
