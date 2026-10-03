import Link from 'next/link';
import './work-grid.css';


/**
 * The staggered project grid.
 *
 * Each card is one composed frame: visual first, then a compact metadata rail.
 * The longer subtitle stays in the link's accessible name instead of becoming
 * a loose paragraph below the card.
 */
export type Card = {
  title: string;
  metric: string;
  image: string | null;
  subtitle?: string;
  href?: string | null;
  shape?: 'wide' | 'tall' | 'square';
};

/** `row` sets the cards side by side at one height instead of the stagger. */
export default function WorkGrid({ projects, layout = 'stagger' }: { projects: Card[]; layout?: 'stagger' | 'row' }) {
  return (
    <div className={`grd work-grid${layout === 'row' ? ' work-grid--row' : ''}`} data-role="work-grid">
      {projects.map((p, i) => {
        // No screenshot for this one — render the outlined empty plate rather
        // than substituting an image from another project.
        const empty = p.image === null;
        const external = !!p.href && /^https?:/.test(p.href);
        const content = (
          <>
            {/* No data-gl: the WebGL layer only knows cover fit, and these
                are screenshots of mixed shapes that have to be shown whole.
                Nothing is substituted when there is no screenshot — the
                frame is left genuinely empty and is--b outlines it. */}
            <div className={`work-frame${p.shape ? ` is--${p.shape}` : ''}`} data-role="work-frame">
              <div className="work-visual">
                {p.image ? (
                  <img alt={p.subtitle ? `${p.title} — ${p.subtitle}` : p.title} loading="lazy" src={p.image} />
                ) : null}
              </div>

              <div className="work-meta-row" data-role="work-meta-row">
                <span className="work-title-group">
                  <span aria-hidden="true" className="fn-b2 work-card__index">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="work-title fn-b1">{p.title}</span>
                </span>

                <span className="work-caption fn-b1" data-role="work-caption">
                  <span className="caption-out" data-role="caption-out">
                    {p.metric}
                  </span>
                  {p.href ? (
                    <span className="caption-in link" data-role="caption-in">
                      {external ? 'Visit' : 'View'}
                    </span>
                  ) : null}
                </span>
              </div>
            </div>
          </>
        );

        return (
          <article
            className={`work-card${empty ? ' is--b' : ''}`}
            data-role="work-card"
            key={p.title}
            style={{ '--i': i } as React.CSSProperties}
          >
            {p.href ? (
              external ? (
                <a
                  aria-label={p.subtitle ? `${p.title} — ${p.subtitle}` : p.title}
                  href={p.href}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {content}
                </a>
              ) : (
                <Link aria-label={p.subtitle ? `${p.title} — ${p.subtitle}` : p.title} href={p.href}>
                  {content}
                </Link>
              )
            ) : (
              <div className="work-card__body">{content}</div>
            )}
          </article>
        );
      })}
    </div>
  );
}
