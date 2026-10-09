/**
 * Datos iniciales del programa (semilla de la base de datos).
 *
 * Fuente: «PROGRAMA PROVISIONAL DE IETIC 2027 v2.docx» (correo de la
 * organización, 23-09-2026), actualizado con el documento «Información para
 * la web de ieTIC 2027» (01-10-2026): ponentes, talleres, experiencias de la
 * mesa redonda y visitas a la Biblioteca histórica. Espacios del IUCE: catálogo de la web de reservas
 * (reservas.iuce.usal.es), con sus aforos y equipamiento.
 *
 * Decisiones tomadas al pasar el Word a la parrilla (ver docs/ANALISIS.md):
 *   · Todo el congreso se celebra en el Edificio Solís. El «Salón de actos»
 *     del Word está en el mismo edificio aunque no es del IUCE (confirmado
 *     el 28-09-2026), así que va junto a las aulas en un solo edificio.
 *   · «Talleres» y «Panel de comunicaciones» no indican sala: se pintan como
 *     sesiones simultáneas de todo el edificio hasta que se asigne cada
 *     taller o mesa a su aula.
 *   · Acreditaciones, pausas y la visita guiada son filas generales.
 *   · El Laboratorio del IUCE no se usa en el congreso (28-09-2026): queda
 *     en el catálogo como sala INACTIVA, por si hubiera que recuperarlo.
 *
 * Este fichero SOLO se usa en `prisma/seed.ts` (imports relativos a propósito).
 */
import type { SessionTypeKey } from "../lib/session-types";

export const SEED_VENUES = [
  {
    id: "solis",
    name: "Edificio Solís",
    namePt: "Edifício Solís",
    short: "Solís",
    subtitle: "Campus de Educación",
    subtitlePt: "Campus de Educação",
    address: "Paseo de Canalejas, 169, 37008 Salamanca",
    order: 0,
  },
];

export const SEED_ROOMS = [
  {
    id: "salon-actos",
    venueId: "solis",
    name: "Salón de actos",
    namePt: "Auditório",
    code: "SA",
    capacity: null,
    description: "Espacio de las sesiones plenarias: inauguración, ponencias invitadas, panel, mesa redonda y clausura.",
    descriptionPt: "Espaço das sessões plenárias: abertura, conferências convidadas, painel, mesa-redonda e encerramento.",
    equipment: [] as string[],
    imageUrl: null,
    order: 0,
  },
  {
    id: "aula-17a",
    venueId: "solis",
    name: "Aula 17A",
    namePt: "Sala 17A",
    code: "IUCE-17A",
    capacity: 40,
    description:
      "Aula principal de docencia del IUCE. Espacio amplio con disposición flexible para clases, seminarios y conferencias.",
    descriptionPt:
      "Principal sala de aula do IUCE. Espaço amplo com disposição flexível para aulas, seminários e conferências.",
    equipment: ["Proyector HD", "Pantalla motorizada", "Pizarra blanca", "Sistema de sonido", "Wi-Fi", "Enchufes en mesas"],
    imageUrl: "/espacios/aula-17a.webp",
    order: 1,
  },
  {
    id: "aula-12a",
    venueId: "solis",
    name: "Aula 12A",
    namePt: "Sala 12A",
    code: "IUCE-12A",
    capacity: 25,
    description:
      "Aula de tamaño mediano para seminarios, grupos de trabajo y reuniones académicas. Disposición flexible.",
    descriptionPt:
      "Sala de dimensão média para seminários, grupos de trabalho e reuniões académicas. Disposição flexível.",
    equipment: ["Proyector HD", "Pizarra blanca", "Wi-Fi", "Mesas movibles"],
    imageUrl: "/espacios/aula-12a.webp",
    order: 2,
  },
  {
    id: "laboratorio",
    venueId: "solis",
    name: "Laboratorio",
    namePt: "Laboratório",
    code: "IUCE-LAB",
    capacity: 20,
    description:
      "Laboratorio equipado para prácticas con equipamiento informático específico y software educativo.",
    descriptionPt:
      "Laboratório equipado para atividades práticas, com equipamento informático específico e software educativo.",
    equipment: ["20 puestos informáticos", "Proyector", "Pizarra digital", "Software educativo", "Wi-Fi"],
    imageUrl: "/espacios/laboratorio.webp",
    order: 3,
    active: false,
  },
  {
    id: "sala-usos-multiples",
    venueId: "solis",
    name: "Sala de Usos Múltiples",
    namePt: "Sala Polivalente",
    code: "IUCE-SUM",
    capacity: 60,
    description:
      "Sala polivalente para eventos, defensas, reuniones y actos académicos. Configurable según necesidad.",
    descriptionPt:
      "Sala polivalente para eventos, provas académicas, reuniões e atos académicos. Configurável conforme a necessidade.",
    equipment: ["Proyector HD", "Sistema de sonido", "Micrófonos", "Pantalla grande", "Mesas y sillas configurables"],
    imageUrl: "/espacios/sala-usos-multiples.webp",
    order: 4,
  },
];

