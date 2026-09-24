import { z } from "zod";
import { SESSION_TYPES } from "@/lib/session-types";
import { EJES } from "@/content/ejes";
import { TIME_PATTERN } from "@/lib/programme-validate";
import { isRealDate } from "@/lib/admin/format";

/**
 * Esquemas zod del panel. Se usan en el CLIENTE (validación del formulario
 * antes de enviar) y en el SERVIDOR (route handlers de /api/admin/**), así
 * que este módulo no importa nada de servidor.
 *
 * Convenciones de entrada:
 *   · textos opcionales: se recortan y "" se guarda como null;
 *   · listas «uno por línea»: se normalizan (sin líneas vacías);
 *   · números: aceptan número o texto ("40"); vacío → null.
 */

export const DAY_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const PROGRAMME_STATUSES = ["provisional", "definitivo"] as const;
export const ROLES = ["ADMIN", "EDITOR"] as const;
export const EJE_IDS: readonly string[] = EJES.map((e) => e.id);

const tooLong = (max: number) => `Máximo ${max} caracteres`;
/** Mensaje en español para los errores propios de una unión de tipos. */
const unionError = (message: string) => ({ errorMap: () => ({ message }) });

/** Texto opcional: recorta; vacío → null. */
function optionalText(max: number) {
  return z
    .union([z.string(), z.null(), z.undefined()], unionError("Debe ser un texto"))
    .transform((v) => (v ?? "").trim())
    .pipe(z.string().max(max, tooLong(max)))
    .transform((v) => (v === "" ? null : v));
}

/** Texto obligatorio (recortado). */
function requiredText(message: string, max: number) {
  return z
    .string({ required_error: message, invalid_type_error: message })
    .trim()
    .min(1, message)
    .max(max, tooLong(max));
}

/** Lista «uno por línea» guardada como texto (p. ej. ponentes). */
function linesText(max: number) {
  return optionalText(max).transform((v) => {
    const lines = (v ?? "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    return lines.length ? lines.join("\n") : null;
  });
}

/** Lista «uno por línea» guardada como String[] (p. ej. equipamiento). */
function linesArray(maxItems: number, maxLength: number) {
  return z
    .union([z.array(z.string()), z.string(), z.null(), z.undefined()], unionError("Debe ser una lista de textos"))
    .transform((v) =>
      (Array.isArray(v) ? v : (v ?? "").split(/\r?\n/)).map((line) => line.trim()).filter(Boolean),
    )
    .pipe(
      z
        .array(z.string().max(maxLength, `Cada línea admite ${maxLength} caracteres como máximo`))
        .max(maxItems, `Máximo ${maxItems} líneas`),
    );
}

/** URL opcional: http(s) completa o, si se permite, ruta del propio sitio (/espacios/…). */
function optionalUrl(message: string, allowSitePath = false) {
  return optionalText(1000).refine(
    (v) =>
      v === null ||
      /^https?:\/\/[^\s/$.?#][^\s]*$/i.test(v) ||
      (allowSitePath && /^\/(?!\/)[^\s]*$/.test(v)),
    message,
  );
}

/** Entero opcional en un rango; vacío → null. */
function optionalInt(min: number, max: number, message: string) {
  return z
    .union([z.number(), z.string(), z.null(), z.undefined()], unionError(message))
    .transform((v, ctx) => {
      if (v === null || v === undefined || (typeof v === "string" && v.trim() === "")) return null;
      const n = typeof v === "number" ? v : Number(v.trim());
      if (!Number.isInteger(n) || n < min || n > max) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message });
        return z.NEVER;
      }
      return n;
    });
}

/** Referencia opcional (id de sala o edificio); vacío → null. */
const optionalRef = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((v) => (v ?? "").trim() || null)
  .pipe(z.string().max(100).nullable());

const orderField = optionalInt(-100000, 100000, "El orden debe ser un número entero").transform((v) => v ?? 0);

// ─── Sesiones ─────────────────────────────────────────────────────────

export const talkInputSchema = z.object({
  /** Id de una contribución existente (para conservarlo al guardar). */
  id: optionalRef,
  title: requiredText("El título de la contribución es obligatorio", 500),
  authors: optionalText(2000),
  presenter: optionalText(300),
  abstract: optionalText(10000),
  axis: optionalText(60).refine((v) => v === null || EJE_IDS.includes(v), "Eje temático no válido"),
});

export const sessionInputSchema = z
  .object({
    day: z
      .string({ required_error: "Elige un día", invalid_type_error: "Elige un día" })
      .regex(DAY_KEY_PATTERN, "Elige un día"),
    start: z
      .string({ required_error: "Indica la hora de inicio", invalid_type_error: "Indica la hora de inicio" })
      .regex(TIME_PATTERN, "Hora no válida: usa HH:MM (00:00–23:59)"),
    end: z
      .string({ required_error: "Indica la hora de fin", invalid_type_error: "Indica la hora de fin" })
      .regex(TIME_PATTERN, "Hora no válida: usa HH:MM (00:00–23:59)"),
    type: z.enum(SESSION_TYPES, { errorMap: () => ({ message: "Elige un tipo de sesión" }) }),
    title: requiredText("El título en español es obligatorio", 300),
    titlePt: optionalText(300),
    subtitle: optionalText(300),
    subtitlePt: optionalText(300),
    description: optionalText(20000),
    descriptionPt: optionalText(20000),
    speakers: linesText(5000),
    chair: optionalText(500),
    roomId: optionalRef,
    venueId: optionalRef,
    location: optionalText(300),
    locationPt: optionalText(300),
    streamUrl: optionalUrl("Introduce una URL completa (https://…)"),
    published: z.boolean({ invalid_type_error: "Valor no válido" }).default(true),
    cancelled: z.boolean({ invalid_type_error: "Valor no válido" }).default(false),
    /** Desempate entre sesiones a la misma hora; si falta se conserva (o se calcula al crear). */
    order: optionalInt(0, 1000000, "El orden debe ser un número entero positivo"),
    talks: z.array(talkInputSchema).max(300, "Demasiadas contribuciones (máximo 300)").default([]),
  })
  .superRefine((v, ctx) => {
    if (TIME_PATTERN.test(v.start) && TIME_PATTERN.test(v.end) && v.end <= v.start) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end"],
        message: "La hora de fin debe ser posterior a la de inicio",
      });
    }
  });

