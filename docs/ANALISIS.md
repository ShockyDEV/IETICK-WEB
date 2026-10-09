# ieTIC 2027 — análisis del encargo y decisiones

Documento de trabajo (24-09-2026). Recoge qué se ha pedido, de qué material se parte, cómo se ha trasladado y qué queda por validar con la organización.

## 1. El encargo

- **Qué**: la web del congreso **ieTIC 2027**, XIII Conferencia Ibérica de Innovación en Educación con TIC, Salamanca, **11 y 12 de febrero de 2027**. Material recibido de la organización (correo «Sitio Web Congreso ieTIC27», 23-09-2026): programa provisional (`PROGRAMA PROVISIONAL DE IETIC 2027 v2.docx`) y logotipo con fondo y transparente. Copia en `../material-organizacion/`.
- **Referencia estética y de estructura**: la web de las JUTE 2026 (stellae.usc.es/jute2026), que gustó a la organización. Sirve de inspiración, no se replica.
- **Programa**: igual que la web del programa de ICED26 (programme.iced26.es), pero sobre los espacios del IUCE en lugar de los de Fonseca.
- **Stack**: el habitual (Node.js, Next.js, Tailwind, PostgreSQL en Docker Compose).

## 2. Revisión del stack de las webs existentes

| Web | Stack | Datos / despliegue |
|---|---|---|
| **MUPES** (máster de secundaria) | Next.js 15.5 + React 19 + Tailwind 3.4 + Radix/shadcn, TipTap, Auth.js v5, Resend | Prisma 6 + PostgreSQL 16 en Docker Compose (perfil `prod` con Dockerfile *standalone*) |
| **iuce-web** (web del IUCE) | Next.js 14.2 + React 18 + Tailwind 3.4, TipTap, Auth.js v5, Resend, recharts, sharp, Vitest | Prisma 6 + PostgreSQL 16 (Compose, 5433); ES/EN por middleware |
| **Reservas IUCE** (TFG) | Next.js 14.2 + React 18 + Tailwind 3.4, Auth.js v5 + adaptador Prisma, Resend, Vitest | Prisma 6 + PostgreSQL 16 (Compose, 5432); en producción en solis.usal.es |
| **Programa ICED26** | HTML + React 18 UMD + Babel en el navegador, CSS a mano, sin build | `data/programme.js` versionado; GitHub Pages; panel `/backstage` que publica con commits |

Denominador común: Next.js + Tailwind + Prisma/PostgreSQL en Docker, Auth.js para el panel y Vitest. **ieTIC 2027 usa exactamente ese stack** en la rama de Next 15.5 (la de MUPES, con parches de seguridad), y trae el programa de ICED26 a esa arquitectura: de un fichero JS editado a mano a una base de datos con panel.

## 3. La web de referencia (JUTE 2026)

WordPress 7 + tema Blocksy + Elementor. Tipografías Poppins y Rethink Sans; titulares en morado `#47388D` y texto gris `#4D5D6D`; hero nocturno de neón con la silueta de la catedral de Santiago y estelas de luz.

Secciones: Inicio (bienvenida, dónde estamos, por qué participar, objetivos, a quién va dirigido, llamada a comunicaciones, logos) · JUTE 2026 (presentación, líneas temáticas, galería) · Ponentes (foto + biografía) · Programa (texto por días) · Registro (tabla de tarifas y qué incluyen) · Comunicaciones (instrucciones, plantillas, fechas) · JUTEscola (seminario doctoral) · JUTE virtual (emisiones) · Comités · Sede · Alojamiento (hoteles con descuento).

Qué se conserva: la arquitectura de información (con los apartados agrupados en 7 entradas de menú), el tono académico y el hero nocturno con una ciudad reconocible. Qué se mejora: el programa (de texto plano a programa interactivo), la navegación móvil, la accesibilidad, el bilingüismo y la edición desde un panel propio en lugar de Elementor.

## 4. Dirección de arte

- **Paleta** muestreada del logo oficial (azul petróleo `#167492`, cian `#98DDED`, hielo `#DAF5FE`) y completada con un **dorado «piedra de Villamayor»** (`#EBAE3F`) como acento propio de Salamanca, la ciudad dorada. El dorado marca las llamadas a la acción y el estado «en directo».
- **Hero**: Salamanca de noche vista desde el Tormes (puente romano, catedrales, Clerecía) iluminada en dorado, con una red de nodos en cian —la red de conocimiento abierto del lema— y reflejos de luz en el río, como guiño a las estelas de JUTE.
- **Tipografía**: Sora (titulares, emparenta con las letras redondeadas del logo), Inter (texto, horas y datos) y EB Garamond en cursiva (antetítulos, fechas y notas). Sin monoespaciada en la web pública (28-09-2026: al usuario le parecía «muy IA»), sin cápsulas ni numeraciones 01/02/03 y sin «·» en los rótulos; los botones llevan una esquina facetada, como los polígonos del logo.
- **Logo**: se usa el PNG transparente sobre fondo oscuro. Para fondos claros se ha derivado una versión en positivo (`public/brand/ietic27-logo-claro.png`) recoloreando el original; conviene pedir a la organización una versión oficial.

