import Image from "next/image";
import { Fragment, type CSSProperties, type ReactNode } from "react";
import type { ImageData, LinkData } from "@/lib/content-types";

const OPTIMIZABLE = /^https:\/\/([a-z0-9-]+\.public\.blob\.vercel-storage\.com|cdn\.sanity\.io)\//i;

export function Img({
  img,
  sizes = "100vw",
  eager = false,
  className,
}: {
  img?: ImageData;
  sizes?: string;
  eager?: boolean;
  className?: string;
}) {
  if (!img?.src) return null;
  return (
    <Image
      src={img.src}
      alt={img.alt || ""}
      fill
      sizes={sizes}
      className={className}
      unoptimized={!OPTIMIZABLE.test(img.src)}
      preload={eager}
      loading={eager ? "eager" : "lazy"}
    />
  );
}

/** Logos: mantém proporção natural, sem otimização (PNG/SVG pequenos). */
export function Logo({ img, className }: { img?: ImageData; className?: string }) {
  if (!img?.src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={img.src} alt={img.alt || ""} className={className} decoding="async" />;
}

export const FORM_HASH = "#agendar";

export function Cta({
  link,
  variant = "solid",
  section,
  className = "",
}: {
  link?: LinkData;
  variant?: "solid" | "ghost" | "light" | "text";
  section?: string;
  className?: string;
}) {
  if (!link?.label) return null;
  const href = link.href || FORM_HASH;
  const external = link.newTab && !href.startsWith("#");
  return (
    <a
      href={href}
      className={`btn btn--${variant} ${className}`.trim()}
      data-cta={link.label}
      data-cta-section={section}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <span>{link.label}</span>
    </a>
  );
}

export function Words({ text, start = 0 }: { text: string; start?: number }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="w">
            <span style={{ "--i": i + start } as CSSProperties}>{w}</span>
          </span>{" "}
        </Fragment>
      ))}
    </>
  );
}

export function Paragraphs({ text }: { text: string }): ReactNode {
  return text
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((p, i) => <p key={i}>{p}</p>);
}
