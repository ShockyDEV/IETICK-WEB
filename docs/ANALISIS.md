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
- Entidades organizadoras y colaboradoras (hoy: Universidad de Salamanca). El IUCE es solo la sede: no organiza el congreso, así que la web no usa sus datos de contacto (28-09-2026). **Falta el correo de contacto del congreso** (`SITE.contactEmail`; mientras esté vacío no se muestra ninguna línea de contacto). En ediciones anteriores participaron el Instituto Politécnico de Bragança, la Universidade Aberta, la UCM y la UNED.
- Ponentes, participantes del panel y de la mesa redonda; talleres y su aula; mesas de comunicaciones.
- Normas y plantillas de comunicaciones, plataforma de envío, fechas clave, cuotas e inscripción, comités, alojamiento.
- Correo de contacto propio del congreso (hoy se muestra el del IUCE como sede) y dominio de la web.
- Textos propuestos (presentación, «a quién se dirige», legales) y traducción al portugués.
- En el Word el lema dice «Diseño Universal **de** Aprendizaje» y en los ejes «Diseño Universal **para el** Aprendizaje»; se ha respetado cada literal.

## 7. Fuentes

- Correo de la organización (23-09-2026) y adjuntos.
- JUTE 2026: https://stellae.usc.es/jute2026/
- Programa ICED26: https://programme.iced26.es/ (repositorio local `ICED26+/WEB PROGRAMME/WEB ICEDD26`).
- Reservas IUCE: https://reservas.iuce.usal.es/ (repositorio local `IUCE-Reservas-TFG`).
- Ediciones anteriores de ieTIC: diarium.usal.es/anagv (ietic2023, IX edición), fundacion.uned.es (ieTIC2025, XI edición, UNED), conferencelists.com y easychair.org/cfp/ietic26 (ieTIC'26, XII edición, Madrid), gite213.usal.es (ieTIC 2013 en Salamanca y 2016 en Bragança).
- Edificio Solís: textos de la web del IUCE (iuce-web).
