import type { ZodError } from "zod";

/**
 * Errores del panel. `HttpError` lo lanzan los servicios y el guard; el
 * envoltorio de las rutas (`adminRoute`) lo convierte en respuesta JSON:
 *
 *   { "error": "Mensaje para el usuario", "issues": [{ "path": "end", "message": "…" }] }
 *
 * Módulo puro (sin dependencias de servidor): el cliente usa `FieldIssue` y
 * `issuesToFieldErrors` para pintar los errores de cada campo.
 */
export interface FieldIssue {
  /** Ruta del campo con puntos: "title", "talks.2.title"… */
  path: string;
  message: string;
}

export class HttpError extends Error {
  readonly status: number;
  readonly issues: FieldIssue[];

  constructor(status: number, message: string, issues: FieldIssue[] = []) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.issues = issues;
  }
}

export function zodIssues(error: ZodError): FieldIssue[] {
  return error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }));
}

/** { ruta → primer mensaje } para pintar un error por campo. */
export function issuesToFieldErrors(issues: FieldIssue[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path || "_";
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
