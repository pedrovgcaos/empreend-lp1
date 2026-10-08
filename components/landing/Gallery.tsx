"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { NaturezaData } from "@/lib/content-types";
import { Img } from "./ui";

export function Gallery({ items }: { items: NaturezaData["gallery"] }) {
  const track = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState<number | null>(null);
  const list = items.filter((i) => i.image?.src);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const show = (i: number) => {
    setOpen(i);
    dialog.current?.showModal();
  };
  const close = () => dialog.current?.close();
  const step = useCallback(
    (d: number) => setOpen((o) => (o === null ? o : (o + d + list.length) % list.length)),
    [list.length],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!dialog.current?.open) return;
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step]);

  if (!list.length) return null;

  return (
    <div className="gallery">
      <div className="gallery__track" ref={track}>
        {list.map((item, i) => (
          <button
            type="button"
            key={i}
            className="gallery__item"
            onClick={() => show(i)}
            aria-label={`Ampliar imagem: ${item.image.alt || i + 1}`}
          >
            <Img img={item.image} sizes="(max-width: 700px) 80vw, 38vw" />
          </button>
        ))}
      </div>
      <div className="gallery__nav">
        <button type="button" className="icon-btn" onClick={() => scroll(-1)} aria-label="Imagens anteriores">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <button type="button" className="icon-btn" onClick={() => scroll(1)} aria-label="Próximas imagens">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>

      <dialog
        ref={dialog}
        className="lightbox"
        onClose={() => setOpen(null)}
        onClick={(e) => e.target === dialog.current && close()}
      >
        {open !== null && list[open] ? (
          <figure>
            <div className="lightbox__img">
              <Img img={list[open].image} sizes="100vw" />
            </div>
            {list[open].image.alt ? <figcaption>{list[open].image.alt}</figcaption> : null}
          </figure>
        ) : null}
        <button type="button" className="icon-btn lightbox__close" onClick={close} aria-label="Fechar">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
        {list.length > 1 ? (
          <>
            <button type="button" className="icon-btn lightbox__prev" onClick={() => step(-1)} aria-label="Imagem anterior">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
            </button>
            <button type="button" className="icon-btn lightbox__next" onClick={() => step(1)} aria-label="Próxima imagem">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </>
        ) : null}
      </dialog>
    </div>
  );
}
