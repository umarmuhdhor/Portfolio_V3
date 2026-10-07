import { Fragment } from 'react';

/** Names that always link out wherever they appear in running text. */
const LINKS: Record<string, string> = {
  'Apple Developer Academy @BINUS': 'https://developeracademy.apps.binus.ac.id/',
};

const pattern = new RegExp(
  `(${Object.keys(LINKS)
    .map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')})`,
);

/**
 * Plain data text with every known name turned into an external link.
 * Hook-free, so it renders in server and client components alike. Never use
 * it for text that already sits inside a link — anchors cannot nest.
 */
export default function Linked({ children }: { children: string | null | undefined }) {
  if (!children) return null;
  return children.split(pattern).map((part, i) =>
    LINKS[part] ? (
      <a className="link-inline" href={LINKS[part]} key={i} rel="noreferrer noopener" target="_blank">
        {part}
      </a>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}
