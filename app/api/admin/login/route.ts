import { NextResponse, type NextRequest } from "next/server";
import { adminConfigured, checkPassword, clearSession, setSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  if (!adminConfigured()) {
    return NextResponse.json(
      { ok: false, error: "Defina a variável ADMIN_PASSWORD no projeto para liberar o painel." },
      { status: 503 },
    );
  }
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json({ ok: false, error: "Senha incorreta." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  setSession(res);
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  clearSession(res);
  return res;
}
