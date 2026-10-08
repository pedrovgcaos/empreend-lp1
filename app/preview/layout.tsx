import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../landing.css";

export const metadata: Metadata = {
  title: "Pré-visualização",
  robots: { index: false, follow: false },
};

export default function PreviewLayout({ children }: { children: ReactNode }) {
  return children;
}
