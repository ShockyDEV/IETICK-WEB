"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Número que cuenta desde cero la primera vez que entra en pantalla (el
 * CountUp de DIGIFOLK). El HTML de servidor lleva ya el valor final, así que
 * sin JavaScript o con «reducir movimiento» se ve el número tal cual.
 */
export function CountUp({ value, duration = 1400, className }: { value: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || document.documentElement.dataset.revela !== "si") return;
    let frame = 0;
    setShown(0);
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / duration);
        setShown(Math.round(value * (1 - Math.pow(1 - k, 3))));
        if (k < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={className} aria-label={String(value)}>
      <span aria-hidden className="tabular-nums">
        {shown}
      </span>
    </span>
  );
}
