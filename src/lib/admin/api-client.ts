import type { FieldIssue } from "@/lib/admin/errors";

/**
 * Cliente de la API del panel para los componentes cliente. Envía y recibe
 * JSON y convierte las respuestas de error en `ApiError` (con los errores
 * de cada campo, si los hay). Si la sesión ha caducado (401), avisa y
 * devuelve al acceso conservando la página actual.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly issues: FieldIssue[];

  constructor(status: number, message: string, issues: FieldIssue[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.issues = issues;
  }
}

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export async function apiRequest<T = unknown>(
  url: string,
  options: { method?: Method; body?: unknown } = {},
): Promise<T> {
  const hasBody = options.body !== undefined;
  let res: Response;
  try {
    res = await fetch(url, {
      method: options.method ?? "GET",
      headers: hasBody ? { "Content-Type": "application/json", Accept: "application/json" } : { Accept: "application/json" },
      body: hasBody ? JSON.stringify(options.body) : undefined,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "No se ha podido conectar con el servidor. Revisa la conexión e inténtalo de nuevo.");
  }

  const data: unknown = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) {
    const body = (data ?? {}) as { error?: unknown; issues?: unknown };
    if (res.status === 401 && typeof window !== "undefined") {
      const back = window.location.pathname + window.location.search;
      window.setTimeout(() => {
        window.location.assign(`/backstage/acceso?callbackUrl=${encodeURIComponent(back)}`);
      }, 1500);
      throw new ApiError(401, "La sesión ha caducado. Te llevamos al acceso…");
    }
    const message = typeof body.error === "string" && body.error ? body.error : `Error ${res.status}`;
    const issues = Array.isArray(body.issues) ? (body.issues as FieldIssue[]) : [];
    throw new ApiError(res.status, message, issues);
  }
  return data as T;
}

/** Mensaje legible de cualquier error. */
export function errorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Ha ocurrido un error inesperado.";
}
