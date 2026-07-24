import type { Metadata } from 'next';
import EaseProvider from '@/components/EaseProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Andi Muhammad Alief Fauzan — Backend Developer & Cloud Computing Specialist',
  description:
    'Backend developer and cloud computing specialist. Informatics student building APIs, data platforms, and cloud infrastructure.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
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
        {children}
      </body>
    </html>
  );
}
