import type { L10n } from "@/lib/i18n";

/**
 * Cuotas de inscripción y lo que incluye cada modalidad (documento
 * «Información para la web de ieTIC 2027», 01-10-2026). Los plazos de las
 * dos tarifas están en content/fechas.ts (inscripcion-reducida y
 * inscripcion-ordinaria).
 */
export const CUOTAS: { id: string; label: L10n; reduced: number; regular: number }[] = [
  {
    id: "presencial",
    label: { es: "Con comunicación, presencial", pt: "Com comunicação, presencial" },
    reduced: 130,
    regular: 150,
  },
  {
    id: "online",
    label: { es: "Con comunicación, en línea", pt: "Com comunicação, online" },
    reduced: 100,
    regular: 130,
  },
  {
    id: "sin-comunicacion",
    label: { es: "Sin comunicación", pt: "Sem comunicação" },
    reduced: 30,
    regular: 50,
  },
];

export const INCLUYE: { online: L10n<string[]>; presencial: L10n<string[]> } = {
  online: {
    es: [
      "Certificado de asistencia",
      "Certificado de presentación de comunicación",
      "Publicación en el libro de actas (repositorio GREDOS de la Universidad de Salamanca)",
      "Posibilidad de selección para su publicación en la revista RELATEC",
    ],
    pt: [
      "Certificado de participação",
      "Certificado de apresentação de comunicação",
      "Publicação no livro de atas (repositório GREDOS da Universidade de Salamanca)",
      "Possibilidade de seleção para publicação na revista RELATEC",
    ],
  },
  presencial: {
    es: [
      "Documentación de las jornadas",
      "Certificado de asistencia",
      "Certificado de presentación de comunicación",
      "Publicación en el libro de actas (repositorio GREDOS de la Universidad de Salamanca)",
      "Posibilidad de selección para su publicación en la revista RELATEC",
      "Cafés de los días 11 y 12 de febrero",
      "Comida del día 11 de febrero",
      "Actividades sociales",
    ],
    pt: [
      "Documentação do congresso",
      "Certificado de participação",
      "Certificado de apresentação de comunicação",
      "Publicação no livro de atas (repositório GREDOS da Universidade de Salamanca)",
      "Possibilidade de seleção para publicação na revista RELATEC",
      "Cafés dos dias 11 e 12 de fevereiro",
      "Almoço do dia 11 de fevereiro",
      "Atividades sociais",
    ],
  },
};
