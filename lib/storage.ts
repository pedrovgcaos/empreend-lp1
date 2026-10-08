import "server-only";
import { del, list, put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Cada publicação grava um arquivo novo (content/site-<timestamp>.json).
 * Assim a URL de cada versão é imutável (sem problema de cache na CDN)
 * e o painel ganha histórico para restaurar versões antigas.
 */
export type VersionInfo = { id: string; url: string; date: string; size: number };

const PREFIX = "content/site-";
const KEEP_VERSIONS = 40;
const LOCAL_ROOT = path.join(process.cwd(), ".data");

export const storageMode = (): "blob" | "local" =>
  process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local";

function idFromPath(pathname: string) {
  return pathname.slice(pathname.lastIndexOf("/") + 1).replace(/^site-/, "").replace(/\.json$/, "");
}

const byNewest = (a: VersionInfo, b: VersionInfo) => Number(b.id) - Number(a.id);

export async function listVersions(): Promise<VersionInfo[]> {
  if (storageMode() === "blob") {
    const out: VersionInfo[] = [];
    let cursor: string | undefined;
    do {
      const res = await list({ prefix: PREFIX, cursor, limit: 1000 });
      for (const b of res.blobs) {
        out.push({
          id: idFromPath(b.pathname),
          url: b.url,
          date: new Date(b.uploadedAt).toISOString(),
          size: b.size,
        });
      }
      cursor = res.hasMore ? res.cursor : undefined;
    } while (cursor);
    return out.sort(byNewest);
  }

  const dir = path.join(LOCAL_ROOT, "content");
  const files = await fs.readdir(dir).catch(() => [] as string[]);
  const out = await Promise.all(
    files
      .filter((f) => f.startsWith("site-") && f.endsWith(".json"))
      .map(async (f) => {
        const stat = await fs.stat(path.join(dir, f));
        const id = idFromPath(f);
        return { id, url: `local:${f}`, date: new Date(Number(id)).toISOString(), size: stat.size };
      }),
  );
  return out.sort(byNewest);
}

export async function readVersion(v: VersionInfo): Promise<unknown | null> {
  try {
    if (v.url.startsWith("local:")) {
      const raw = await fs.readFile(path.join(LOCAL_ROOT, "content", v.url.slice(6)), "utf8");
      return JSON.parse(raw);
    }
    // Cada versão é imutável, então pode ficar em cache para sempre.
    const res = await fetch(v.url, { cache: "force-cache" });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export async function writeVersion(data: unknown): Promise<VersionInfo> {
  const id = String(Date.now());
  const body = JSON.stringify(data);

  if (storageMode() === "blob") {
    const res = await put(`${PREFIX}${id}.json`, body, {
      access: "public",
      addRandomSuffix: false,
      contentType: "application/json",
    });
    void pruneVersions();
    return { id, url: res.url, date: new Date().toISOString(), size: body.length };
  }

  if (process.env.VERCEL) {
    throw new Error(
      "Armazenamento não configurado. Conecte um Blob Store ao projeto na Vercel (Storage > Blob) e faça um novo deploy.",
    );
  }
  const dir = path.join(LOCAL_ROOT, "content");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `site-${id}.json`), body, "utf8");
  void pruneVersions();
  return { id, url: `local:site-${id}.json`, date: new Date().toISOString(), size: body.length };
}

async function pruneVersions() {
  try {
    const old = (await listVersions()).slice(KEEP_VERSIONS);
    if (!old.length) return;
    if (storageMode() === "blob") {
      await del(old.map((v) => v.url));
    } else {
      await Promise.all(
        old.map((v) => fs.rm(path.join(LOCAL_ROOT, "content", v.url.slice(6)), { force: true })),
      );
    }
  } catch (err) {
    console.error("[storage] falha ao limpar versões antigas", err);
  }
}

export async function uploadFile(name: string, file: Blob, contentType: string): Promise<string> {
  const safe = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-80);

  if (storageMode() === "blob") {
    const res = await put(`uploads/${safe || "arquivo"}`, file, {
      access: "public",
      addRandomSuffix: true,
      contentType,
    });
    return res.url;
  }

  if (process.env.VERCEL) {
    throw new Error("Armazenamento não configurado. Conecte um Blob Store ao projeto na Vercel.");
  }
  const dir = path.join(LOCAL_ROOT, "uploads");
  await fs.mkdir(dir, { recursive: true });
  const finalName = `${Date.now().toString(36)}-${safe || "arquivo"}`;
  await fs.writeFile(path.join(dir, finalName), Buffer.from(await file.arrayBuffer()));
  return `/api/media/${finalName}`;
}

export async function readLocalUpload(name: string) {
  const file = path.join(LOCAL_ROOT, "uploads", path.basename(name));
  return fs.readFile(file);
}
