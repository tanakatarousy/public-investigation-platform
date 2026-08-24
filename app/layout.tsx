import type { Metadata } from "next";
import {BRAND} from "./brand-config";
import {CANONICAL_ORIGIN,SEO_INDEXABLE,SITE_ORIGIN,canonicalUrl,siteUrl} from "./seo";
import "./globals.css";
import "./hero-adjust.css";
import "./theme.css";

export const metadata: Metadata = {
  title: BRAND.title,
  description: BRAND.description,
  icons: {
    icon: [{url:"/favicon.svg?v=15",type:"image/svg+xml",sizes:"any"}],
    shortcut: "/favicon.svg?v=15",
    apple: "/favicon.svg?v=15",
  },
  metadataBase: new URL(SITE_ORIGIN),
  alternates:{canonical:canonicalUrl("/")},
  robots:{index:SEO_INDEXABLE,follow:SEO_INDEXABLE},
  openGraph: {title:BRAND.title,description:BRAND.description,type:"website",locale:"ja_JP",siteName:`${BRAND.name}（${BRAND.reading}）`,url:CANONICAL_ORIGIN,images:[{url:siteUrl("/og.png"),width:1200,height:630,alt:`${BRAND.name}｜公開情報と目撃をつなぐ`}]},
  twitter: {card:"summary_large_image",title:BRAND.title,description:BRAND.description,images:[siteUrl("/og.png")]},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head />
      <body className="antialiased">{children}</body>
    </html>
  );
}
