import { defaultContent, defaultSectionData } from "./default-content";
import type { PublicContent, Section, SectionType, SiteContent } from "./content-types";

type AnyObj = Record<string, unknown>;
const isObj = (v: unknown): v is AnyObj => typeof v === "object" && v !== null && !Array.isArray(v);

/** Mescla o que veio salvo com os valores padrão, para que campos novos nunca fiquem vazios. */
function merge<T>(base: T, incoming: unknown): T {
  if (incoming === undefined || incoming === null) return structuredClone(base);
  if (Array.isArray(base)) {
    if (!Array.isArray(incoming)) return structuredClone(base);
    const template = base[0];
    return incoming.map((item) => (isObj(template) ? merge(template, item) : item)) as T;
  }
  if (isObj(base)) {
    if (!isObj(incoming)) return structuredClone(base);
    const out: AnyObj = {};
    for (const key of Object.keys(base)) out[key] = merge((base as AnyObj)[key], incoming[key]);
    // Campos opcionais que não existem no padrão (ex.: newTab de um link).
    for (const key of Object.keys(incoming)) {
      if (!(key in out) && typeof incoming[key] !== "object") out[key] = incoming[key];
    }
    return out as T;
  }
  return (typeof incoming === typeof base ? incoming : base) as T;
}

export function normalizeContent(raw: unknown): SiteContent {
  if (!isObj(raw)) return structuredClone(defaultContent);
  const sectionsRaw = Array.isArray(raw.sections) ? raw.sections : defaultContent.sections;
  const sections: Section[] = [];
  const seen = new Set<string>();

  for (const s of sectionsRaw) {
    if (!isObj(s) || typeof s.type !== "string" || !(s.type in defaultSectionData)) continue;
    const type = s.type as SectionType;
    let id = typeof s.id === "string" && s.id ? s.id : `${type}-${sections.length}`;
    if (seen.has(id)) id = `${id}-${sections.length}`;
    seen.add(id);
    sections.push({
      id,
      type,
      anchor: typeof s.anchor === "string" ? s.anchor : "",
      visible: s.visible !== false,
      data: merge(defaultSectionData[type], s.data),
    } as Section);
  }

  return {
    version: 1,
    settings: merge(defaultContent.settings, raw.settings),
    sections,
    private: merge(defaultContent.private, raw.private),
  };
}

export function toPublic(content: SiteContent): PublicContent {
  const { private: _private, ...rest } = content;
  return rest;
}
