import './work-grid.css';


/**
 * The staggered project grid.
 *
 * Each card is an image frame plus a caption row. The caption holds two lines
 * stacked in the same box so they can roll past each other on hover; the
 * incoming line carries the underline that wipes in behind it.
 */
type Card = { title: string; metric: string; image: string | null; subtitle?: string; href?: string | null };

export default function WorkGrid({ projects }: { projects: Card[] }) {
  return (
    <div className="grd work-grid" data-role="work-grid">
      {projects.map((p) => {
        // No screenshot for this one — render the outlined empty plate rather
        // than substituting an image from another project.
        const empty = p.image === null;
        const external = !!p.href && /^https?:/.test(p.href);
        return (
          <article className={`work-card${empty ? ' is--b' : ''}`} data-role="work-card" key={p.title}>
            <a
              aria-label={p.subtitle ? `${p.title} — ${p.subtitle}` : p.title}
              href={p.href ?? '#work'}
              rel={external ? 'noreferrer noopener' : undefined}
              target={external ? '_blank' : undefined}
            >
              {/* No data-gl: the WebGL layer only knows cover fit, and these
                  are screenshots of mixed shapes that have to be shown whole.
                  Nothing is substituted when there is no screenshot — the
                  frame is left genuinely empty and is--b outlines it. */}
              <div className="work-frame" data-role="work-frame">
                {p.image ? <img alt={p.subtitle ? `${p.title} — ${p.subtitle}` : p.title} loading="lazy" src={p.image} /> : null}
              </div>

              <div className="work-meta-row" data-role="work-meta-row">
                <span className="work-title fn-b1">{p.title}</span>

                <span className="work-caption fn-b1" data-role="work-caption">
                  <span className="caption-out" data-role="caption-out">
                    {p.metric}
                  </span>
                  <span className="caption-in link" data-role="caption-in">
                    Visit
                  </span>
                </span>
              </div>
            </a>
          </article>
        );
      })}
    </div>
  );
}
