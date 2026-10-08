import { NextResponse, type NextRequest } from "next/server";
import { isAuthed } from "@/lib/auth";
import { uploadFile } from "@/lib/storage";

export const dynamic = "force-dynamic";

// Funções da Vercel aceitam até 4,5 MB por requisição; o painel já comprime as fotos antes de enviar.
const MAX_BYTES = 4.4 * 1024 * 1024;
const ALLOWED = /^image\/(png|jpe?g|webp|avif|gif|svg\+xml|x-icon|vnd\.microsoft\.icon)$/;

export async function POST(req: NextRequest) {
  if (!isAuthed(req)) {
    return NextResponse.json({ ok: false, error: "Sessão expirada. Entre novamente." }, { status: 401 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof Blob) || !file.size) {
    return NextResponse.json({ ok: false, error: "Nenhum arquivo recebido." }, { status: 400 });
  }
  if (!ALLOWED.test(file.type)) {
    return NextResponse.json(
      { ok: false, error: "Formato não aceito. Use JPG, PNG, WebP, AVIF, SVG, GIF ou ICO." },
      { status: 415 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Arquivo acima de 4,4 MB. Reduza o tamanho e tente de novo." },
      { status: 413 },
    );
  }

  try {
    const name = (file as File).name || "imagem";
    const url = await uploadFile(name, file, file.type);
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha no envio.";
    console.error("[admin] upload", err);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
