import type { L10n } from "@/lib/i18n";

/**
 * Ejes temáticos de ieTIC 2027, literales del programa provisional
 * (PROGRAMA PROVISIONAL DE IETIC 2027 v2.docx). Traducción al portugués
 * propia, pendiente de revisión por la organización.
 */
export interface Eje {
  id: string;
  icon: "rea" | "ciencia" | "bienestar" | "inclusion" | "gamificacion" | "ia";
  title: L10n;
  short: L10n;
  lines: L10n<string[]>;
}

export const EJES: Eje[] = [
  {
    id: "rea",
    icon: "rea",
    title: {
      es: "Recursos educativos abiertos (REA)",
      pt: "Recursos educativos abertos (REA)",
    },
    short: { es: "REA", pt: "REA" },
    lines: {
      es: [
        "Diseño de recursos educativos abiertos.",
        "Impresión 3D en proyectos educativos.",
        "Proyectos colaborativos para el diseño de REA.",
        "Uso y evaluación de objetos de aprendizaje abiertos.",
      ],
      pt: [
        "Design de recursos educativos abertos.",
        "Impressão 3D em projetos educativos.",
        "Projetos colaborativos para o design de REA.",
        "Utilização e avaliação de objetos de aprendizagem abertos.",
      ],
    },
  },
  {
    id: "ciencia-abierta",
    icon: "ciencia",
    title: { es: "Ciencia abierta", pt: "Ciência aberta" },
    short: { es: "Ciencia abierta", pt: "Ciência aberta" },
    lines: {
      es: [
        "Tecnología educativa para apoyar la Ciencia Abierta.",
        "Plataformas y repositorios para hacer efectiva la Ciencia Abierta.",
        "Trabajo en red mediado por tecnología y Ciencia Abierta.",
        "Política educativa sobre Ciencia Abierta.",
        "Ciencia ciudadana y redes profesionales.",
      ],
      pt: [
        "Tecnologia educativa ao serviço da Ciência Aberta.",
        "Plataformas e repositórios para tornar efetiva a Ciência Aberta.",
        "Trabalho em rede mediado pela tecnologia e Ciência Aberta.",
        "Política educativa sobre Ciência Aberta.",
        "Ciência cidadã e redes profissionais.",
      ],
    },
  },
  {
    id: "bienestar-digital",
    icon: "bienestar",
    title: { es: "Bienestar digital", pt: "Bem-estar digital" },
    short: { es: "Bienestar digital", pt: "Bem-estar digital" },
    lines: {
      es: [
        "Empoderamiento de la sociedad a través del uso adecuado de las tecnologías digitales.",
        "Desarrollo de competencias digitales para el bienestar digital de los estudiantes.",
        "Tecnologías digitales para potenciar la motivación de los estudiantes.",
      ],
      pt: [
        "Capacitação da sociedade através do uso adequado das tecnologias digitais.",
        "Desenvolvimento de competências digitais para o bem-estar digital dos estudantes.",
        "Tecnologias digitais para potenciar a motivação dos estudantes.",
      ],
    },
  },
  {
    id: "tecnologias-inclusivas",
    icon: "inclusion",
    title: { es: "Tecnologías inclusivas", pt: "Tecnologias inclusivas" },
    short: { es: "Tecnologías inclusivas", pt: "Tecnologias inclusivas" },
    lines: {
      es: [
        "La tecnología educativa al servicio de la atención a la diversidad.",
        "Metodologías para afrontar la inclusión educativa en las aulas.",
        "Herramientas digitales para la práctica docente inclusiva.",
        "Diseño Universal de Aprendizaje en programas de innovación y prácticas de aula.",
      ],
      pt: [
        "A tecnologia educativa ao serviço da atenção à diversidade.",
        "Metodologias para promover a inclusão educativa nas salas de aula.",
        "Ferramentas digitais para a prática docente inclusiva.",
        "Desenho Universal para a Aprendizagem em programas de inovação e práticas de sala de aula.",
      ],
    },
  },
  {
    id: "gamificacion",
    icon: "gamificacion",
    title: {
      es: "Gamificación y narrativas inmersivas",
      pt: "Gamificação e narrativas imersivas",
    },
    short: { es: "Gamificación", pt: "Gamificação" },
    lines: {
      es: [
        "La realidad virtual y el uso de nuevas narrativas en el aprendizaje.",
        "Tecnologías para incentivar la comprensión lectora.",
        "Tecnologías inmersivas para fomentar las competencias digitales.",
        "Serious games para el desarrollo curricular.",
        "Estrategias de gamificación para el aula.",
      ],
      pt: [
        "A realidade virtual e o uso de novas narrativas na aprendizagem.",
        "Tecnologias para incentivar a compreensão leitora.",
        "Tecnologias imersivas para fomentar as competências digitais.",
        "Serious games para o desenvolvimento curricular.",
        "Estratégias de gamificação para a sala de aula.",
      ],
    },
  },
  {
    id: "ia",
    icon: "ia",
    title: {
      es: "La inteligencia artificial como agente transformador de la educación",
      pt: "A inteligência artificial como agente transformador da educação",
    },
    short: { es: "Inteligencia artificial", pt: "Inteligência artificial" },
    lines: {
      es: [
        "Herramientas de IA para el diseño de recursos educativos.",
        "La inteligencia artificial (IA) en los procesos de enseñanza-aprendizaje.",
        "Peligros de la IA para el aprendizaje.",
        "Analíticas de aprendizaje para fomentar la evaluación personalizada.",
        "Valoración del uso de la IA desde el punto de vista de la sostenibilidad.",
      ],
      pt: [
        "Ferramentas de IA para o design de recursos educativos.",
        "A inteligência artificial (IA) nos processos de ensino-aprendizagem.",
        "Perigos da IA para a aprendizagem.",
        "Analítica da aprendizagem para promover a avaliação personalizada.",
        "Avaliação do uso da IA do ponto de vista da sustentabilidade.",
      ],
    },
  },
];
