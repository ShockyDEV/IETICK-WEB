import "server-only";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { ZodError, type z, type ZodTypeAny } from "zod";
import { HttpError, zodIssues, type FieldIssue } from "@/lib/admin/errors";
import { requireAdmin, type AdminUser } from "@/lib/admin/guard";
import type { Role } from "@/lib/admin/types";

/**
 * Utilidades de los route handlers de /api/admin/**.
 *
 *   export const PUT = adminRoute<{ id: string }>(async (req, { params, user }) => {
 *     const input = await readJson(req, schema);
 *     …
 *     revalidatePublic();
 *     return ok(data);
 *   });
 *
 * `adminRoute` comprueba el origen (peticiones de escritura), la sesión y el
 * rol, y convierte cualquier error en una respuesta JSON coherente:
 *   { error: string, issues?: { path, message }[] }
 */

const NO_STORE = { "Cache-Control": "no-store" };

export function ok<T>(data: T, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: NO_STORE });
}

export function jsonError(status: number, error: string, issues: FieldIssue[] = []): NextResponse {
  return NextResponse.json(issues.length ? { error, issues } : { error }, { status, headers: NO_STORE });
}

export function toErrorResponse(e: unknown): NextResponse {
  if (e instanceof HttpError) return jsonError(e.status, e.message, e.issues);
  if (e instanceof ZodError) return jsonError(400, "Hay campos no válidos.", zodIssues(e));
  if (e instanceof Prisma.PrismaClientKnownRequestError) {
    if (e.code === "P2025") return jsonError(404, "No se ha encontrado el registro (puede que ya se haya borrado).");
    if (e.code === "P2002") return jsonError(409, "Ya existe un registro con ese identificador.");
    if (e.code === "P2003") return jsonError(409, "El registro está en uso o hace referencia a otro que no existe.");
  }
  console.error("[api/admin]", e);
  return jsonError(500, "Error interno del servidor. Inténtalo de nuevo.");
}

/**
 * Anti-CSRF: en peticiones de escritura, si el navegador envía `Origin`,
 * debe ser el propio sitio. (La cookie de sesión ya es SameSite=Lax y además
 * se exige cuerpo JSON, que un formulario de otro sitio no puede enviar.)
 */
function assertSameOrigin(req: Request): void {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;
  const origin = req.headers.get("origin");
  if (!origin) return;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new HttpError(403, "Origen no permitido.");
  }
  const hosts = [req.headers.get("x-forwarded-host"), req.headers.get("host")]
    .flatMap((h) => (h ? h.split(",") : []))
    .map((h) => h.trim())
    .filter(Boolean);
  if (!hosts.includes(originHost)) throw new HttpError(403, "Origen no permitido.");
}

type Params = Record<string, string>;

export function adminRoute<P extends Params = Params>(
  handler: (req: Request, ctx: { params: P; user: AdminUser }) => Promise<Response>,
  options: { role?: Role } = {},
) {
  return async (req: Request, context: { params: Promise<P> }): Promise<Response> => {
    try {
      assertSameOrigin(req);
      const user = await requireAdmin(options);
      const params = context?.params ? await context.params : ({} as P);
      return await handler(req, { params, user });
    } catch (e) {
      return toErrorResponse(e);
    }
  };
}

/** Lee y valida el cuerpo JSON con un esquema zod (400 con `issues` si no vale). */
export async function readJson<S extends ZodTypeAny>(req: Request, schema: S): Promise<z.output<S>> {
  const type = (req.headers.get("content-type") ?? "").toLowerCase();
  if (!type.includes("application/json")) {
    throw new HttpError(415, "El cuerpo de la petición debe ser JSON (Content-Type: application/json).");
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "El cuerpo de la petición no es un JSON válido.");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) throw new HttpError(400, "Hay campos no válidos.", zodIssues(parsed.error));
  return parsed.data;
}

/** Tras cada escritura: la web pública (todas las rutas) vuelve a leer la BD. */
export function revalidatePublic(): void {
  try {
    revalidatePath("/", "layout");
  } catch (e) {
    console.error("[api/admin] revalidatePath", e);
  }
}
