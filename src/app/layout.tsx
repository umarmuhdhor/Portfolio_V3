import type { Metadata } from 'next';
import EaseProvider from '@/components/EaseProvider';
import Splash from '@/components/Splash';
import { SITE } from '@/lib/dummy';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: SITE.url ? new URL(SITE.url) : undefined,
  title: { default: SITE.title, template: `%s — ${SITE.title.split(' — ')[0]}` },
  description: SITE.description,
  keywords: SITE.keywords,
  icons: SITE.favicon ? { icon: SITE.favicon } : undefined,
  openGraph: {
    title: SITE.title,
    description: SITE.description,
    images: SITE.ogImage ? [{ url: SITE.ogImage, width: 1200, height: 630 }] : undefined,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/*
          Fluid rem: 1rem === one design pixel, 1920 on desktop and 375 below
          the breakpoint. Inlined rather than authored in globals.css because
          the CSS minifier truncates the literal's precision, and the rounding
          error propagates into every measurement derived from rem.
        */}
        <style
          dangerouslySetInnerHTML={{
            __html:
              ':root{font-size:0.0520833333vw}@media (max-width:767.98px){:root{font-size:0.2666666667vw}}',
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
