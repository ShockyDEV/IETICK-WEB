/**
 * Identificadores estables de edificios y salas ("IUCE · Edificio Solís" →
 * "iuce-edificio-solis"). Se generan al crear y no se editan después: la
 * web pública y las sesiones los usan como referencia.
 */
export function slugify(text: string, maxLength = 60): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, "");
}

/** Primer slug libre: "aula", "aula-2", "aula-3"… */
export function uniqueSlug(base: string, taken: Iterable<string>, fallback = "espacio"): string {
  const used = new Set(taken);
  const root = base || fallback;
  if (!used.has(root)) return root;
  for (let n = 2; ; n++) {
    const candidate = `${root}-${n}`;
    if (!used.has(candidate)) return candidate;
  }
}
