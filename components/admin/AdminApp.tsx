"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from "react";
import type { Section, SectionType, SiteContent } from "@/lib/content-types";
import { makeSection, sectionLabels } from "@/lib/default-content";
import { whatsappUrl } from "@/lib/tracking";
import { AdminCtx, FieldsEditor, ToggleField, type AdminCtxValue } from "./fields";
import { prepareImage } from "./image";
import { sectionSchemas, settingsPages } from "./schema";

type Version = { id: string; date: string };
type Selection = { kind: "section" | "settings"; id: string };
type Toast = { text: string; tone: "ok" | "error" | "info" };

const DRAFT_KEY = "vn_admin_draft";

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));

function getIn(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

function setIn<T>(obj: T, path: string[], value: unknown): T {
  const [head, ...rest] = path;
  const src = (obj ?? {}) as Record<string, unknown>;
  return { ...src, [head]: rest.length ? setIn(src[head], rest, value) : value } as T;
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function sectionSummary(s: Section) {
  const d = s.data as unknown as Record<string, unknown>;
  const t = (d.title || d.address || d.label || "") as string;
  return t.length > 40 ? `${t.slice(0, 40)}…` : t;
}

export function AdminApp() {
  const [phase, setPhase] = useState<"loading" | "login" | "ready">("loading");
  const [configured, setConfigured] = useState(true);
  const [content, setContent] = useState<SiteContent | null>(null);
  const [published, setPublished] = useState("");
  const [versions, setVersions] = useState<Version[]>([]);
  const [current, setCurrent] = useState<string | null>(null);
  const [storage, setStorage] = useState<"blob" | "local">("blob");
  const [webhookFromEnv, setWebhookFromEnv] = useState(false);
  const [sel, setSel] = useState<Selection>({ kind: "section", id: "" });
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [previewOpen, setPreviewOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [recover, setRecover] = useState<SiteContent | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const frame = useRef<HTMLIFrameElement>(null);

  const serialized = useMemo(() => (content ? JSON.stringify(content) : ""), [content]);
  const dirty = Boolean(content) && serialized !== published;

  const notify = useCallback((text: string, tone: Toast["tone"] = "ok") => {
    setToast({ text, tone });
    window.setTimeout(() => setToast((t) => (t?.text === text ? null : t)), 4200);
  }, []);

  // ---------- Carregamento e sessão ----------

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/content", { cache: "no-store" });
    const json = await res.json().catch(() => ({}));
    if (res.status === 401) {
      setConfigured(json.configured !== false);
      setPhase("login");
      return;
    }
    if (!res.ok || !json.ok) {
      setPhase("login");
      notify(json.error || "Não foi possível carregar o conteúdo.", "error");
      return;
    }
    const loaded = json.content as SiteContent;
    const snapshot = JSON.stringify(loaded);
    setContent(loaded);
    setPublished(snapshot);
    setVersions(json.versions);
    setCurrent(json.current);
    setStorage(json.storage);
    setWebhookFromEnv(json.webhookFromEnv);
    setSel((s) => (s.id ? s : { kind: "section", id: loaded.sections[0]?.id ?? "" }));
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft && draft !== snapshot) setRecover(JSON.parse(draft));
    } catch {
      /* ignora */
    }
    setPhase("ready");
  }, [notify]);

  useEffect(() => {
    void load();
    if (window.innerWidth < 1180) setPreviewOpen(false);
  }, [load]);

  // Rascunho local: evita perder alterações ao fechar a aba sem publicar.
  useEffect(() => {
    if (phase !== "ready" || recover) return;
    const t = window.setTimeout(() => {
      try {
        if (dirty) localStorage.setItem(DRAFT_KEY, serialized);
        else localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignora */
      }
    }, 400);
    return () => window.clearTimeout(t);
  }, [serialized, dirty, phase, recover]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // ---------- Pré-visualização ----------

  const postPreview = useCallback((msg: Record<string, unknown>) => {
    frame.current?.contentWindow?.postMessage(msg, window.location.origin);
  }, []);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== "vn-preview-ready") return;
      if (content) postPreview({ type: "vn-preview-content", content });
    };
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [content, postPreview]);

  useEffect(() => {
    if (!content) return;
    const t = window.setTimeout(() => postPreview({ type: "vn-preview-content", content }), 120);
    return () => window.clearTimeout(t);
  }, [content, postPreview]);

  useEffect(() => {
    if (sel.kind === "section" && sel.id) {
      const t = window.setTimeout(() => postPreview({ type: "vn-preview-scroll", id: sel.id }), 160);
      return () => window.clearTimeout(t);
    }
  }, [sel, postPreview]);

  // ---------- Ações ----------

  const update = (fn: (c: SiteContent) => SiteContent) => setContent((c) => (c ? fn(c) : c));

  const updateSection = (id: string, fn: (s: Section) => Section) =>
    update((c) => ({ ...c, sections: c.sections.map((s) => (s.id === id ? fn(s) : s)) }));

  const reorder = (from: number, to: number) =>
    update((c) => {
      const next = c.sections.slice();
      const [it] = next.splice(from, 1);
      next.splice(to, 0, it);
      return { ...c, sections: next };
    });

  const addSection = (type: SectionType) => {
    const s = makeSection(type);
    const anchors = new Set(content?.sections.map((x) => x.anchor));
    if (anchors.has(s.anchor)) s.anchor = `${s.anchor}-${s.id.slice(-4)}`;
    update((c) => ({ ...c, sections: [...c.sections, s] }));
    setSel({ kind: "section", id: s.id });
  };

  const duplicate = (id: string) => {
    const src = content?.sections.find((s) => s.id === id);
    if (!src) return;
    const copy = { ...structuredClone(src), id: `${src.type}-${Math.random().toString(36).slice(2, 8)}` };
    copy.anchor = `${src.anchor || src.type}-${copy.id.slice(-4)}`;
    update((c) => {
      const i = c.sections.findIndex((s) => s.id === id);
      const next = c.sections.slice();
      next.splice(i + 1, 0, copy);
      return { ...c, sections: next };
    });
    setSel({ kind: "section", id: copy.id });
  };

  const remove = (id: string) => {
    const s = content?.sections.find((x) => x.id === id);
    if (!s || !confirm(`Remover a seção "${sectionLabels[s.type]}"? Você pode desfazer descartando as alterações antes de publicar.`)) return;
    update((c) => ({ ...c, sections: c.sections.filter((x) => x.id !== id) }));
    if (sel.id === id) setSel({ kind: "section", id: content?.sections.find((x) => x.id !== id)?.id ?? "" });
  };

  async function publish() {
    if (!content) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const json = await res.json().catch(() => ({}));
      if (res.status === 401) {
        notify("Sua sessão expirou. Entre de novo para publicar — o rascunho continua salvo neste navegador.", "error");
        setPhase("login");
        return;
      }
      if (!res.ok || !json.ok) throw new Error(json.error || "Falha ao publicar.");
      setPublished(serialized);
      setVersions(json.versions);
      setCurrent(json.current);
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* ignora */
      }
      notify("Alterações publicadas. O site já mostra a nova versão.");
    } catch (e) {
      notify(e instanceof Error ? e.message : "Falha ao publicar.", "error");
    } finally {
      setSaving(false);
    }
  }

  function discard() {
    if (!confirm("Descartar todas as alterações que ainda não foram publicadas?")) return;
    setContent(JSON.parse(published));
    notify("Alterações descartadas.", "info");
  }

  async function loadVersion(id: string) {
    if (dirty && !confirm("Carregar esta versão substitui as alterações não publicadas. Continuar?")) return;
    const res = await fetch(`/api/admin/content?version=${encodeURIComponent(id)}`, { cache: "no-store" });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) {
      notify(json.error || "Não foi possível carregar a versão.", "error");
      return;
    }
    setContent(json.content);
    const v = versions.find((x) => x.id === id);
    notify(
      id === current ? "Versão publicada carregada." : `Versão de ${v ? fmtDate(v.date) : id} carregada. Publique para colocá-la no ar.`,
      "info",
    );
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setPhase("login");
  }

  const upload = useCallback(async (file: File, kind: Parameters<AdminCtxValue["upload"]>[1]) => {
    const prepared = await prepareImage(file, kind);
    const fd = new FormData();
    fd.append("file", prepared, prepared.name);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error || "Falha no envio da imagem.");
    return json.url as string;
  }, []);

  const ctx = useMemo<AdminCtxValue>(
    () => ({
      anchors: (content?.sections ?? [])
        .filter((s) => s.visible && s.anchor)
        .map((s) => ({ anchor: s.anchor, label: sectionLabels[s.type] })),
      whatsappHref: content?.settings.whatsapp.number ? whatsappUrl(content.settings.whatsapp.number, content.settings.whatsapp.message) : "",
      upload,
    }),
    [content, upload],
  );

  // ---------- Telas ----------

  if (phase === "loading") {
    return (
      <div className="adm adm--center">
        <p className="adm-muted">Carregando o painel…</p>
      </div>
    );
  }

  if (phase === "login") {
    return <Login configured={configured} onDone={load} toast={toast} />;
  }

  if (!content) return null;

  const section = sel.kind === "section" ? content.sections.find((s) => s.id === sel.id) : undefined;
  const page = sel.kind === "settings" ? settingsPages.find((p) => p.id === sel.id) : undefined;
  const webhookMissing = !webhookFromEnv && !content.private.webhookUrl.trim();

  return (
    <AdminCtx.Provider value={ctx}>
      <div className={`adm${previewOpen ? "" : " adm--no-preview"}`}>
        <header className="adm-top">
          <div className="adm-brand">
            <span className="adm-brand__mark" aria-hidden="true" />
            <div>
              <strong>Vila Noah</strong>
              <span>Painel da landing page</span>
            </div>
          </div>
          <p className={`adm-state${dirty ? " is-dirty" : ""}`} role="status">
            {dirty ? "Alterações não publicadas" : "Tudo publicado"}
          </p>
          <div className="adm-actions">
            <HistoryMenu versions={versions} current={current} onPick={loadVersion} />
            <button type="button" className="a-btn a-btn--quiet" onClick={discard} disabled={!dirty}>
              Descartar
            </button>
            <a className="a-btn a-btn--quiet" href="/" target="_blank" rel="noopener noreferrer">
              Ver site
            </a>
            <button type="button" className="a-btn a-btn--primary" onClick={publish} disabled={!dirty || saving}>
              {saving ? "Publicando…" : "Publicar alterações"}
            </button>
            <button type="button" className="a-btn a-btn--quiet" onClick={logout}>
              Sair
            </button>
          </div>
        </header>

        {storage === "local" ? (
          <div className="adm-banner">
            Modo local: as alterações ficam na pasta <code>.data</code> deste computador. Na Vercel, conecte um Blob Store para publicar.
          </div>
        ) : null}
        {recover ? (
          <div className="adm-banner adm-banner--warn">
            Este navegador tem alterações que não foram publicadas.
            <button
              type="button"
              className="a-btn a-btn--sm"
              onClick={() => {
                setContent(recover);
                setRecover(null);
                notify("Rascunho recuperado.", "info");
              }}
            >
              Recuperar rascunho
            </button>
            <button
              type="button"
              className="a-btn a-btn--sm a-btn--quiet"
              onClick={() => {
                setRecover(null);
                try {
                  localStorage.removeItem(DRAFT_KEY);
                } catch {
                  /* ignora */
                }
              }}
            >
              Descartar rascunho
            </button>
          </div>
        ) : null}

        <div className="adm-body">
          <aside className="adm-side" aria-label="Estrutura da página">
            <h2 className="adm-h">Seções da página</h2>
            <p className="adm-muted adm-small">Arraste para mudar a ordem. O olho mostra ou esconde a seção.</p>
            <ol className="adm-sections" onDragEnd={() => (setDrag(null), setOver(null))}>
              {content.sections.map((s, i) => (
                <li
                  key={s.id}
                  className={[
                    "adm-sec",
                    sel.id === s.id ? "is-active" : "",
                    !s.visible ? "is-hidden" : "",
                    drag === i ? "is-drag" : "",
                    over === i && drag !== null && drag !== i ? (drag < i ? "is-over-after" : "is-over-before") : "",
                  ].join(" ")}
                  draggable
                  onDragStart={(e) => {
                    setDrag(i);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", String(i));
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setOver(i);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (drag !== null && drag !== i) reorder(drag, i);
                    setDrag(null);
                    setOver(null);
                  }}
                >
                  <span className="adm-sec__grip" aria-hidden="true">
                    <svg viewBox="0 0 24 24"><path d="M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01" /></svg>
                  </span>
                  <button type="button" className="adm-sec__main" onClick={() => setSel({ kind: "section", id: s.id })}>
                    <span className="adm-sec__name">{sectionLabels[s.type]}</span>
                    <span className="adm-sec__sum">{sectionSummary(s)}</span>
                  </button>
                  <span className="adm-sec__tools">
                    <button type="button" className="a-icon" aria-label="Mover para cima" disabled={i === 0} onClick={() => reorder(i, i - 1)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6" /></svg>
                    </button>
                    <button type="button" className="a-icon" aria-label="Mover para baixo" disabled={i === content.sections.length - 1} onClick={() => reorder(i, i + 1)}>
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                    <button
                      type="button"
                      className="a-icon"
                      aria-label={s.visible ? "Esconder seção" : "Mostrar seção"}
                      aria-pressed={!s.visible}
                      onClick={() => updateSection(s.id, (x) => ({ ...x, visible: !x.visible }))}
                    >
                      {s.visible ? (
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>
                      ) : (
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18M10.6 5.1A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17.3 17.3 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.4-1.6M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>
                      )}
                    </button>
                  </span>
                </li>
              ))}
            </ol>
            <AddSection onAdd={addSection} />

            <h2 className="adm-h adm-h--gap">Configurações</h2>
            <ul className="adm-pages">
              {settingsPages.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className={`adm-page${sel.kind === "settings" && sel.id === p.id ? " is-active" : ""}`}
                    onClick={() => {
                      setSel({ kind: "settings", id: p.id });
                      postPreview({ type: "vn-preview-top" });
                    }}
                  >
                    {p.label}
                    {p.id === "formulario" && webhookMissing ? <span className="adm-dot" title="Webhook não configurado" /> : null}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          <main className="adm-editor">
            {section ? (
              <SectionEditor
                key={section.id}
                section={section}
                onChange={(fn) => updateSection(section.id, fn)}
                onDuplicate={() => duplicate(section.id)}
                onRemove={() => remove(section.id)}
                usedAnchors={content.sections.filter((s) => s.id !== section.id).map((s) => s.anchor)}
              />
            ) : page ? (
              <div className="adm-panel" key={page.id}>
                <div className="adm-panel__head">
                  <h1 className="adm-title">{page.label}</h1>
                  <p className="adm-muted">{page.description}</p>
                </div>
                {page.id === "formulario" ? (
                  webhookFromEnv ? (
                    <p className="adm-note">O webhook está definido na variável LEAD_WEBHOOK_URL do projeto e tem prioridade sobre o campo abaixo.</p>
                  ) : webhookMissing ? (
                    <p className="adm-note adm-note--warn">Sem webhook, os leads ficam apenas no log da Vercel. Configure um endereço para receber os contatos.</p>
                  ) : null
                ) : null}
                <FieldsEditor
                  fields={page.fields}
                  get={(k) => getIn(content, k)}
                  set={(k, v) => update((c) => setIn(c, k.split("."), v))}
                />
              </div>
            ) : (
              <p className="adm-muted">Escolha uma seção ou configuração à esquerda.</p>
            )}
          </main>

          <section className={`adm-preview adm-preview--${device}`} aria-label="Pré-visualização">
            <div className="adm-preview__bar">
              <div className="adm-seg" role="group" aria-label="Tamanho da tela">
                <button type="button" className={device === "desktop" ? "is-on" : ""} onClick={() => setDevice("desktop")}>
                  Computador
                </button>
                <button type="button" className={device === "mobile" ? "is-on" : ""} onClick={() => setDevice("mobile")}>
                  Celular
                </button>
              </div>
              <span className="adm-muted adm-small">Pré-visualização do rascunho</span>
              <button type="button" className="a-btn a-btn--sm a-btn--quiet" onClick={() => setPreviewOpen(false)}>
                Ocultar
              </button>
            </div>
            <PreviewStage device={device}>
              <iframe ref={frame} src="/preview" title="Pré-visualização da landing page" />
            </PreviewStage>
          </section>
          {!previewOpen ? (
            <button type="button" className="a-btn a-btn--primary adm-preview-toggle" onClick={() => setPreviewOpen(true)}>
              Mostrar pré-visualização
            </button>
          ) : null}
        </div>

        {toast ? (
          <div className={`adm-toast adm-toast--${toast.tone}`} role="status">
            {toast.text}
          </div>
        ) : null}
      </div>
    </AdminCtx.Provider>
  );
}

/** Mostra a página em largura real (1440 px ou 390 px) reduzida para caber no painel. */
function PreviewStage({ device, children }: { device: "desktop" | "mobile"; children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pad = 24;
  let style: CSSProperties = {};
  if (box.w) {
    if (device === "desktop") {
      const baseW = 1440;
      const scale = Math.min(1, box.w / baseW);
      style = { width: baseW, height: box.h / scale, transform: `scale(${scale})` };
    } else {
      const baseW = 390;
      const baseH = 844;
      const scale = Math.min(1, (box.h - pad * 2) / baseH, (box.w - pad * 2) / baseW);
      style = {
        width: baseW,
        height: baseH,
        transform: `scale(${scale})`,
        left: (box.w - baseW * scale) / 2,
        top: pad,
      };
    }
  }

  return (
    <div className="adm-preview__stage" ref={stage}>
      <div className="adm-preview__device" style={style}>
        {children}
      </div>
    </div>
  );
}

function SectionEditor({
  section,
  onChange,
  onDuplicate,
  onRemove,
  usedAnchors,
}: {
  section: Section;
  onChange: (fn: (s: Section) => Section) => void;
  onDuplicate: () => void;
  onRemove: () => void;
  usedAnchors: string[];
}) {
  const [anchor, setAnchor] = useState(section.anchor);
  const clash = anchor && usedAnchors.includes(slug(anchor));
  const data = section.data as unknown as Record<string, unknown>;
  return (
    <div className="adm-panel">
      <div className="adm-panel__head">
        <h1 className="adm-title">{sectionLabels[section.type]}</h1>
        <div className="adm-panel__tools">
          <button type="button" className="a-btn a-btn--sm a-btn--quiet" onClick={onDuplicate}>
            Duplicar
          </button>
          <button type="button" className="a-btn a-btn--sm a-btn--danger" onClick={onRemove}>
            Remover
          </button>
        </div>
      </div>
      <div className="f-stack">
        <ToggleField
          label="Seção visível na página"
          value={section.visible}
          onChange={(v) => onChange((s) => ({ ...s, visible: v }))}
        />
        <div className="f-field">
          <label className="f-label" htmlFor="anchor">
            Âncora da seção
          </label>
          <p className="f-help">Usada em links como #{section.anchor || "secao"}. Só letras minúsculas, números e hífen.</p>
          <div className="f-prefix">
            <span>#</span>
            <input
              id="anchor"
              className="f-input f-mono"
              value={anchor}
              onChange={(e) => setAnchor(e.target.value)}
              onBlur={() => {
                const v = slug(anchor);
                setAnchor(v);
                if (!usedAnchors.includes(v)) onChange((s) => ({ ...s, anchor: v }));
              }}
            />
          </div>
          {clash ? <p className="f-error">Outra seção já usa essa âncora.</p> : null}
        </div>
        <FieldsEditor
          fields={sectionSchemas[section.type]}
          get={(k) => data[k]}
          set={(k, v) => onChange((s) => ({ ...s, data: { ...(s.data as object), [k]: v } } as Section))}
        />
      </div>
    </div>
  );
}

function AddSection({ onAdd }: { onAdd: (t: SectionType) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="adm-add">
      <button type="button" className="a-btn a-btn--sm a-btn--dashed" aria-expanded={open} onClick={() => setOpen(!open)}>
        Adicionar seção
      </button>
      {open ? (
        <ul className="adm-menu">
          {(Object.keys(sectionLabels) as SectionType[]).map((t) => (
            <li key={t}>
              <button
                type="button"
                onClick={() => {
                  onAdd(t);
                  setOpen(false);
                }}
              >
                {sectionLabels[t]}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function HistoryMenu({ versions, current, onPick }: { versions: Version[]; current: string | null; onPick: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  return (
    <div className="adm-history" ref={ref}>
      <button type="button" className="a-btn a-btn--quiet" aria-expanded={open} onClick={() => setOpen(!open)} disabled={!versions.length}>
        Histórico
      </button>
      {open ? (
        <div className="adm-menu adm-menu--right">
          <p className="adm-menu__title">Versões publicadas</p>
          <ul>
            {versions.map((v) => (
              <li key={v.id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(v.id);
                    setOpen(false);
                  }}
                >
                  {fmtDate(v.date)}
                  {v.id === current ? <span className="adm-tag">no ar</span> : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Login({ configured, onDone, toast }: { configured: boolean; onDone: () => void; toast: Toast | null }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(toast?.tone === "error" ? toast.text : "");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok || !json.ok) {
      setError(json.error || "Não foi possível entrar.");
      return;
    }
    onDone();
  }

  return (
    <div className="adm adm--center">
      <form className="adm-login" onSubmit={submit}>
        <span className="adm-brand__mark" aria-hidden="true" />
        <h1 className="adm-title">Painel do Vila Noah</h1>
        {configured ? (
          <>
            <p className="adm-muted">Entre com a senha para editar a landing page.</p>
            <label className="f-label" htmlFor="pw">
              Senha
            </label>
            <input
              id="pw"
              type="password"
              className="f-input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              required
            />
            {error ? <p className="f-error">{error}</p> : null}
            <button type="submit" className="a-btn a-btn--primary" disabled={busy}>
              {busy ? "Entrando…" : "Entrar"}
            </button>
          </>
        ) : (
          <p className="adm-note adm-note--warn">
            Defina a variável de ambiente <code>ADMIN_PASSWORD</code> no projeto (Vercel → Settings → Environment Variables) e faça um novo deploy para liberar o painel.
          </p>
        )}
      </form>
    </div>
  );
}