export const SEED_DAYS = [
  { key: "2027-02-11", labelEs: "Jueves 11 de febrero", labelPt: "Quinta-feira, 11 de fevereiro", order: 0 },
  { key: "2027-02-12", labelEs: "Viernes 12 de febrero", labelPt: "Sexta-feira, 12 de fevereiro", order: 1 },
];

interface SeedTalk {
  title: string;
  authors?: string;
}

interface SeedSession {
  day: string;
  start: string;
  end: string;
  type: SessionTypeKey;
  title: string;
  titlePt: string;
  subtitle?: string;
  subtitlePt?: string;
  description?: string;
  descriptionPt?: string;
  /** Una persona por línea */
  speakers?: string;
  roomId?: string;
  venueId?: string;
  location?: string;
  locationPt?: string;
  /** Talleres de la sesión, experiencias de la mesa redonda… */
  talks?: SeedTalk[];
}

/** Datos de Prisma para crear una sesión de la semilla, con sus contribuciones. */
export function seedSessionData(s: SeedSession, order: number) {
  const { talks, ...rest } = s;
  return {
    ...rest,
    order,
    ...(talks?.length ? { talks: { create: talks.map((t, i) => ({ ...t, order: i })) } } : {}),
  };
}

const BIBLIOTECA = {
  type: "SOCIAL" as const,
  description: "Visita durante la pausa del almuerzo, en un grupo de 25 personas como máximo.",
  descriptionPt: "Visita durante a pausa para almoço, num grupo de 25 pessoas no máximo.",
  location: "Biblioteca histórica de la Universidad de Salamanca",
  locationPt: "Biblioteca histórica da Universidade de Salamanca",
};

const COMUNICACIONES = {
  type: "COMUNICACIONES" as const,
  title: "Panel de comunicaciones",
  titlePt: "Painel de comunicações",
  subtitle: "Mesas simultáneas, presenciales y en línea",
  subtitlePt: "Mesas simultâneas, presenciais e online",
  description:
    "Presentación de las comunicaciones aceptadas, en mesas presenciales y en línea. La distribución por mesas y aulas se publicará con el programa definitivo.",
  descriptionPt:
    "Apresentação das comunicações aceites, em mesas presenciais e online. A distribuição por mesas e salas será publicada com o programa definitivo.",
  venueId: "solis",
};

