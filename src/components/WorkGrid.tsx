import './work-grid.css';
import type { Project } from '@/lib/content';

/**
 * The staggered project grid.
 *
 * Each card is an image frame plus a caption row. The caption holds two lines
 * stacked in the same box so they can roll past each other on hover; the
 * incoming line carries the underline that wipes in behind it.
 */
export default function WorkGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grd work-grid" data-role="work-grid">
      {projects.map((p) => {
        // No screenshot for this one — render the outlined empty plate rather
        // than substituting an image from another project.
        const empty = p.image === null;
        return (
          <article className={`work-card${empty ? ' is--b' : ''}`} data-role="work-card" key={p.title}>
            <a
              aria-label={`${p.title} — ${p.subtitle}`}
              href={p.href ?? undefined}
              rel="noreferrer noopener"
              target="_blank"
            >
              <div className="work-frame" data-gl data-role="work-frame">
                {/* Nothing is substituted when there is no screenshot — the
                    frame is left genuinely empty and is--b outlines it. */}
                {p.image ? <img alt={`${p.title} — ${p.subtitle}`} loading="lazy" src={p.image} /> : null}
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
