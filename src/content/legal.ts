import type { L10n } from "@/lib/i18n";

/**
 * Textos legales (propuesta de trabajo, pendiente de revisión por la
 * organización y, si procede, por los servicios jurídicos de la USAL).
 */
export interface LegalDoc {
  title: L10n;
  intro: L10n;
  sections: { heading: L10n; body: L10n<string[]> }[];
}

export const AVISO_LEGAL: LegalDoc = {
  title: { es: "Aviso legal", pt: "Aviso legal" },
  intro: {
    es: "Información general sobre la titularidad y las condiciones de uso de la web de ieTIC 2027.",
    pt: "Informação geral sobre a titularidade e as condições de utilização do sítio web do ieTIC 2027.",
  },
  sections: [
    {
      heading: { es: "Titular", pt: "Titular" },
      body: {
        es: [
          "Universidad de Salamanca — Instituto Universitario de Ciencias de la Educación (IUCE). Paseo de Canalejas, 169 (Edificio Solís, 1.ª planta), 37008 Salamanca. Correo: iuce@usal.es · Teléfono: +34 923 294 634.",
        ],
        pt: [
          "Universidade de Salamanca — Instituto Universitário de Ciências da Educação (IUCE). Paseo de Canalejas, 169 (Edifício Solís, 1.º piso), 37008 Salamanca. Correio eletrónico: iuce@usal.es · Telefone: +34 923 294 634.",
        ],
      },
    },
    {
      heading: { es: "Objeto", pt: "Objeto" },
      body: {
        es: [
          "Esta web ofrece información sobre la XIII Conferencia Ibérica de Innovación en Educación con TIC (ieTIC 2027): programa, ejes temáticos, participación, sede y comités.",
        ],
        pt: [
          "Este sítio disponibiliza informação sobre a XIII Conferência Ibérica de Inovação na Educação com TIC (ieTIC 2027): programa, eixos temáticos, participação, local e comissões.",
        ],
      },
    },
    {
      heading: { es: "Propiedad intelectual", pt: "Propriedade intelectual" },
      body: {
        es: [
          "Los logotipos de la Universidad de Salamanca y del IUCE son marcas de sus titulares. El logotipo de ieTIC 2027 pertenece a la organización del congreso. Las fotografías de los espacios pertenecen al IUCE.",
          "Los textos de esta web pueden citarse indicando la fuente.",
        ],
        pt: [
          "Os logótipos da Universidade de Salamanca e do IUCE são marcas dos respetivos titulares. O logótipo do ieTIC 2027 pertence à organização do congresso. As fotografias dos espaços pertencem ao IUCE.",
          "Os textos deste sítio podem ser citados com indicação da fonte.",
        ],
      },
    },
    {
      heading: { es: "Enlaces externos", pt: "Ligações externas" },
      body: {
        es: ["La web puede enlazar a sitios de terceros (plataformas de envío o inscripción, mapas). La organización no se hace responsable de sus contenidos."],
        pt: ["O sítio pode incluir ligações para sítios de terceiros (plataformas de submissão ou inscrição, mapas). A organização não se responsabiliza pelos seus conteúdos."],
      },
    },
  ],
};

