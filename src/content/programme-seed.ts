/**
 * Datos iniciales del programa (semilla de la base de datos).
 *
 * Fuente: «PROGRAMA PROVISIONAL DE IETIC 2027 v2.docx» (correo de Marcos
 * Cabezas, 23-09-2026). Espacios del IUCE: catálogo de la web de reservas
 * (reservas.iuce.usal.es), con sus aforos y equipamiento.
 *
 * Decisiones tomadas al pasar el Word a la parrilla (ver docs/ANALISIS.md):
 *   · Las sesiones marcadas «(Salón de actos)» van a la sala «Salón de actos»
 *     de la Facultad de Educación — el IUCE no tiene salón de actos propio en
 *     el catálogo de reservas. PENDIENTE DE CONFIRMAR con la organización.
 *   · «Talleres» y «Panel de comunicaciones» no indican sala: se pintan como
 *     sesiones simultáneas que ocupan todas las aulas del IUCE hasta que se
 *     asigne cada taller o mesa a su aula.
 *   · Acreditaciones, pausas y la visita guiada son filas generales.
 *
 * Este fichero SOLO se usa en `prisma/seed.ts` (imports relativos a propósito).
 */
import type { SessionTypeKey } from "../lib/session-types";

export const SEED_VENUES = [
  {
    id: "facultad",
    name: "Facultad de Educación",
    namePt: "Faculdade de Educação",
    short: "Facultad",
    subtitle: "Sesiones plenarias",
    subtitlePt: "Sessões plenárias",
    address: "Paseo de Canalejas, 169 · 37008 Salamanca",
    order: 0,
  },
  {
    id: "iuce",
    name: "IUCE · Edificio Solís",
    namePt: "IUCE · Edifício Solís",
    short: "IUCE",
    subtitle: "Aulas del Instituto",
    subtitlePt: "Salas do Instituto",
    address: "Paseo de Canalejas, 169 · 37008 Salamanca",
    order: 1,
  },
];

export const SEED_ROOMS = [
  {
    id: "salon-actos",
    venueId: "facultad",
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
    venueId: "iuce",
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
    venueId: "iuce",
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
    venueId: "iuce",
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
  },
  {
    id: "sala-usos-multiples",
    venueId: "iuce",
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
  roomId?: string;
  venueId?: string;
  location?: string;
  locationPt?: string;
}

const POR_ANUNCIAR = { subtitle: "Ponente por anunciar", subtitlePt: "Orador a anunciar" };
const PARTICIPANTES = { subtitle: "Participantes por anunciar", subtitlePt: "Participantes a anunciar" };

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
    title: "Ponencia invitada",
    titlePt: "Conferência convidada",
    ...POR_ANUNCIAR,
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
    ...PARTICIPANTES,
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
    start: "15:30",
    end: "17:00",
    type: "TALLER",
    title: "Talleres",
    titlePt: "Oficinas",
    subtitle: "Sesiones simultáneas en las aulas del IUCE",
    subtitlePt: "Sessões simultâneas nas salas do IUCE",
    description:
      "Talleres prácticos en paralelo. La relación de talleres y el aula de cada uno se publicarán con el programa definitivo.",
    descriptionPt:
      "Oficinas práticas em paralelo. A lista de oficinas e a sala de cada uma serão publicadas com o programa definitivo.",
    venueId: "iuce",
  },
  {
    day: "2027-02-11",
    start: "17:00",
    end: "18:30",
    type: "MESA_REDONDA",
    title: "Mesa redonda sobre experiencias escolares",
    titlePt: "Mesa-redonda sobre experiências escolares",
    ...PARTICIPANTES,
    roomId: "salon-actos",
  },
  {
    day: "2027-02-11",
    start: "18:30",
    end: "19:50",
    type: "COMUNICACIONES",
    title: "Panel de comunicaciones",
    titlePt: "Painel de comunicações",
    subtitle: "Mesas simultáneas en las aulas del IUCE",
    subtitlePt: "Mesas simultâneas nas salas do IUCE",
    description:
      "Presentación de las comunicaciones aceptadas. La distribución por mesas y aulas se publicará con el programa definitivo.",
    descriptionPt:
      "Apresentação das comunicações aceites. A distribuição por mesas e salas será publicada com o programa definitivo.",
    venueId: "iuce",
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
    type: "COMUNICACIONES",
    title: "Panel de comunicaciones",
    titlePt: "Painel de comunicações",
    subtitle: "Mesas simultáneas en las aulas del IUCE",
    subtitlePt: "Mesas simultâneas nas salas do IUCE",
    description:
      "Presentación de las comunicaciones aceptadas. La distribución por mesas y aulas se publicará con el programa definitivo.",
    descriptionPt:
      "Apresentação das comunicações aceites. A distribuição por mesas e salas será publicada com o programa definitivo.",
    venueId: "iuce",
  },
  {
    day: "2027-02-12",
    start: "10:30",
    end: "11:30",
    type: "PROYECTOS",
    title: "Presentación de proyectos de investigación",
    titlePt: "Apresentação de projetos de investigação",
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
    ...POR_ANUNCIAR,
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
