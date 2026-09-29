"use client";

import { useEffect, useState } from "react";
import { madridDate } from "@/lib/time";
import type { Locale } from "@/lib/i18n";

const T = {
  es: { days: "días", hours: "horas", minutes: "min", until: "para la inauguración", live: "ieTIC 2027 está en marcha", over: "Gracias por participar en ieTIC 2027" },
  pt: { days: "dias", hours: "horas", minutes: "min", until: "para a abertura", live: "O ieTIC 2027 está a decorrer", over: "Obrigado por participar no ieTIC 2027" },
} as const;

/**
 * Cuenta atrás hasta la inauguración (hora de Madrid). Se calcula solo en el
 * cliente para no provocar diferencias de hidratación.
 */
export function Countdown({
  locale,
  start,
  end,
}: {
  locale: Locale;
  start: { day: string; time: string };
  end: { day: string; time: string };
}) {
  const t = T[locale];
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  const startMs = madridDate(start.day, start.time).getTime();
  const endMs = madridDate(end.day, end.time).getTime();

  if (now === null) {
    return <div className="h-[4.25rem]" aria-hidden />;
  }
  if (now >= endMs) {
    return <p className="nota text-cian-200">{t.over}</p>;
  }
  if (now >= startMs) {
    return (
      <p className="nota inline-flex items-center gap-2 text-oro-200">
        <span className="h-2 w-2 animate-latido rounded-full bg-oro-400" aria-hidden />
        {t.live}
      </p>
    );
  }

  const diff = startMs - now;
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const parts = [
    { v: days, l: t.days },
    { v: hours, l: t.hours },
    { v: minutes, l: t.minutes },
  ];

  return (
    <div className="flex items-end gap-4" role="timer" aria-live="off">
      {parts.map((p) => (
        <div key={p.l} className="min-w-[3.5rem]">
          <span className="block font-display text-3xl font-semibold tabular-nums text-white">{p.v}</span>
          <span className="nota block text-cian-200/80">{p.l}</span>
        </div>
      ))}
      <span className="nota pb-0.5 text-white/60">{t.until}</span>
    </div>
  );
}