export const SEED_SESSIONS: SeedSession[] = [
  // ─── Jueves 11 de febrero ──────────────────────────────────────────────
  {
    day: "2027-02-11",
    start: "09:00",
    end: "09:30",
    type: "ACREDITACION",
    title: "Recogida de acreditaciones",
    titlePt: "Receção e acreditação",
    description: "Entrega de la documentación y de las acreditaciones a las personas inscritas.",
    descriptionPt: "Entrega da documentação e das credenciais aos participantes inscritos.",
  },
  {
    day: "2027-02-11",
    start: "09:30",
    end: "10:00",
    type: "INSTITUCIONAL",
    title: "Acto inaugural",
    titlePt: "Sessão de abertura",
    description: "Apertura oficial de ieTIC 2027.",
    descriptionPt: "Abertura oficial do ieTIC 2027.",
    roomId: "salon-actos",
  },
  {
    day: "2027-02-11",
    start: "10:00",
    end: "11:30",
    type: "PONENCIA",
    title: "Ponencia inaugural",
    titlePt: "Conferência inaugural",
    subtitle: "Recursos Educativos Abiertos y Diseño Universal de Aprendizaje",
    subtitlePt: "Recursos Educativos Abertos e Desenho Universal para a Aprendizagem",
    speakers: "Dra. Prudencia Gutiérrez Esteban (Universidad de Extremadura)",
    roomId: "salon-actos",
  },
  {
    day: "2027-02-11",
    start: "11:30",
    end: "12:00",
    type: "PAUSA",
    title: "Pausa – café",
    titlePt: "Pausa para café",
  },
  {
    day: "2027-02-11",
    start: "12:00",
    end: "13:30",
    type: "PANEL_EXPERTOS",
    title: "Panel de expertos",
    titlePt: "Painel de especialistas",
    subtitle: "Cuatro ponentes, por anunciar",
    subtitlePt: "Quatro oradores, a anunciar",
    roomId: "salon-actos",
  },
  {
    day: "2027-02-11",
    start: "13:30",
    end: "15:30",
    type: "PAUSA",
    title: "Pausa – almuerzo",
    titlePt: "Pausa para almoço",
  },
  {
    day: "2027-02-11",
    start: "13:30",
    end: "14:00",
    title: "Visita a la Biblioteca histórica (1.er grupo)",
    titlePt: "Visita à Biblioteca histórica (1.º grupo)",
    ...BIBLIOTECA,
  },
  {
    day: "2027-02-11",
    start: "14:00",
    end: "14:30",
    title: "Visita a la Biblioteca histórica (2.º grupo)",
    titlePt: "Visita à Biblioteca histórica (2.º grupo)",
    ...BIBLIOTECA,
  },
  {
    day: "2027-02-11",
    start: "15:30",
    end: "17:00",
    type: "TALLER",
    title: "Talleres",
    titlePt: "Oficinas",
    subtitle: "Cuatro talleres simultáneos",
    subtitlePt: "Quatro oficinas em simultâneo",
    description: "Talleres prácticos en paralelo. El aula de cada taller se publicará con el programa definitivo.",
    descriptionPt: "Oficinas práticas em paralelo. A sala de cada oficina será publicada com o programa definitivo.",
    venueId: "solis",
    talks: [
      { title: "Narrativa inmersiva como propuesta pedagógica", authors: "Dra. Maribel R. Fidalgo (Universidad de Salamanca)" },
      { title: "Videojuegos para educar", authors: "Universidad de Extremadura" },
      { title: "Potencial educativo de la IA", authors: "Universidad de Granada" },
      { title: "Musicoterapia y TIC", authors: "César Daniel Pascual Vallejo (Universidad de Salamanca)" },
    ],
  },
  {
    day: "2027-02-11",
    start: "17:00",
    end: "18:30",
    type: "MESA_REDONDA",
    title: "Mesa redonda sobre experiencias escolares",
    titlePt: "Mesa-redonda sobre experiências escolares",
    subtitle: "Experiencias de centros educativos",
    subtitlePt: "Experiências de escolas",
    roomId: "salon-actos",
    talks: [
      { title: "Experiencia de Sagrado Corazón", authors: "Dña. María Álvarez y Jorge Nuño" },
      { title: "Experiencia de las Esclavas", authors: "Dña. María José Daniel y D. Carlos Marcos" },
      { title: "Experiencia de CEIP Santa Catalina", authors: "Dña. María Victoria Casado Martín" },
      { title: "Experiencia de San Estanislao de Kostka" },
      { title: "Centro E-pisteme", authors: "Dr. Manuel Vidal Vielma Blanco" },
    ],
  },
  {
    day: "2027-02-11",
    start: "18:30",
    end: "19:50",
    ...COMUNICACIONES,
  },
  {
    day: "2027-02-11",
    start: "20:00",
    end: "21:00",
    type: "SOCIAL",
    title: "Visita guiada a la ciudad de Salamanca",
    titlePt: "Visita guiada à cidade de Salamanca",
    description: "Recorrido guiado por la ciudad. El punto de encuentro se anunciará próximamente.",
    descriptionPt: "Percurso guiado pela cidade. O ponto de encontro será anunciado brevemente.",
    location: "Punto de encuentro por anunciar",
    locationPt: "Ponto de encontro a anunciar",
  },

  // ─── Viernes 12 de febrero ─────────────────────────────────────────────
  {
    day: "2027-02-12",
    start: "09:00",
    end: "10:30",
    ...COMUNICACIONES,
  },
  {
    day: "2027-02-12",
    start: "10:30",
    end: "11:30",
    type: "PROYECTOS",
    title: "Presentación de proyectos de investigación",
    titlePt: "Apresentação de projetos de investigação",
    speakers: [
      "Dr. Antonio Moreira (Universidade Aberta)",
      "Dr. Vitor Gonçalves (Universidade Politécnica de Bragança)",
      "Dra. Pilar Gútiez Cuevas (AMPA)",
      "Dra. Cristina Sánchez Romero (UNED)",
      "Dra. Sonia Casillas Martín (Universidad de Salamanca)",
    ].join("\n"),
    roomId: "salon-actos",
  },
  {
    day: "2027-02-12",
    start: "11:30",
    end: "12:00",
    type: "PAUSA",
    title: "Pausa – café",
    titlePt: "Pausa para café",
  },
  {
    day: "2027-02-12",
    start: "12:00",
    end: "13:30",
    type: "PONENCIA",
    title: "Ponencia invitada",
    titlePt: "Conferência convidada",
    subtitle: "Ponente por anunciar",
    subtitlePt: "Orador a anunciar",
    roomId: "salon-actos",
  },
  {
    day: "2027-02-12",
    start: "13:30",
    end: "14:00",
    type: "INSTITUCIONAL",
    title: "Clausura de la conferencia",
    titlePt: "Sessão de encerramento",
    description: "Cierre oficial de ieTIC 2027.",
    descriptionPt: "Encerramento oficial do ieTIC 2027.",
    roomId: "salon-actos",
  },
];

export const SEED_SETTINGS = [{ key: "programmeStatus", value: "provisional" }];
