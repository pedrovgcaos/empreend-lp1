import type { ImageKind } from "./schema";

const MAX_EDGE: Record<ImageKind, number> = { photo: 2400, logo: 1200, favicon: 512 };
const COMPRESSIBLE = /^image\/(jpeg|png|webp)$/;

/**
 * Redimensiona e converte fotos para WebP antes do envio. Deixa a página leve
 * e mantém cada arquivo abaixo do limite de 4,5 MB das funções da Vercel.
 * SVG, GIF e ICO são enviados como estão.
 */
export async function prepareImage(file: File, kind: ImageKind): Promise<File> {
  if (!COMPRESSIBLE.test(file.type)) return file;
  if (kind !== "photo" && file.size < 1_500_000) return file;

  const bitmap = await createImageBitmap(file);
  const max = MAX_EDGE[kind];
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size < 700_000 && file.type === "image/webp") {
    bitmap.close();
    return file;
  }

  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.84));
  if (!blob || blob.size >= file.size) return file;
  const name = file.name.replace(/\.[a-z0-9]+$/i, "") + ".webp";
  return new File([blob], name, { type: "image/webp" });
}
