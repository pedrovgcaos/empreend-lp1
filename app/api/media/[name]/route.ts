import { NextResponse } from "next/server";
import { readLocalUpload, storageMode } from "@/lib/storage";

// Serve os uploads gravados em ./.data quando o projeto roda sem Vercel Blob (ambiente local).
const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  avif: "image/avif",
  gif: "image/gif",
  svg: "image/svg+xml",
  ico: "image/x-icon",
};

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  if (storageMode() !== "local") return new NextResponse("Not found", { status: 404 });
  const { name } = await params;
  try {
    const data = await readLocalUpload(name);
    const ext = name.split(".").pop()?.toLowerCase() || "";
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": TYPES[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
      },
    });
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }
}
