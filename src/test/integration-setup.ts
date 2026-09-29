/**
 * Pruebas de integración: SIEMPRE contra una base de datos cuyo nombre acabe
 * en `_test` (se vacía antes de cada prueba). Por defecto, la del contenedor
 * de desarrollo:
 *
 *   docker exec ietic27-postgres psql -U ietic -d ietic27 -c "CREATE DATABASE ietic27_test"
 *   DATABASE_URL=…/ietic27_test npx prisma db push --skip-generate
 *   npm run test:int
 */
const url =
  process.env.TEST_DATABASE_URL ?? "postgresql://ietic:ietic27-dev@localhost:5435/ietic27_test?schema=public";

if (!/\/[^/?]+_test(\?|$)/.test(url)) {
  throw new Error(`Las pruebas de integración solo se ejecutan contra una BD «*_test» (recibido: ${url}).`);
}
process.env.DATABASE_URL = url;
