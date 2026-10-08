"use client";

import { useId, useState, type FormEvent } from "react";
import type { Settings } from "@/lib/content-types";
import { getCtaOrigin, getUtm, pushDataLayer, whatsappUrl } from "@/lib/tracking";

type Props = {
  settings: Settings;
  location: "modal" | "secao" | "saida";
  preview?: boolean;
};

function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function LeadForm({ settings, location, preview }: Props) {
  const { form, tracking, whatsapp } = settings;
  const uid = useId();
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const fd = new FormData(el);
    const digits = phone.replace(/\D/g, "");
    const phoneInput = el.elements.namedItem("whatsapp") as HTMLInputElement | null;
    if (digits.length < 10) {
      phoneInput?.setCustomValidity("Informe o WhatsApp com DDD.");
      phoneInput?.reportValidity();
      return;
    }
    phoneInput?.setCustomValidity("");

    const name = String(fd.get("nome") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const utm = getUtm();
    const ctaOrigin = getCtaOrigin();

    // dataLayer: disparado no clique do botão de envio, com o formulário válido.
    pushDataLayer({
      event: tracking.formEvent || "generate_lead",
      form_id: "vila-noah-agendar-visita",
      form_location: location,
      cta_origin: ctaOrigin || undefined,
      page_location: window.location.href,
      ...utm,
      ...(tracking.includeUserData
        ? { user_data: { email, phone_number: `+55${digits}` } }
        : {}),
    });

    if (preview) {
      setStatus("done");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: name,
          email,
          whatsapp: digits,
          consentimento: fd.get("consent") === "on",
          origem: location,
          cta: ctaOrigin,
          pagina: window.location.href,
          referrer: document.referrer,
          utm,
          empresa: fd.get("empresa"),
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("done");
      if (form.whatsappAfterSubmit && whatsapp.number) {
        const msg = `${whatsapp.message}\nMeu nome é ${name}.`;
        window.open(whatsappUrl(whatsapp.number, msg), "_blank", "noopener");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="lead lead--done" role="status">
        <svg viewBox="0 0 48 48" className="lead__check" aria-hidden="true">
          <circle cx="24" cy="24" r="22" />
          <path d="M14 25l7 7 13-15" />
        </svg>
        <h3>{form.successTitle}</h3>
        <p>{form.successText}</p>
        {preview ? <p className="lead__note">Pré-visualização: nenhum dado foi enviado.</p> : null}
      </div>
    );
  }

  return (
    <form className="lead" onSubmit={onSubmit} noValidate={false}>
      <div className="field">
        <label htmlFor={`${uid}-nome`}>{form.nameLabel}</label>
        <input id={`${uid}-nome`} name="nome" type="text" autoComplete="name" required minLength={2} />
      </div>
      <div className="field">
        <label htmlFor={`${uid}-whats`}>{form.phoneLabel}</label>
        <input
          id={`${uid}-whats`}
          name="whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="(00) 00000-0000"
          required
          value={phone}
          onChange={(e) => {
            e.currentTarget.setCustomValidity("");
            setPhone(maskPhone(e.target.value));
          }}
        />
      </div>
      <div className="field">
        <label htmlFor={`${uid}-email`}>{form.emailLabel}</label>
        <input id={`${uid}-email`} name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field field--hp" aria-hidden="true">
        <label htmlFor={`${uid}-empresa`}>Empresa</label>
        <input id={`${uid}-empresa`} name="empresa" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <label className="consent">
        <input type="checkbox" name="consent" required />
        <span>
          {form.consentText}{" "}
          {form.privacyLink?.label ? (
            <a
              href={form.privacyLink.href}
              {...(form.privacyLink.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              {form.privacyLink.label}
            </a>
          ) : null}
        </span>
      </label>
      <button
        type="submit"
        className="btn btn--solid lead__submit"
        disabled={status === "sending"}
        data-form-submit={location}
      >
        <span>{status === "sending" ? form.sendingLabel : form.submitLabel}</span>
      </button>
      {status === "error" ? (
        <p className="lead__error" role="alert">
          {form.errorText}{" "}
          {whatsapp.number ? (
            <a href={whatsappUrl(whatsapp.number, whatsapp.message)} target="_blank" rel="noopener noreferrer">
              {whatsapp.label}
            </a>
          ) : null}
        </p>
      ) : null}
    </form>
  );
}