export const sessionFlagsSchema = z
  .object({
    published: z.boolean().optional(),
    cancelled: z.boolean().optional(),
  })
  .refine((v) => v.published !== undefined || v.cancelled !== undefined, "No hay nada que cambiar");

export type TalkInput = z.infer<typeof talkInputSchema>;
export type SessionInput = z.infer<typeof sessionInputSchema>;
/** Lo que envía el formulario (antes de normalizar). */
export type SessionPayload = z.input<typeof sessionInputSchema>;
export type SessionFlags = z.infer<typeof sessionFlagsSchema>;

// ─── Espacios ─────────────────────────────────────────────────────────

export const venueInputSchema = z.object({
  name: requiredText("El nombre en español es obligatorio", 200),
  namePt: optionalText(200),
  short: optionalText(60),
  subtitle: optionalText(200),
  subtitlePt: optionalText(200),
  address: optionalText(300),
  order: orderField,
});

export const roomInputSchema = z.object({
  venueId: z
    .string({ required_error: "Elige un edificio", invalid_type_error: "Elige un edificio" })
    .trim()
    .min(1, "Elige un edificio")
    .max(100),
  name: requiredText("El nombre en español es obligatorio", 200),
  namePt: optionalText(200),
  code: optionalText(60),
  capacity: optionalInt(0, 100000, "El aforo debe ser un número entero (0 o más)"),
  floor: optionalText(100),
  floorPt: optionalText(100),
  description: optionalText(5000),
  descriptionPt: optionalText(5000),
  equipment: linesArray(60, 200),
  imageUrl: optionalUrl("Usa una ruta del sitio (/espacios/…) o una URL completa (https://…)", true),
  accessible: z.boolean({ invalid_type_error: "Valor no válido" }).default(true),
  order: orderField,
  active: z.boolean({ invalid_type_error: "Valor no válido" }).default(true),
});

export const roomPatchSchema = z.object({
  active: z.boolean({ required_error: "Indica si la sala está activa", invalid_type_error: "Valor no válido" }),
});

export type VenueInput = z.infer<typeof venueInputSchema>;
export type VenuePayload = z.input<typeof venueInputSchema>;
export type RoomInput = z.infer<typeof roomInputSchema>;
export type RoomPayload = z.input<typeof roomInputSchema>;

// ─── Días y ajustes ───────────────────────────────────────────────────

const dayFields = {
  labelEs: requiredText("La etiqueta en español es obligatoria", 100),
  labelPt: requiredText("La etiqueta en portugués es obligatoria", 100),
  order: orderField,
};

export const dayCreateSchema = z.object({
  key: z
    .string({ required_error: "Elige una fecha", invalid_type_error: "Elige una fecha" })
    .trim()
    .regex(DAY_KEY_PATTERN, "Fecha no válida (AAAA-MM-DD)")
    .refine(isRealDate, "Esa fecha no existe"),
  ...dayFields,
});

export const dayUpdateSchema = z.object(dayFields);

export const settingsSchema = z.object({
  programmeStatus: z.enum(PROGRAMME_STATUSES, {
    errorMap: () => ({ message: "Estado no válido: provisional o definitivo" }),
  }),
});

export type DayCreateInput = z.infer<typeof dayCreateSchema>;
export type DayUpdateInput = z.infer<typeof dayUpdateSchema>;

// ─── Cuentas ──────────────────────────────────────────────────────────

/** bcrypt solo usa los primeros 72 bytes: se limita la longitud. */
export const passwordField = z
  .string({ required_error: "Escribe una contraseña", invalid_type_error: "Escribe una contraseña" })
  .min(10, "La contraseña debe tener al menos 10 caracteres")
  .max(72, "La contraseña admite 72 caracteres como máximo");

export const userCreateSchema = z.object({
  email: z
    .string({ required_error: "Escribe el correo", invalid_type_error: "Escribe el correo" })
    .trim()
    .toLowerCase()
    .email("Correo electrónico no válido")
    .max(200, tooLong(200)),
  name: optionalText(120),
  role: z.enum(ROLES, { errorMap: () => ({ message: "Rol no válido" }) }),
  password: passwordField,
});

export const userUpdateSchema = z
  .object({
    name: optionalText(120).optional(),
    role: z.enum(ROLES, { errorMap: () => ({ message: "Rol no válido" }) }).optional(),
    active: z.boolean({ invalid_type_error: "Valor no válido" }).optional(),
  })
  .refine((v) => v.name !== undefined || v.role !== undefined || v.active !== undefined, "No hay nada que cambiar");

export const passwordResetSchema = z.object({ password: passwordField });

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
