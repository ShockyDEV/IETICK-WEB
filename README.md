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
| Tipografías | Sora · Inter · EB Garamond en cursiva (autoalojadas con `next/font`); IBM Plex Mono solo en /backstage |
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

## El panel (/backstage)

Equivalente al editor `/backstage` del programa de ICED26, pero guardando directamente en la base de datos. En modo servidor lo que se publica aparece al momento; con la web estática se usa en local y se publica con `npm run programa:publicar` (ver «Publicación»).

- **Resumen**: cifras del programa, conmutador provisional/definitivo y **avisos de validación** (solapes en una sala, sesiones de aula que pisan unas simultáneas del edificio, filas generales que no son pausas, horas imposibles, días o salas inexistentes, borradores y ponencias sin ponentes), cada uno con enlace a la sesión.
- **Programa**: listado por días con buscador; crear, editar, duplicar (como borrador), publicar/despublicar, cancelar y borrar. El formulario tiene los textos en ES y PT, ponentes (uno por línea), un único selector de **ubicación** (fila general / todo un edificio / sala) y el editor de **contribuciones** con su eje temático.
- **Espacios**: edificios y salas (aforo, planta, equipamiento, foto). No deja borrar una sala con sesiones: propone desactivarla.
- **Ajustes**: estado del programa, días del congreso y **exportación completa en JSON** (copia de seguridad).
- **Cuentas** (solo rol ADMIN): cuentas EDITOR/ADMIN, sin borrado, solo se desactivan. Nadie puede quitarse a sí mismo el rol de administración y siempre queda un ADMIN activo.

Seguridad: sesión comprobada en el middleware, en cada página y en cada API contra la base de datos (desactivar una cuenta surte efecto al instante), control de origen en las escrituras, límite de intentos en el acceso y contraseñas con bcrypt.

## Publicación: dos modos con el mismo código

El CPD no da máquinas virtuales para eventos (CAU-49199), así que la web se publica **estática en GitHub Pages**. El código sirve igual para un servidor si algún día lo hay.

### Versión estática (GitHub Pages, la que está en uso)

Las páginas se generan al compilar, leyendo el programa de la base de datos, y GitHub las sirve ya hechas. Para quien visita la web no cambia nada respecto al modo servidor: parrilla, modo en directo, agenda, buscador, fichas y los dos idiomas funcionan en el navegador. No están el panel ni la API (ficheros `*.server.*`).

```bash
npm run build:static     # out/: español en la raíz, portugués en /pt, 404.html
npm run preview:static   # la sirve en http://localhost:3028 como GitHub Pages
```

- **Publicar cambios del programa**: se editan en el panel en local y `npm run programa:publicar` los guarda en `prisma/programa-publicado.json`. Al subir ese fichero a `main`, el flujo `.github/workflows/pages.yml` carga el programa en una base de datos de usar y tirar, compila y publica en unos minutos.
- **Cambios de textos o diseño**: basta con subirlos a `main`.
- **Cada noche** se vuelve a compilar, para los textos que dependen de la fecha.
- **Puesta en marcha** (una vez): en el repositorio, *Settings → Pages → Source: GitHub Actions*; la variable `PAGES_DOMAIN` (*Settings → Secrets and variables → Actions → Variables*) con el dominio, y en el registrador del dominio cuatro registros A a `185.199.108.153`, `185.199.109.153`, `185.199.110.153` y `185.199.111.153`, y un CNAME de `www` a `shockydev.github.io`. Después, *Custom domain* y *Enforce HTTPS* en *Settings → Pages*. Sin `PAGES_DOMAIN`, cada push solo comprueba que la versión estática compila.

### Modo servidor (Docker)

```bash
cp .env.example .env                              # y rellenar AUTH_SECRET, contraseñas y URL
docker compose --profile prod up -d --build       # app en el puerto 3027 + PostgreSQL
docker compose --profile tools run --rm migrate   # primera vez: tablas + seed
```

Detrás de Apache/nginx con TLS, como Reservas. Cambiar la contraseña del panel tras el primer acceso. Aquí el panel publica al momento.

## Estructura

```
src/
├── app/(site)/[locale]/   web pública (portada, congreso, programa, ponentes, comunicaciones,
│                          inscripción, comités, sede y páginas legales)
├── app/(admin)/backstage/ panel de administración (*.server.tsx: solo en modo servidor)
├── app/api/               Auth.js y API del panel (*.server.ts: solo en modo servidor)
├── components/programme/  programa interactivo (parrilla, lista, ficha, agenda, buscador)
├── components/art/        ilustración del hero (skyline de Salamanca en SVG)
├── content/               textos y datos del congreso (ejes, sede, semilla del programa, legales)
└── lib/                   Prisma, i18n, hora de Madrid, capa de datos del programa
prisma/                    esquema, seed y programa publicado (programa-publicado.json)
docs/ANALISIS.md           análisis del encargo y decisiones
```

## Comprobaciones

```bash
npm run typecheck
npm test            # unitarias: hora de Madrid, parrilla, validador, capa HTTP del panel…
npm run test:int    # integración de los servicios del panel contra PostgreSQL
```

Las pruebas de integración se ejecutan **solo** contra una base de datos cuyo nombre acaba en `_test`, que vacían antes de cada prueba. Para crearla en el contenedor de desarrollo:

```bash
docker exec ietic27-postgres psql -U ietic -d ietic27 -c "CREATE DATABASE ietic27_test"
DATABASE_URL="postgresql://ietic:ietic27-dev@localhost:5435/ietic27_test?schema=public" npx prisma db push --skip-generate
```

En GitHub, `.github/workflows/ci.yml` lo repite todo en cada push (tipos, lint, pruebas con PostgreSQL y build).
