"use client";

import { createContext, useContext, useId, useRef, useState, type ReactNode } from "react";
import type { ImageData, LinkData } from "@/lib/content-types";
import { emptyFor, type Field, type ImageKind } from "./schema";

export type AdminCtxValue = {
  anchors: { anchor: string; label: string }[];
  whatsappHref: string;
  upload: (file: File, kind: ImageKind) => Promise<string>;
};

export const AdminCtx = createContext<AdminCtxValue>({
  anchors: [],
  whatsappHref: "",
  upload: async () => "",
});

type Getter = (key: string) => unknown;
type Setter = (key: string, value: unknown) => void;

export function FieldsEditor({ fields, get, set }: { fields: Field[]; get: Getter; set: Setter }) {
  return (
    <div className="f-stack">
      {fields.map((f) => (
        <FieldView key={f.key} field={f} value={get(f.key)} onChange={(v) => set(f.key, v)} />
      ))}
    </div>
  );
}

function FieldView({ field, value, onChange }: { field: Field; value: unknown; onChange: (v: unknown) => void }) {
  switch (field.type) {
    case "text":
      return <TextField field={field} value={String(value ?? "")} onChange={onChange} />;
    case "textarea":
      return <TextAreaField field={field} value={String(value ?? "")} onChange={onChange} />;
    case "toggle":
      return <ToggleField label={field.label} help={field.help} value={Boolean(value)} onChange={onChange} />;
    case "color":
      return <ColorField field={field} value={String(value ?? "#000000")} onChange={onChange} />;
    case "link":
      return <LinkField label={field.label} help={field.help} value={(value as LinkData) ?? { label: "", href: "" }} onChange={onChange} />;
    case "image":
      return (
        <ImageField
          label={field.label}
          help={field.help}
          kind={field.kind ?? "photo"}
          value={(value as ImageData) ?? { src: "", alt: "" }}
          onChange={onChange}
        />
      );
    case "imageUrl":
      return (
        <ImageField
          label={field.label}
          help={field.help}
          kind={field.kind ?? "photo"}
          value={{ src: String(value ?? ""), alt: "" }}
          onChange={(v) => onChange((v as ImageData).src)}
          noAlt
        />
      );
    case "list":
      return <ListField field={field} value={(value as Record<string, unknown>[]) ?? []} onChange={onChange} />;
    case "linklist":
      return <LinkListField field={field} value={(value as LinkData[]) ?? []} onChange={onChange} />;
  }
}

function Label({ htmlFor, children, help }: { htmlFor?: string; children: ReactNode; help?: string }) {
  return (
    <>
      <label className="f-label" htmlFor={htmlFor}>
        {children}
      </label>
      {help ? <p className="f-help">{help}</p> : null}
    </>
  );
}

