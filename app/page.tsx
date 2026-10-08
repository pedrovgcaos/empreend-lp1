import type { Metadata } from "next";
import Script from "next/script";
import { Landing } from "@/components/landing/Landing";
import { toPublic } from "@/lib/content";
import { getPublishedContent } from "@/lib/published";
import "./landing.css";

// Página estática: é regenerada sempre que o painel publica uma alteração.
export const dynamic = "force-static";

function siteUrl() {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return "http://localhost:3000";
}

export async function generateMetadata(): Promise<Metadata> {
  const { settings } = await getPublishedContent();
  const { seo } = settings;
  return {
    metadataBase: new URL(siteUrl()),
    title: seo.title,
    description: seo.description,
    icons: seo.favicon ? { icon: seo.favicon, apple: seo.favicon } : undefined,
    openGraph: {
      type: "website",
      locale: "pt_BR",
      title: seo.title,
      description: seo.description,
      images: seo.ogImage?.src ? [{ url: seo.ogImage.src, alt: seo.ogImage.alt }] : undefined,
    },
    twitter: { card: "summary_large_image", title: seo.title, description: seo.description },
  };
}

export default async function Home() {
  const content = await getPublishedContent();
  const gtmId = content.settings.tracking.gtmId.trim().toUpperCase();
  const validGtm = /^GTM-[A-Z0-9]{4,12}$/.test(gtmId) ? gtmId : "";

  return (
    <>
      {validGtm ? (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${validGtm}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${validGtm}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="GTM"
            />
          </noscript>
        </>
      ) : null}
      <Landing content={toPublic(content)} />
    </>
  );
}
