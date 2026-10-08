import { revalidatePath } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { adminConfigured, isAuthed } from "@/lib/auth";
import { normalizeContent } from "@/lib/content";
import { defaultContent } from "@/lib/default-content";
import { listVersions, readVersion, storageMode, writeVersion } from "@/lib/storage";

export const dynamic = "force-dynamic";

const unauthorized = () =>
  NextResponse.json({ ok: false, error: "Sessão expirada. Entre novamente." }, { status: 401 });

export async function GET(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json(
      { ok: false, authed: false, configured: adminConfigured() },
      { status: 401 },
    );
  }

  const versions = await listVersions().catch(() => []);
  const wanted = req.nextUrl.searchParams.get("version");
  const target = wanted ? versions.find((v) => v.id === wanted) : versions[0];

  if (wanted && !target) {
    return NextResponse.json({ ok: false, error: "Versão não encontrada." }, { status: 404 });
  }

  const raw = target ? await readVersion(target) : null;
  return NextResponse.json({
    ok: true,
    authed: true,
    storage: storageMode(),
    webhookFromEnv: Boolean(process.env.LEAD_WEBHOOK_URL),
    content: raw ? normalizeContent(raw) : structuredClone(defaultContent),
    versions: versions.map(({ id, date }) => ({ id, date })),
    current: versions[0]?.id ?? null,
  });
}

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) return unauthorized();

  const body = (await req.json().catch(() => null)) as { content?: unknown } | null;
  if (!body?.content) {
    return NextResponse.json({ ok: false, error: "Conteúdo ausente." }, { status: 400 });
  }

  const content = normalizeContent(body.content);
  if (!content.sections.length) {
    return NextResponse.json({ ok: false, error: "A página precisa de pelo menos uma seção." }, { status: 422 });
  }

  try {
    const saved = await writeVersion(content);
    revalidatePath("/");
    const versions = await listVersions().catch(() => []);
    return NextResponse.json({
      ok: true,
      current: saved.id,
      versions: versions.map(({ id, date }) => ({ id, date })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha ao publicar.";
    console.error("[admin] publicar", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