## 5. Del programa provisional a la parrilla

Traslado literal de horas y títulos del Word, con estas decisiones:

1. Las sesiones marcadas «(Salón de actos)» van a la sala **Salón de actos** del **Edificio Solís**: está en el mismo edificio que el IUCE aunque no es del Instituto (confirmado el 28-09-2026). Todo el congreso cuelga de un solo edificio.
2. **Talleres** (jueves 15:30–17:00) y **Panel de comunicaciones** (jueves 18:30–19:50 y viernes 9:00–10:30) no indican sala: se pintan como sesiones simultáneas de todo el edificio hasta que se asigne cada taller o mesa a su aula desde el panel.
3. Acreditaciones, pausas y la visita guiada son filas generales. La visita guiada no tiene punto de encuentro.
4. Espacios del IUCE (catálogo de reservas.iuce.usal.es): Aula 17A (40), Aula 12A (25) y Sala de Usos Múltiples (60), con sus fotos. El Laboratorio (20) no se usa en el congreso: queda como sala inactiva (28-09-2026). El equipamiento de cada aula ya no se muestra en la web pública.

## 6. Pendiente de validar con la organización

- Número de edición (**XIII**, deducido de que ieTIC 2026 fue la XII) y nombre oficial de la serie.
- Qué **salón de actos** acoge las plenarias (y su aforo).
- **Información recibida el 01-10-2026** (documento «Información para la web de ieTIC 2027» y plantillas de resumen y de texto completo, copia en `../material-organizacion/info-web-2026-10-01/`). Incorporado: presentación oficial (ES; PT traducido por nosotros), modalidad **híbrida**, ponentes, programa actualizado (talleres y experiencias de la mesa redonda como contribuciones de su sesión, visitas a la Biblioteca histórica durante el almuerzo), cuotas y lo que incluyen, formulario previo y matrícula en el Centro de Formación Permanente, normas de comunicaciones, plantillas descargables (`public/descargas/`), envío por EasyChair, ejes (nuevo título del eje de IA y la línea «Peligros de la IA para el aprendizaje»), todas las fechas y los contactos (secretaria.ietic27@usal.es e ietic@ipb.pt).
- Logos: los 11 del documento **más la UCM**, que venía en el zip del 30-09 aunque el documento no la incluye (criterio del usuario: mejor que sobre alguien a que falte). Franja «Organización y colaboración» en el pie de todas las páginas.
- **Comités (06-10-2026)**, de «COMITÉS_ieTIC27 definitivo.xlsx» (copia en `../material-organizacion/comites-2026-10-06/`): 14 personas en el organizador, en el orden de la hoja, y 95 en el científico, agrupadas por país y ordenadas por nombre (`src/content/comites.ts`). Los correos de la hoja no se publican ni se suben al repositorio.
- **Universidade Politécnica de Bragança (UPB)**: la hoja de comités y la propia web de la institución (ipb.pt) usan ya el nombre nuevo; el documento del 01-10 decía Instituto Politécnico de Bragança (IPB). Se ha actualizado en toda la web, presentación oficial incluida; la edición de 2016 conserva el nombre de entonces.
- **Cambios pedidos por la organización (09-10-2026)**, documento «Sitio Web ieTIC27_cambios.docx» (copia en `../material-organizacion/cambios-2026-10-09/`, junto con la plantilla de texto completo nueva). Hechos:
  - Fuera el «Contacto general: ietic@ipb.pt» del pie (y del aviso legal).
  - Ejes temáticos numerados en la portada, El congreso y Comunicaciones (como en la convocatoria de EasyChair).
  - El congreso: fuera la sección «Trayectoria» (el componente `editions-timeline` queda sin usar); en «Qué encontrarás», «mesas de comunicaciones» y «panel de resultados de investigación».
  - Programa: sin columnas de salas; la lista por horas, con la sala en cada actividad, también en el ordenador (`programme-grid` queda sin usar salvo `LiveBadge`). Las actividades con lugar propio (visitas a la Biblioteca histórica) enlazan al mapa.
  - Fuera el taller «Neuroeducación y tecnología»: quedan cuatro talleres.
  - Plantilla de texto completo sustituida por la última versión.
  - Comités: miembros del consorcio y equipo organizador por separado; añadidos Andrea Basantes Andrade (Universidad Técnica del Norte, Ecuador) y Braulio Ibarra Olea (Universidad de Chile).
  - Sede: la Facultad de Educación (Paseo de Canalejas, 169), con el Edificio Cossío (Facultad) y el Edificio Solís (IUCE); fuera el apartado de espacios; mapa en el Edificio Cossío. La foto del Edificio Cossío es la de la portada de la web de la Facultad (con crédito): conviene confirmar que se puede usar o sustituirla por una suya.
  - Pendiente: el lugar del almuerzo (para enlazarlo), fotos y enlaces de los ponentes cuando estén confirmados, y si «mesas de comunicaciones» y «panel de resultados de investigación» deben cambiar también en el programa.
