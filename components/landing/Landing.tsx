import type { CSSProperties } from "react";
import type { PublicContent, Settings } from "@/lib/content-types";
import { Interactions } from "./Interactions";
import { SectionView } from "./Sections";
import { Cta, Logo } from "./ui";

function themeVars(t: Settings["theme"]): CSSProperties {
  return {
    "--deep": t.deep,
    "--accent": t.accent,
    "--mist": t.mist,
    "--ink": t.ink,
    "--paper": t.paper,
  } as CSSProperties;
}

function SocialIcon({ label }: { label: string }) {
  const l = label.toLowerCase();
  if (l.includes("insta"))
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r=".8" className="fill" />
      </svg>
    );
  if (l.includes("face"))
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v2H7v4h3v7h4v-7h3l1-4h-4V8z" />
      </svg>
    );
  if (l.includes("you"))
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
        <path d="M10 9.5v5l4.5-2.5z" className="fill" />
      </svg>
    );
  return <span>{label}</span>;
}

export function Landing({ content, preview }: { content: PublicContent; preview?: boolean }) {
  const { settings, sections } = content;
  const visible = sections.filter((s) => s.visible);
  const heroFirst = visible[0]?.type === "hero";
  const { header, footer } = settings;

  return (
    <div
      className={`lp${heroFirst ? "" : " lp--solid-header"}`}
      style={themeVars(settings.theme)}
      data-preview={preview ? "true" : undefined}
    >
      <a href="#conteudo" className="skip">
        Ir para o conteúdo
      </a>
      <header className="hdr">
        <div className="wrap hdr__inner">
          <a href="#" className="hdr__brand" aria-label={header.logo.alt || "Início"}>
            <Logo img={header.logo} className="hdr__logo" />
          </a>
          <Cta link={header.cta} section="cabecalho" className="hdr__cta" variant="light" />
        </div>
      </header>

      <main id="conteudo">
        {visible.map((s, i) => (
          <SectionView key={s.id} section={s} settings={settings} preview={preview} first={i === 0} />
        ))}
      </main>

      <footer className="ftr">
        <div className="wrap ftr__grid">
          <div className="ftr__brand">
            <Logo img={footer.logo} className="ftr__logo" />
            {footer.text ? <p>{footer.text}</p> : null}
            {footer.address ? <p className="ftr__muted">{footer.address}</p> : null}
          </div>
          {footer.contacts.length ? (
            <nav aria-label="Contato">
              <h2 className="ftr__h">Contato</h2>
              <ul>
                {footer.contacts.map((c, i) => (
                  <li key={i}>
                    <a href={c.href} data-cta={c.label} data-cta-section="rodape" {...(c.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
          {footer.links.length ? (
            <nav aria-label="Links">
              <h2 className="ftr__h">Navegação</h2>
              <ul>
                {footer.links.map((c, i) => (
                  <li key={i}>
                    <a href={c.href} data-cta={c.label} data-cta-section="rodape" {...(c.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                      {c.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}
          {footer.social.length ? (
            <div className="ftr__social">
              {footer.social.map((c, i) => (
                <a key={i} href={c.href} aria-label={c.label} data-cta={c.label} data-cta-section="rodape" target="_blank" rel="noopener noreferrer" className="icon-btn icon-btn--line">
                  <SocialIcon label={c.label} />
                </a>
              ))}
            </div>
          ) : null}
        </div>
        <div className="wrap ftr__base">
          {footer.legal ? <p>{footer.legal}</p> : null}
          {footer.copyright ? <p>{footer.copyright}</p> : null}
        </div>
      </footer>

      <Interactions settings={settings} preview={preview} />
    </div>
  );
}
