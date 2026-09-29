import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { HttpError } from "@/lib/admin/errors";
import { safeCallbackUrl } from "@/lib/admin/callback-url";

// La sesión se simula: aquí se prueba solo la capa HTTP del panel.
const requireAdmin = vi.fn();
vi.mock("@/lib/admin/guard", () => ({ requireAdmin: (...args: unknown[]) => requireAdmin(...args) }));

const { adminRoute, readJson } = await import("@/lib/admin/http");

const USER = { id: "u1", email: "admin@ietic27.local", name: null, role: "ADMIN" as const };
const okHandler = adminRoute(async () => new Response("ok"));

function req(method: string, headers: Record<string, string> = {}, body?: string) {
  return new Request("http://localhost:3027/api/admin/sessions", {
    method,
    headers: { host: "localhost:3027", ...headers },
    body,
  });
}

beforeEach(() => {
  requireAdmin.mockReset();
  requireAdmin.mockResolvedValue(USER);
});

describe("adminRoute · anti-CSRF por Origin", () => {
  it("acepta escrituras del propio sitio o sin cabecera Origin", async () => {
    expect((await okHandler(req("POST", { origin: "http://localhost:3027" }), { params: Promise.resolve({}) })).status).toBe(200);
    expect((await okHandler(req("POST"), { params: Promise.resolve({}) })).status).toBe(200);
  });

  it("rechaza escrituras desde otro origen (403) sin llegar a comprobar la sesión", async () => {
    const res = await okHandler(req("DELETE", { origin: "https://malicioso.example" }), { params: Promise.resolve({}) });
    expect(res.status).toBe(403);
    expect(requireAdmin).not.toHaveBeenCalled();
  });

  it("las lecturas no se ven afectadas por el origen", async () => {
    const res = await okHandler(req("GET", { origin: "https://otro.example" }), { params: Promise.resolve({}) });
    expect(res.status).toBe(200);
  });

  it("respeta el host del proxy (X-Forwarded-Host)", async () => {
    const res = await okHandler(
      req("POST", { origin: "https://ietic27.usal.es", "x-forwarded-host": "ietic27.usal.es" }),
      { params: Promise.resolve({}) },
    );
    expect(res.status).toBe(200);
  });
});

describe("adminRoute · errores como JSON", () => {
  it("sin sesión → 401", async () => {
    requireAdmin.mockRejectedValue(new HttpError(401, "No autorizado"));
    const res = await okHandler(req("GET"), { params: Promise.resolve({}) });
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "No autorizado" });
  });

  it("pasa el rol exigido al guard", async () => {
    const onlyAdmin = adminRoute(async () => new Response("ok"), { role: "ADMIN" });
    await onlyAdmin(req("GET"), { params: Promise.resolve({}) });
    expect(requireAdmin).toHaveBeenCalledWith({ role: "ADMIN" });
  });

  it("registro inexistente de Prisma (P2025) → 404", async () => {
    const h = adminRoute(async () => {
      throw new Prisma.PrismaClientKnownRequestError("No existe", { code: "P2025", clientVersion: "6" });
    });
    expect((await h(req("GET"), { params: Promise.resolve({}) })).status).toBe(404);
  });

  it("error inesperado → 500 sin filtrar detalles", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const h = adminRoute(async () => {
      throw new Error("detalle interno de la BD");
    });
    const res = await h(req("GET"), { params: Promise.resolve({}) });
    expect(res.status).toBe(500);
    expect(JSON.stringify(await res.json())).not.toMatch(/detalle interno/);
    spy.mockRestore();
  });

  it("pasa los parámetros de ruta al handler", async () => {
    const h = adminRoute<{ id: string }>(async (_r, { params }) => Response.json(params));
    const res = await h(req("GET"), { params: Promise.resolve({ id: "abc" }) });
    expect(await res.json()).toEqual({ id: "abc" });
  });
});

describe("readJson", () => {
  const schema = z.object({ title: z.string().min(1, "Obligatorio") });

  it("exige JSON (415) y válido (400)", async () => {
    await expect(readJson(req("POST", { "content-type": "text/plain" }, "x"), schema)).rejects.toMatchObject({ status: 415 });
    await expect(readJson(req("POST", { "content-type": "application/json" }, "{"), schema)).rejects.toMatchObject({ status: 400 });
  });

  it("devuelve los errores por campo", async () => {
    const error = await readJson(req("POST", { "content-type": "application/json" }, JSON.stringify({ title: "" })), schema).catch(
      (e: HttpError) => e,
    );
    expect(error).toMatchObject({ status: 400, issues: [{ path: "title", message: "Obligatorio" }] });
  });
});

describe("safeCallbackUrl · sin redirecciones abiertas", () => {
  it.each([
    ["/backstage/programa", "/backstage/programa"],
    ["/backstage/programa?dia=2027-02-11", "/backstage/programa?dia=2027-02-11"],
    ["http://localhost:3027/backstage/espacios", "/backstage/espacios"],
    ["https://malicioso.example/backstage", "/backstage"],
    ["//malicioso.example", "/backstage"],
    ["/\\malicioso.example", "/backstage"],
    ["/programa", "/backstage"],
    ["/backstage-falso", "/backstage"],
    ["/backstage/acceso", "/backstage"],
    ["javascript:alert(1)", "/backstage"],
    ["", "/backstage"],
    [null, "/backstage"],
  ])("%s → %s", (input, expected) => {
    expect(safeCallbackUrl(input)).toBe(expected);
  });
});