function TextField({ field, value, onChange }: { field: Extract<Field, { type: "text" }>; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="f-field">
      <Label htmlFor={id} help={field.help}>
        {field.label}
      </Label>
      <input id={id} className="f-input" value={value} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function TextAreaField({ field, value, onChange }: { field: Extract<Field, { type: "textarea" }>; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="f-field">
      <Label htmlFor={id} help={field.help}>
        {field.label}
      </Label>
      <textarea id={id} className="f-input f-textarea" rows={field.rows ?? 3} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

export function ToggleField({ label, help, value, onChange }: { label: string; help?: string; value: boolean; onChange: (v: boolean) => void }) {
  const id = useId();
  return (
    <div className="f-field f-field--toggle">
      <label className="f-switch" htmlFor={id}>
        <input id={id} type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <span className="f-switch__track" aria-hidden="true" />
        <span className="f-switch__label">{label}</span>
      </label>
      {help ? <p className="f-help">{help}</p> : null}
    </div>
  );
}

function ColorField({ field, value, onChange }: { field: Extract<Field, { type: "color" }>; value: string; onChange: (v: string) => void }) {
  const id = useId();
  return (
    <div className="f-field">
      <Label htmlFor={id} help={field.help}>
        {field.label}
      </Label>
      <div className="f-color">
        <input type="color" aria-label={`${field.label}: seletor`} value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value.toUpperCase())} />
        <input id={id} className="f-input" value={value} onChange={(e) => onChange(e.target.value)} maxLength={7} />
      </div>
    </div>
  );
}

export function LinkField({ label, help, value, onChange }: { label: string; help?: string; value: LinkData; onChange: (v: LinkData) => void }) {
  const id = useId();
  const { anchors, whatsappHref } = useContext(AdminCtx);
  const set = (patch: Partial<LinkData>) => onChange({ ...value, ...patch });
  const isForm = value.href === "#agendar";
  return (
    <fieldset className="f-field f-group">
      <legend className="f-label">{label}</legend>
      {help ? <p className="f-help">{help}</p> : null}
      <div className="f-row">
        <div className="f-col">
          <label className="f-sublabel" htmlFor={`${id}-l`}>
            Texto
          </label>
          <input id={`${id}-l`} className="f-input" value={value.label} onChange={(e) => set({ label: e.target.value })} />
        </div>
      </div>
      <label className="f-sublabel" htmlFor={`${id}-h`}>
        Link
      </label>
      <input
        id={`${id}-h`}
        className="f-input f-mono"
        value={value.href}
        placeholder="https://… ou #agendar"
        onChange={(e) => set({ href: e.target.value })}
      />
      <div className="f-chips" role="group" aria-label="Atalhos de link">
        <button type="button" className={`f-chip${isForm ? " is-on" : ""}`} onClick={() => set({ href: "#agendar", newTab: false })}>
          Abrir formulário
        </button>
        {whatsappHref ? (
          <button type="button" className={`f-chip${value.href === whatsappHref ? " is-on" : ""}`} onClick={() => set({ href: whatsappHref, newTab: true })}>
            WhatsApp
          </button>
        ) : null}
        <select
          className="f-chip f-chip--select"
          value={anchors.some((a) => `#${a.anchor}` === value.href) ? value.href : ""}
          onChange={(e) => e.target.value && set({ href: e.target.value, newTab: false })}
          aria-label="Ir para uma seção"
        >
          <option value="">Ir para seção…</option>
          {anchors.map((a) => (
            <option key={a.anchor} value={`#${a.anchor}`}>
              {a.label}
            </option>
          ))}
        </select>
      </div>
      {!value.href.startsWith("#") ? (
        <label className="f-check">
          <input type="checkbox" checked={Boolean(value.newTab)} onChange={(e) => set({ newTab: e.target.checked })} />
          Abrir em nova aba
        </label>
      ) : null}
    </fieldset>
  );
}

function ImageField({
  label,
  help,
  kind,
  value,
  onChange,
  noAlt,
}: {
  label: string;
  help?: string;
  kind: ImageKind;
  value: ImageData;
  onChange: (v: ImageData) => void;
  noAlt?: boolean;
}) {
  const id = useId();
  const { upload } = useContext(AdminCtx);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);

  async function send(file?: File | null) {
    if (!file) return;
    setError("");
    setBusy(true);
    try {
      const url = await upload(file, kind);
      onChange({ ...value, src: url, alt: value.alt || file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ") });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha no envio.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <fieldset className="f-field f-group">
      <legend className="f-label">{label}</legend>
      {help ? <p className="f-help">{help}</p> : null}
      <div
        className={`f-image f-image--${kind}${dragging ? " is-drag" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void send(e.dataTransfer.files?.[0]);
        }}
      >
        <div className="f-image__thumb">
          {value.src ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value.src} alt="" />
          ) : (
            <span>Sem imagem</span>
          )}
          {busy ? <span className="f-image__busy">Enviando…</span> : null}
        </div>
        <div className="f-image__actions">
          <button type="button" className="a-btn a-btn--sm" onClick={() => input.current?.click()} disabled={busy}>
            {value.src ? "Trocar imagem" : "Enviar imagem"}
          </button>
          {value.src ? (
            <button type="button" className="a-btn a-btn--sm a-btn--quiet" onClick={() => onChange({ ...value, src: "" })}>
              Remover
            </button>
          ) : null}
          <p className="f-help">Ou arraste o arquivo para cá.</p>
        </div>
        <input
          ref={input}
          type="file"
          hidden
          accept={kind === "favicon" ? "image/png,image/svg+xml,image/x-icon,.ico" : "image/*"}
          onChange={(e) => void send(e.target.files?.[0])}
        />
      </div>
      {error ? <p className="f-error">{error}</p> : null}
      <details className="f-more">
        <summary>{noAlt ? "Endereço da imagem" : "Endereço e texto alternativo"}</summary>
        <label className="f-sublabel" htmlFor={`${id}-u`}>
          URL da imagem
        </label>
        <input id={`${id}-u`} className="f-input f-mono" value={value.src} onChange={(e) => onChange({ ...value, src: e.target.value })} />
        {!noAlt ? (
          <>
            <label className="f-sublabel" htmlFor={`${id}-a`}>
              Texto alternativo (acessibilidade e SEO)
            </label>
            <input id={`${id}-a`} className="f-input" value={value.alt} onChange={(e) => onChange({ ...value, alt: e.target.value })} />
          </>
        ) : null}
      </details>
    </fieldset>
  );
}

function move<T>(arr: T[], from: number, to: number) {
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function ItemShell({
  title,
  index,
  total,
  open,
  onToggle,
  onMove,
  onRemove,
  children,
}: {
  title: string;
  index: number;
  total: number;
  open: boolean;
  onToggle: () => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className={`f-item${open ? " is-open" : ""}`}>
      <div className="f-item__head">
        <button type="button" className="f-item__toggle" onClick={onToggle} aria-expanded={open}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
          <span>{title}</span>
        </button>
        <div className="f-item__tools">
          <button type="button" className="a-icon" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Mover para cima">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 15l6-6 6 6" /></svg>
          </button>
          <button type="button" className="a-icon" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Mover para baixo">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
          </button>
          <button type="button" className="a-icon a-icon--danger" onClick={onRemove} aria-label="Remover">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3" /></svg>
          </button>
        </div>
      </div>
      {open ? <div className="f-item__body">{children}</div> : null}
    </div>
  );
}

function summarize(v: unknown, fallback: string) {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return fallback;
  return s.length > 48 ? `${s.slice(0, 48)}…` : s;
}

function ListField({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { type: "list" }>;
  value: Record<string, unknown>[];
  onChange: (v: Record<string, unknown>[]) => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <fieldset className="f-field f-group f-list">
      <legend className="f-label">
        {field.label} <span className="f-count">{value.length}</span>
      </legend>
      {field.help ? <p className="f-help">{field.help}</p> : null}
      {value.map((item, i) => (
        <ItemShell
          key={i}
          index={i}
          total={value.length}
          open={open === i}
          title={`${i + 1}. ${summarize(field.titleKey ? item[field.titleKey] : "", field.itemLabel)}`}
          onToggle={() => setOpen(open === i ? null : i)}
          onMove={(d) => {
            onChange(move(value, i, i + d));
            setOpen(i + d);
          }}
          onRemove={() => {
            if (!confirm(`Remover ${field.itemLabel.toLowerCase()} ${i + 1}?`)) return;
            onChange(value.filter((_, j) => j !== i));
            setOpen(null);
          }}
        >
          <FieldsEditor
            fields={field.fields}
            get={(k) => item[k]}
            set={(k, v) => onChange(value.map((it, j) => (j === i ? { ...it, [k]: v } : it)))}
          />
        </ItemShell>
      ))}
      <button
        type="button"
        className="a-btn a-btn--sm a-btn--dashed"
        onClick={() => {
          onChange([...value, emptyFor(field.fields)]);
          setOpen(value.length);
        }}
      >
        Adicionar {field.itemLabel.toLowerCase()}
      </button>
    </fieldset>
  );
}

function LinkListField({
  field,
  value,
  onChange,
}: {
  field: Extract<Field, { type: "linklist" }>;
  value: LinkData[];
  onChange: (v: LinkData[]) => void;
}) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <fieldset className="f-field f-group f-list">
      <legend className="f-label">
        {field.label} <span className="f-count">{value.length}</span>
      </legend>
      {field.help ? <p className="f-help">{field.help}</p> : null}
      {value.map((item, i) => (
        <ItemShell
          key={i}
          index={i}
          total={value.length}
          open={open === i}
          title={`${i + 1}. ${summarize(item.label, field.itemLabel)}`}
          onToggle={() => setOpen(open === i ? null : i)}
          onMove={(d) => {
            onChange(move(value, i, i + d));
            setOpen(i + d);
          }}
          onRemove={() => {
            onChange(value.filter((_, j) => j !== i));
            setOpen(null);
          }}
        >
          <LinkField label={field.itemLabel} value={item} onChange={(v) => onChange(value.map((it, j) => (j === i ? v : it)))} />
        </ItemShell>
      ))}
      <button
        type="button"
        className="a-btn a-btn--sm a-btn--dashed"
        onClick={() => {
          onChange([...value, { label: "", href: "https://", newTab: true }]);
          setOpen(value.length);
        }}
      >
        Adicionar {field.itemLabel.toLowerCase()}
      </button>
    </fieldset>
  );
}
