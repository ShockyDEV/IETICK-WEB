"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { Locale } from "@/lib/i18n";
import { tr, type ProgrammeData } from "@/lib/programme";
import { shortDay } from "@/lib/programme-format";
import { SESSION_TYPE_META } from "@/lib/session-types";
import { cn } from "@/lib/cn";
import type { ProgrammeStrings } from "./i18n";
import { matches, searchText } from "./utils";

/** Buscador con lista desplegable accesible (patrón combobox). */
export function SessionSearch({
  data,
  locale,
  t,
  onSelect,
  className,
}: {
  data: ProgrammeData;
  locale: Locale;
  t: ProgrammeStrings;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo(() => data.sessions.map((s) => ({ s, text: searchText(s, data) })), [data]);
  const results = useMemo(
    () => (q.trim().length < 2 ? [] : index.filter((x) => matches(x.text, q)).slice(0, 8).map((x) => x.s)),
    [index, q],
  );
  const showList = open && q.trim().length >= 2;

  const choose = (id: string) => {
    onSelect(id);
    setQ("");
    setOpen(false);
    inputRef.current?.blur();
  };

  return (
    <div className={cn("relative", className)}>
      <label className="sr-only" htmlFor={`${listId}-input`}>
        {t.searchLabel}
      </label>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-tinta-tenue" aria-hidden />
      <input
        ref={inputRef}
        id={`${listId}-input`}
        type="search"
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && results[active] ? `${listId}-${results[active].id}` : undefined}
        autoComplete="off"
        value={q}
        placeholder={t.search}
        onChange={(e) => {
          setQ(e.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(a + 1, results.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(a - 1, 0));
          } else if (e.key === "Enter" && results[active]) {
            e.preventDefault();
            choose(results[active].id);
          } else if (e.key === "Escape") {
            setQ("");
            setOpen(false);
          }
        }}
        className="h-11 w-full rounded-full border border-linea bg-white pl-10 pr-10 text-sm text-tinta placeholder:text-tinta-tenue focus:border-mar-400 focus:outline-none focus:ring-2 focus:ring-mar-200 [&::-webkit-search-cancel-button]:hidden"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ("")}
          className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-tinta-tenue hover:bg-papel"
          aria-label={t.close}
        >
          <X className="h-4 w-4" aria-hidden />
        </button>
      )}
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-50 max-h-96 overflow-y-auto rounded-2xl border border-linea bg-white p-1.5 shadow-elevada"
        >
          {results.length === 0 ? (
            <li className="px-3 py-3 text-sm text-tinta-tenue">{t.noResults}</li>
          ) : (
            results.map((s, i) => {
              const meta = SESSION_TYPE_META[s.type];
              return (
                <li
                  key={s.id}
                  id={`${listId}-${s.id}`}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(s.id)}
                  onMouseEnter={() => setActive(i)}
                  className={cn("flex cursor-pointer gap-3 rounded-xl px-3 py-2.5", i === active && "bg-papel")}
                >
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: meta.color }} aria-hidden />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-tinta">{tr(s.title, s.titlePt, locale)}</span>
                    <span className="block font-mono text-xs text-tinta-tenue">
                      {shortDay(s.day, locale)} · {s.start}–{s.end} · {meta.label[locale]}
                    </span>
                  </span>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
