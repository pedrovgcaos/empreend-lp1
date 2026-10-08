import { NextResponse, type NextRequest } from "next/server";
import { getPublishedContent } from "@/lib/published";

const str = (v: unknown, max = 300) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Dados inválidos." }, { status: 400 });
  }

  // Honeypot: robôs preenchem o campo escondido "empresa".
  if (str(body.empresa)) return NextResponse.json({ ok: true });

  const nome = str(body.nome, 120);
  const email = str(body.email, 160).toLowerCase();
  const whatsapp = str(body.whatsapp, 20).replace(/\D/g, "");

  if (nome.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || whatsapp.length < 10) {
    return NextResponse.json({ ok: false, error: "Confira nome, e-mail e WhatsApp." }, { status: 422 });
  }

  const utmRaw = typeof body.utm === "object" && body.utm ? (body.utm as Record<string, unknown>) : {};
  const utm = Object.fromEntries(Object.entries(utmRaw).map(([k, v]) => [k.slice(0, 40), str(v, 200)]));

  const lead = {
    empreendimento: "Vila Noah Resort Residence",
    nome,
    email,
    whatsapp: `+55${whatsapp}`,
    consentimento: body.consentimento === true,
    origem_formulario: str(body.origem, 40),
    cta: str(body.cta, 120),
    pagina: str(body.pagina, 500),
    referrer: str(body.referrer, 500),
    ...utm,
    data: new Date().toISOString(),
  };

  const content = await getPublishedContent();
  const webhook = process.env.LEAD_WEBHOOK_URL || content.private.webhookUrl;

  if (!webhook) {
    console.warn("[lead] nenhum webhook configurado — lead registrado apenas no log:", JSON.stringify(lead));
    return NextResponse.json({ ok: true, delivered: false });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`webhook respondeu ${res.status}`);
    return NextResponse.json({ ok: true, delivered: true });
  } catch (err) {
    console.error("[lead] falha ao enviar para o webhook:", err, JSON.stringify(lead));
    return NextResponse.json({ ok: false, error: "Falha ao enviar." }, { status: 502 });
  }
}
