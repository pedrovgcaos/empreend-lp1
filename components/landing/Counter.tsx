"use client";

import { useEffect, useRef, useState } from "react";

/** Aceita formatos brasileiros: "500", "76.600", "11.685.450,76". */
function parse(value: string) {
  if (!/^\d{1,3}(\.\d{3})*(,\d+)?$|^\d+(,\d+)?$/.test(value.trim())) return null;
  const [int, dec = ""] = value.trim().split(",");
  return { n: Number(int.replace(/\./g, "") + (dec ? "." + dec : "")), decimals: dec.length };
}

export function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const parsed = parse(value);
  const [text, setText] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || !parsed) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.9) return; // já visível no carregamento

    const fmt = new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: parsed.decimals,
      maximumFractionDigits: parsed.decimals,
    });
    setText(fmt.format(0));
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const dur = 1600;
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur);
          const eased = 1 - Math.pow(1 - p, 4);
          setText(fmt.format(parsed.n * eased));
          if (p < 1) raf = requestAnimationFrame(tick);
          else setText(value);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      setText(value);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <span ref={ref} className="counter">
      {text}
    </span>
  );
}
