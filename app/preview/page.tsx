"use client";

import { useEffect, useState } from "react";
import { Landing } from "@/components/landing/Landing";
import type { PublicContent } from "@/lib/content-types";

/** Renderiza o rascunho enviado pelo painel (/admin) via postMessage. */
export default function PreviewPage() {
  const [content, setContent] = useState<PublicContent | null>(null);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || !e.data || typeof e.data !== "object") return;
      if (e.data.type === "vn-preview-content") {
        const { private: _p, ...pub } = e.data.content as PublicContent & { private?: unknown };
        setContent(pub);
      }
      if (e.data.type === "vn-preview-scroll") {
        const el = document.querySelector(`[data-section="${CSS.escape(String(e.data.id))}"]`);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      if (e.data.type === "vn-preview-top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ type: "vn-preview-ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  if (!content) return null;
  return <Landing content={content} preview />;
}
