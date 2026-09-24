# ieTIC 2027 — web del congreso

Web de la **XIII Conferencia Ibérica de Innovación en Educación con TIC (ieTIC 2027)**, Salamanca, 11 y 12 de febrero de 2027, con sede en el Instituto Universitario de Ciencias de la Educación (IUCE) de la Universidad de Salamanca.

Incluye la web pública del congreso (ES/PT), el **programa interactivo** heredero del de ICED26 (parrilla por salas, «en directo», agenda personal) y el panel **/backstage** para editar programa y espacios.

## Stack

| Capa | Elección |
|---|---|
| Framework | Next.js 15.5 (App Router) + React 19 + TypeScript |
| Estilos | Tailwind CSS 3.4 con tokens propios (`tailwind.config.ts`) |
| Datos | PostgreSQL 16 (Docker) + Prisma 6 |
| Panel | Auth.js v5 (credenciales + bcrypt, JWT), zod |
| Tipografías | Sora · Inter · IBM Plex Mono (autoalojadas con `next/font`) |
| Tests | Vitest |
| Despliegue | Docker Compose (imagen `standalone` de Next) |

Es el mismo stack que iuce-web, Reservas y MUPES; se usa la rama 15.5 de Next, que sigue recibiendo parches de seguridad.

## Puesta en marcha (desarrollo)

```bash
docker compose up -d          # PostgreSQL en localhost:5435
npm install
npx prisma db push            # crea las tablas
npm run db:seed               # espacios del IUCE + programa provisional + cuenta del panel
npm run dev                   # http://localhost:3027
```

- Panel: http://localhost:3027/backstage (la cuenta la crea el seed con `ADMIN_EMAIL` / `ADMIN_PASSWORD` del `.env`).
- `SEED_RESET=1 npm run db:seed` vuelve a cargar el programa provisional (borra lo editado en el panel).
- Puertos elegidos para convivir con los demás proyectos: 5432 Reservas · 5433 iuce-web/MUPES · 5434 DIGIFOLK · **5435 / 3027 ieTIC 2027**.

## Idiomas

Español sin prefijo (`/programa`) y portugués bajo `/pt` (`/pt/programa`). El middleware reescribe internamente `/ruta` → `/es/ruta`, así que todas las páginas viven una sola vez en `src/app/(site)/[locale]/`. Los textos están en diccionarios `{ es, pt }` junto a cada página y en `src/content/`.

## El programa

Hereda las ideas del programa en vivo de ICED26 (programme.iced26.es), llevadas a base de datos:

- **Modelo**: `Venue` (edificio) → `Room` (sala) → `Session` → `Talk` (contribuciones). El ámbito de cada sesión decide dónde se pinta: una sala (`roomId`), todas las salas de un edificio (`venueId`, sesiones simultáneas aún sin aula) o fila general (pausas, acreditaciones).
- **Parrilla** con todas las salas a la vez (agrupadas por edificio), lista cronológica en móvil, marcador **en directo** y línea de «ahora» con la hora de Madrid, **agenda personal** en el navegador, buscador, enlace directo a cada sesión (`?sesion=<id>`) y conversión a la hora local del visitante (Portugal va una hora por detrás en febrero).
- **Simular la hora** para revisar el modo en directo antes del congreso: `/programa?ahora=2027-02-11T10:15`.
- Los espacios del IUCE (aforo, equipamiento, fotos) proceden del catálogo de la web de reservas.

## Producción

```bash
cp .env.example .env                              # y rellenar AUTH_SECRET, contraseñas y URL
docker compose --profile prod up -d --build       # app en el puerto 3027 + PostgreSQL
docker compose --profile tools run --rm migrate   # primera vez: tablas + seed
```

Detrás de Apache/nginx con TLS, como Reservas. Cambiar la contraseña del panel tras el primer acceso.

## Estructura

```
src/
├── app/(site)/[locale]/   web pública (portada, congreso, programa, ponentes, comunicaciones,
│                          inscripción, comités, sede y páginas legales)
├── app/(admin)/backstage/ panel de administración
├── app/api/               Auth.js y API del panel
├── components/programme/  programa interactivo (parrilla, lista, ficha, agenda, buscador)
├── components/art/        ilustración del hero (skyline de Salamanca en SVG)
├── content/               textos y datos del congreso (ejes, sede, semilla del programa, legales)
└── lib/                   Prisma, i18n, hora de Madrid, capa de datos del programa
prisma/                    esquema y seed
docs/ANALISIS.md           análisis del encargo y decisiones
```

## Comprobaciones

```bash
npm run typecheck
npm test
```
