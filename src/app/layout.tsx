import type { Metadata } from 'next';
import EaseProvider from '@/components/EaseProvider';
import Splash from '@/components/Splash';
import { SITE } from '@/lib/dummy';
import './globals.css';

const metadataBase = new URL(SITE.url || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');

export const metadata: Metadata = {
  metadataBase,
  title: { default: SITE.title, template: `%s — ${SITE.title.split(' — ')[0]}` },
  description: SITE.description,
  keywords: SITE.keywords,
  authors: [{ name: 'Umar Muhdhor' }],
  creator: 'Umar Muhdhor',
  alternates: SITE.url ? { canonical: '/' } : undefined,
  icons: SITE.favicon ? { icon: SITE.favicon } : undefined,
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    siteName: 'Umar Muhdhor',
    type: 'website',
    locale: 'en_US',
    images: SITE.ogImage ? [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.title }] : undefined,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.title,
    description: SITE.description,
    images: SITE.ogImage ? [SITE.ogImage] : undefined,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          Fluid rem: 1rem === one design pixel at 1920 on desktop. Mobile uses
          a fixed 1px rem so type and tap targets do not double in size on
          small tablets near the breakpoint. Inlined because the CSS minifier
          truncates the desktop ratio's precision.
        */}
        <style
          dangerouslySetInnerHTML={{
            __html:
              ':root{font-size:0.0520833333vw}@media (max-width:767.98px){:root{font-size:1px}}',
          }}
        />
        {/* Both faces are self-hosted and font-display: swap, so preloading the
            sans avoids a flash on the body copy that carries most of the page. */}
        <link rel="preload" href="/fonts/switzer-400.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="/fonts/hedvig-letters-serif-400-latin.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <a className="skip-link fn-b2" href="#main">
          Skip to content
        </a>
        <EaseProvider />
        <Splash />
        {children}
      </body>
    </html>
  );
}
