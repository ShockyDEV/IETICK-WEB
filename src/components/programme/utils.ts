"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n";
import { tr, type ProgrammeData, type ProgrammeSession } from "@/lib/programme";
import { SESSION_TYPE_META } from "@/lib/session-types";
import { madridDate } from "@/lib/time";

/** "#167492" → "rgba(22,116,146,0.08)" */
export function rgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

/** Texto indexable de una sesión (título ES/PT, ponentes, sala, tipo, contribuciones). */
export function searchText(s: ProgrammeSession, data: ProgrammeData): string {
  const room = data.rooms.find((r) => r.id === s.roomId);
  const venue = data.venues.find((v) => v.id === (room?.venueId ?? s.venueId));
  return norm(
    [
      s.title,
      s.titlePt,
      s.subtitle,
      s.subtitlePt,
      s.speakers,
      s.chair,
      room?.name,
      room?.namePt,
      room?.code,
      venue?.name,
      s.location,
      SESSION_TYPE_META[s.type].label.es,
      SESSION_TYPE_META[s.type].label.pt,
      ...s.talks.flatMap((t) => [t.title, t.authors, t.presenter]),
    ]
      .filter(Boolean)
      .join(" · "),
  );
}

export function matches(haystack: string, query: string): boolean {
  const terms = norm(query).split(/\s+/).filter(Boolean);
  return terms.length > 0 && terms.every((t) => haystack.includes(t));
}

export function sessionTitleOf(s: ProgrammeSession, locale: Locale) {
  return tr(s.title, s.titlePt, locale);
}

// ─── Agenda personal (localStorage, sin cuentas) ─────────────────────────
const AGENDA_KEY = "ietic27:agenda";

export function useAgenda(): [Set<string>, (id: string) => boolean] {
  const [ids, setIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(AGENDA_KEY);
      if (raw) setIds(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* navegación privada o almacenamiento bloqueado: agenda vacía */
    }
    // Sincroniza entre pestañas
    const onStorage = (e: StorageEvent) => {
      if (e.key !== AGENDA_KEY) return;
      try {
        setIds(new Set(e.newValue ? (JSON.parse(e.newValue) as string[]) : []));
      } catch {}
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Espejo síncrono del estado: el actualizador de setState no se ejecuta
  // al momento, y toggle() necesita saber ya si la sesión quedó guardada.
  const current = useRef(ids);
  current.current = ids;

  /** Alterna una sesión; devuelve true si queda guardada. */
  const toggle = useCallback((id: string) => {
    const next = new Set(current.current);
    const added = !next.has(id);
    if (added) next.add(id);
    else next.delete(id);
    current.current = next;
    setIds(next);
    try {
      localStorage.setItem(AGENDA_KEY, JSON.stringify([...next]));
    } catch {}
    return added;
  }, []);

  return [ids, toggle];
}

/**
 * Hora simulada para revisar el modo «en directo» antes del congreso:
 *   /programa?ahora=2027-02-11T10:15   (hora de Madrid)
 */
export function parseSimulatedNow(value: string | null): Date | null {
  if (!value) return null;
  const m = value.match(/^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})$/);
  if (!m) return null;
  const d = madridDate(m[1], m[2]);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
