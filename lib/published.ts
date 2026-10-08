import "server-only";
import { cache } from "react";
import { defaultContent } from "./default-content";
import { normalizeContent } from "./content";
import { listVersions, readVersion } from "./storage";
import type { SiteContent } from "./content-types";

/** Última versão publicada (ou o conteúdo padrão, se nada foi publicado ainda). */
export const getPublishedContent = cache(async (): Promise<SiteContent> => {
  try {
    const [latest] = await listVersions();
    if (!latest) return structuredClone(defaultContent);
    const raw = await readVersion(latest);
    return raw ? normalizeContent(raw) : structuredClone(defaultContent);
  } catch (err) {
    console.error("[content] falha ao ler conteúdo publicado", err);
    return structuredClone(defaultContent);
  }
});