- Discrepancias que conviene confirmar con la organización:
  - El texto de presentación y los logos incluyen al **IUCE** dentro del consorcio; el 28-09 se nos dijo que el IUCE solo era la sede. Se ha respetado el texto oficial.
  - **UCM** (en el zip y en el comité organizador, no en el documento) y **UNED** (en el documento y en el texto, no en el zip).
  - Hoja de comités, publicada tal cual: posibles erratas en «Limón Mendiizaval» (¿Mendizábal?) y «José Juán» (¿Juan?); afiliaciones que no casan con el correo de la persona (Roberto Soto Varela, Moussa Boumadan Hamed, Ana Mouraz Lopes y Maribel Miranda Pinto); y dos nombres que no son los oficiales, «Universidade Aberta do Porto» y «Universidade Técnica do Porto». En el comité organizador Sonia Casillas y Marcos Cabezas llevan los apellidos con guion y en el científico sin él.
  - La **Asociación de Atención Temprana AMPA** colabora según el texto, pero no llegó su logo.
  - «Las cinco mejores comunicaciones se propondrán para RELATEC» venía marcado «(falta confirmar)»: no se publica; solo «posibilidad de selección para RELATEC», que aparece sin reservas en lo que incluye la inscripción.
  - Convocatoria pública en EasyChair (https://easychair.org/cfp/ietic2027, enlazada en Comunicaciones desde el 06-10): su «Conference web page» apunta a https://ietic.ipb.pt/ y habrá que cambiarla por el dominio nuevo; llama al eje 6 «Uso educativo y peligros de la IA» (la web usa el título del documento del 01-10, «La inteligencia artificial como agente transformador de la educación»); pone a Pilar Gutiez por la «Asociación Madrileña de Profesionales de la Atención Temprana (AMPAT)», cuando la hoja de comités dice UCM y los textos hablan de la asociación AMPA; y su comité de la USAL no incluye a Celia Sánchez Peinado, que sí está en la hoja definitiva (se sigue la hoja). Fechas, normas y líneas de los ejes coinciden con la web.
  - **Cinco talleres simultáneos** y hoy hay cuatro salas activas (salón de actos y tres aulas): quizá haga falta recuperar el Laboratorio u otra sala.
  - Faltan: los cuatro ponentes del panel de expertos, la ponencia invitada del viernes, los responsables de dos talleres (solo consta la universidad) y las personas de la experiencia de San Estanislao de Kostka.
  - Cómo se apuntan las visitas a la Biblioteca histórica (grupos de 25), el enlace a la plataforma online y la carpeta de vídeos se enviarán a los participantes.
  - El documento trae la presentación también en **inglés**; la web está en español y portugués. ¿Versión en inglés?
  - Las imágenes para enlazar el formulario, el pago y EasyChair (ilustraciones de banco de iconos) no se usan: en su lugar hay botones; si se quieren, puede hacer falta citar su autoría.
- En el Word el lema dice «Diseño Universal **de** Aprendizaje» y en los ejes «Diseño Universal **para el** Aprendizaje»; se ha respetado cada literal.

## 7. Dónde se publica

- 01-10-2026: se pidió al CPD una máquina virtual como la de diderot.usal.es (CAU-49199). 02-10: denegada; «no se crean máquinas virtuales para eventos puntuales» y remiten a **Eventum**, según la normativa de webs de la USAL (Comisión Permanente, 20-03-2026). Esa normativa solo prevé Campus (Apache, MySQL y PHP), Multisite (WordPress cerrado), Diarium y Eventum, que es un servicio externo (eventum.usal.es apunta a symposium.events), temporal y sin dominio propio.
- 06-10-2026, decisión del usuario: **dominio propio (ietic2027.com) y web estática en GitHub Pages**, para no perder lo hecho. El mismo código compila en dos modos (`src/lib/build-mode.ts`): servidor, con panel, o estático, solo la web pública. Para quien visita la web no cambia nada; el panel se usa en local y el programa se publica con `npm run programa:publicar` (ver README). Se descartó colgarla de iuce.usal.es porque parecería una sección de la web del IUCE, que solo es la sede.
- Pendiente: comprar el dominio, configurar Pages y DNS, cambiar la dirección en EasyChair (hoy figura ietic2027.usal.es, que no existe) y, a ser posible, pedir la ficha del congreso en Eventum enlazando a la web.

## 8. Fuentes

- Correo de la organización (23-09-2026) y adjuntos.
- JUTE 2026: https://stellae.usc.es/jute2026/
- Programa ICED26: https://programme.iced26.es/ (repositorio local `ICED26+/WEB PROGRAMME/WEB ICEDD26`).
- Reservas IUCE: https://reservas.iuce.usal.es/ (repositorio local `IUCE-Reservas-TFG`).
- Ediciones anteriores de ieTIC: diarium.usal.es/anagv (ietic2023, IX edición), fundacion.uned.es (ieTIC2025, XI edición, UNED), conferencelists.com y easychair.org/cfp/ietic26 (ieTIC'26, XII edición, Madrid), gite213.usal.es (ieTIC 2013 en Salamanca y 2016 en Bragança).
- Edificio Solís: textos de la web del IUCE (iuce-web).