export const PRIVACIDAD: LegalDoc = {
  title: { es: "Privacidad", pt: "Privacidade" },
  intro: {
    es: "Esta web está diseñada para recoger los mínimos datos posibles.",
    pt: "Este sítio foi concebido para recolher o mínimo de dados possível.",
  },
  sections: [
    {
      heading: { es: "Sin cookies ni analítica", pt: "Sem cookies nem analítica" },
      body: {
        es: [
          "La web pública no instala cookies ni utiliza herramientas de analítica o publicidad. Las tipografías se sirven desde el propio servidor.",
        ],
        pt: [
          "O sítio público não instala cookies nem utiliza ferramentas de analítica ou publicidade. Os tipos de letra são servidos a partir do próprio servidor.",
        ],
      },
    },
    {
      heading: { es: "Tu agenda, solo en tu navegador", pt: "A tua agenda, apenas no teu navegador" },
      body: {
        es: [
          "Las sesiones que marcas con la estrella en el programa se guardan en el almacenamiento local de tu navegador (localStorage). Esa información no se envía a ningún servidor y puedes borrarla en cualquier momento desde la configuración del navegador.",
        ],
        pt: [
          "As sessões que marcas com a estrela no programa são guardadas no armazenamento local do teu navegador (localStorage). Essa informação não é enviada para nenhum servidor e podes apagá-la a qualquer momento nas definições do navegador.",
        ],
      },
    },
    {
      heading: { es: "Servicios de terceros", pt: "Serviços de terceiros" },
      body: {
        es: [
          "El mapa de la página de sede se carga desde OpenStreetMap, que recibe la dirección IP de quien lo visualiza. La inscripción y el envío de comunicaciones se realizarán en plataformas externas con su propia política de privacidad.",
        ],
        pt: [
          "O mapa da página do local é carregado a partir do OpenStreetMap, que recebe o endereço IP de quem o visualiza. A inscrição e a submissão de comunicações serão feitas em plataformas externas com a sua própria política de privacidade.",
        ],
      },
    },
    {
      heading: { es: "Responsable y derechos", pt: "Responsável e direitos" },
      body: {
        es: [
          "Responsable del tratamiento: Universidad de Salamanca. Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a la Delegación de Protección de Datos: dpd@usal.es.",
        ],
        pt: [
          "Responsável pelo tratamento: Universidade de Salamanca. Podes exercer os teus direitos de acesso, retificação, apagamento, oposição, limitação e portabilidade escrevendo ao Encarregado de Proteção de Dados: dpd@usal.es.",
        ],
      },
    },
  ],
};

export const ACCESIBILIDAD: LegalDoc = {
  title: { es: "Accesibilidad", pt: "Acessibilidade" },
  intro: {
    es: "Queremos que cualquier persona pueda consultar el congreso, sea cual sea el dispositivo o la tecnología de apoyo que utilice.",
    pt: "Queremos que qualquer pessoa possa consultar o congresso, seja qual for o dispositivo ou a tecnologia de apoio que utilize.",
  },
  sections: [
    {
      heading: { es: "Compromiso", pt: "Compromisso" },
      body: {
        es: [
          "La web se ha desarrollado con el objetivo de cumplir el nivel AA de las Pautas de Accesibilidad para el Contenido Web (WCAG 2.1), conforme al Real Decreto 1112/2018: contraste suficiente, navegación completa con teclado, textos alternativos, estructura semántica y compatibilidad con lectores de pantalla.",
        ],
        pt: [
          "O sítio foi desenvolvido com o objetivo de cumprir o nível AA das Diretrizes de Acessibilidade para o Conteúdo da Web (WCAG 2.1), em conformidade com o Real Decreto espanhol 1112/2018: contraste suficiente, navegação completa por teclado, textos alternativos, estrutura semântica e compatibilidade com leitores de ecrã.",
        ],
      },
    },
    {
      heading: { es: "El programa", pt: "O programa" },
      body: {
        es: [
          "El programa interactivo ofrece una vista de lista equivalente a la parrilla, buscador accesible con teclado y fichas de sesión en diálogos que respetan el foco. Las animaciones se desactivan si el sistema tiene activada la reducción de movimiento.",
        ],
        pt: [
          "O programa interativo oferece uma vista de lista equivalente à grelha, pesquisa acessível por teclado e fichas de sessão em diálogos que respeitam o foco. As animações são desativadas se o sistema tiver ativa a redução de movimento.",
        ],
      },
    },
    {
      heading: { es: "Comunícanos cualquier barrera", pt: "Comunica-nos qualquer barreira" },
      body: {
        es: ["Si encuentras algún problema de accesibilidad, escríbenos a iuce@usal.es y lo resolveremos lo antes posible."],
        pt: ["Se encontrares algum problema de acessibilidade, escreve-nos para iuce@usal.es e resolvê-lo-emos o mais depressa possível."],
      },
    },
  ],
};
