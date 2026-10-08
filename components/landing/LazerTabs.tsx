"use client";

import { useEffect, useRef, useState } from "react";
import type { LazerData } from "@/lib/content-types";
import { Img } from "./ui";

const AUTO_MS = 6500;

export function LazerTabs({ cards, hint }: { cards: LazerData["cards"]; hint: string }) {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const [inView, setInView] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const count = cards.length;

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!auto || !inView || count < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = window.setTimeout(() => setActive((a) => (a + 1) % count), AUTO_MS);
    return () => window.clearTimeout(t);
  }, [active, auto, inView, count]);

  useEffect(() => {
    if (active >= count) setActive(0);
  }, [active, count]);

  const choose = (i: number) => {
    setAuto(false);
    setActive(i);
  };

  return (
    <div className="lazer" ref={root} data-auto={auto && inView ? "on" : "off"}>
      <div className="lazer__media" aria-hidden="true">
        {cards.map((c, i) => (
          <div key={i} className={`lazer__img${i === active ? " is-active" : ""}`}>
            <Img img={c.image} sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
        ))}
      </div>
      <div className="lazer__list">
        {hint ? <p className="lazer__hint">{hint}</p> : null}
        {cards.map((c, i) => (
          <div key={i} className={`lazer__item${i === active ? " is-active" : ""}`}>
            <button
              type="button"
              className="lazer__btn"
              aria-expanded={i === active}
              aria-controls={`lazer-panel-${i}`}
              onClick={() => choose(i)}
            >
              <span className="lazer__title">{c.title}</span>
              <span className="lazer__bar" key={`${active}-${auto}`} />
            </button>
            <div className="lazer__panel" id={`lazer-panel-${i}`} role="region">
              <div>
                <div className="lazer__thumb">
                  <Img img={c.image} sizes="100vw" />
                </div>
                <p>{c.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
