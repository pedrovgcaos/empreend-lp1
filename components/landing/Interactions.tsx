"use client";

import { useEffect, useRef, useState } from "react";
import type { Settings } from "@/lib/content-types";
import { captureUtm, pushDataLayer, setCtaOrigin, whatsappUrl } from "@/lib/tracking";
import { LeadForm } from "./LeadForm";
import { FORM_HASH } from "./ui";

type Mode = "form" | "exit";

export function Interactions({ settings, preview }: { settings: Settings; preview?: boolean }) {
  const ui = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<Mode>("form");
  const [formKey, setFormKey] = useState(0);
  const [stickyOn, setStickyOn] = useState(false);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const openForm = (m: Mode) => {
    setMode(m);
    setFormKey((k) => k + 1);
    const d = dialog.current;
    if (d && !d.open) d.showModal();
  };

  // Rolagem: cabeçalho, barra de progresso e barra fixa no mobile.
  useEffect(() => {
    captureUtm();
    const root = ui.current?.closest<HTMLElement>(".lp");
    if (!root) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      root.dataset.scrolled = y > 40 ? "true" : "false";
      root.style.setProperty("--progress", String(max > 0 ? Math.min(1, y / max) : 0));
      const formSection = root.querySelector(".s-chamada .lead");
      const formVisible = formSection
        ? formSection.getBoundingClientRect().top < window.innerHeight
        : false;
      setStickyOn(y > window.innerHeight * 0.7 && !formVisible);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Revelação dos blocos ao entrar na tela (inclui blocos novos da pré-visualização).
  useEffect(() => {
    const root = ui.current?.closest<HTMLElement>(".lp");
    if (!root) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );
    const scan = () =>
      root.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });
    root.classList.add("lp--ready");
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  // Cliques: abre o formulário em links #agendar e envia eventos de CTA para o dataLayer.
  useEffect(() => {
    const root = ui.current?.closest<HTMLElement>(".lp");
    if (!root) return;
    const onClick = (ev: MouseEvent) => {
      const a = (ev.target as HTMLElement).closest<HTMLAnchorElement>("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const label = a.dataset.cta;
      const s = settingsRef.current;
      if (label) {
        pushDataLayer({
          event: s.tracking.ctaEvent || "cta_click",
          cta_label: label,
          cta_href: href,
          cta_section: a.dataset.ctaSection || undefined,
        });
      }
      if (href === FORM_HASH || href.startsWith(`${FORM_HASH}?`)) {
        ev.preventDefault();
        setCtaOrigin(label || "");
        openForm("form");
        return;
      }
      if (preview && !href.startsWith("#")) ev.preventDefault();
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [preview]);

  // Abre o formulário se a página for acessada com #agendar na URL.
  useEffect(() => {
    if (!preview && window.location.hash === FORM_HASH) {
      setCtaOrigin("url");
      openForm("form");
    }
  }, [preview]);

  // Intenção de saída (desktop): uma vez por sessão.
  useEffect(() => {
    if (preview || !settings.retention.exitIntent) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let armed = false;
    const t = window.setTimeout(() => (armed = true), 10000);
    const onOut = (e: MouseEvent) => {
      if (!armed || e.relatedTarget || e.clientY > 0) return;
      try {
        if (sessionStorage.getItem("vn_exit")) return;
        sessionStorage.setItem("vn_exit", "1");
      } catch {
        /* ignora */
      }
      if (dialog.current?.open) return;
      setCtaOrigin("intencao-de-saida");
      openForm("exit");
    };
    document.addEventListener("mouseout", onOut);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("mouseout", onOut);
    };
  }, [preview, settings.retention.exitIntent]);

  const { form, retention, whatsapp } = settings;
  const wa = whatsapp.enabled && whatsapp.number ? whatsappUrl(whatsapp.number, whatsapp.message) : "";

  return (
    <div className="lp-ui" ref={ui}>
      {retention.scrollProgress ? <div className="progress" aria-hidden="true" /> : null}

      {wa ? (
        <a
          className="wa-float"
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          data-cta="WhatsApp flutuante"
          aria-label={whatsapp.label}
        >
          <WhatsIcon />
        </a>
      ) : null}

      {retention.stickyBar ? (
        <div className={`sticky-bar${stickyOn ? " is-on" : ""}`}>
          <a href={FORM_HASH} className="btn btn--solid" data-cta={retention.stickyLabel} data-cta-section="barra-fixa">
            <span>{retention.stickyLabel}</span>
          </a>
          {wa ? (
            <a
              href={wa}
              className="sticky-bar__wa"
              target="_blank"
              rel="noopener noreferrer"
              data-cta="WhatsApp barra fixa"
              aria-label={whatsapp.label}
            >
              <WhatsIcon />
            </a>
          ) : null}
        </div>
      ) : null}

      <dialog
        ref={dialog}
        className="modal"
        aria-labelledby="modal-title"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      >
        <div className="modal__box">
          <button type="button" className="icon-btn modal__close" onClick={() => dialog.current?.close()} aria-label="Fechar">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
          <h2 id="modal-title" className="modal__title">
            {mode === "exit" ? retention.exitTitle : form.title}
          </h2>
          <p className="modal__text">{mode === "exit" ? retention.exitText : form.text}</p>
          <LeadForm key={formKey} settings={settings} location={mode === "exit" ? "saida" : "modal"} preview={preview} />
        </div>
      </dialog>
    </div>
  );
}

function WhatsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="wa-icon">
      <path d="M12 2.2A9.7 9.7 0 0 0 3.7 16.9L2.3 21.8l5-1.3A9.7 9.7 0 1 0 12 2.2Zm0 17.7a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 19.9Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.5.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.2.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.5-.4h-.5a.9.9 0 0 0-.7.3 2.8 2.8 0 0 0-.9 2.1 4.9 4.9 0 0 0 1 2.6 11.2 11.2 0 0 0 4.3 3.8c1.6.7 2.2.7 3 .6.5-.1 1.4-.6 1.6-1.2.2-.6.2-1.1.1-1.2l-.5-.2Z" />
    </svg>
  );
}
