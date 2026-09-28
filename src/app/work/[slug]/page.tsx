import { notFound } from 'next/navigation';
import RouteShell from '@/components/RouteShell';
import { PROJECT_PAGES } from '@/lib/dummy';
import '../../page.css';
import '../work.css';

export function generateStaticParams() {
  return PROJECT_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = PROJECT_PAGES.find((p) => p.slug === slug);
  return project ? { title: project.title, description: project.summary } : {};
}

/** /work/[slug] — one project. */
export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = PROJECT_PAGES.findIndex((p) => p.slug === slug);
  if (i === -1) notFound();

  const project = PROJECT_PAGES[i];
  const next = PROJECT_PAGES[(i + 1) % PROJECT_PAGES.length];

  return (
    <RouteShell heading={project.title} label={`${project.discipline} · ${project.year}`}>
      <section className="sec" data-role="section">
        <div className="ctr" data-role="container">
          <div className="grd" data-role="grid">
            <dl className="detail__facts" data-reveal>
              {project.facts.map((f) => (
                <div key={f.key}>
                  <dt className="fn-b2">{f.key}</dt>
                  <dd className="fn-b1">{f.value}</dd>
                </div>
              ))}
              {project.href ? (
                <div>
                  <dt className="fn-b2">Link</dt>
                  <dd>
                    <a className="link fn-b1" href={project.href} rel="noreferrer noopener" target="_blank">
                      Visit
                    </a>
                  </dd>
                </div>
              ) : null}
            </dl>

            <p className="fn-h5 detail__summary" data-split-scrub>
              {project.summary}
            </p>

            <div className="detail__body" data-reveal>
              {project.description.map((d) => (
                <p className="fn-b1" key={d.slice(0, 24)}>
                  {d}
                </p>
              ))}
              {project.privateNote ? <p className="fn-b2">{project.privateNote}</p> : null}
            </div>
          </div>

          {project.gallery.map((m, n) => (
            // A phone screenshot in a landscape plate: shown whole rather than
            // cover-cropped, which also means the WebGL layer (cover fit only)
            // leaves it alone.
            <div
              className={`detail__plate${m.portrait ? ' detail__plate--portrait' : ''}`}
              data-gl={m.portrait ? undefined : true}
              key={m.src}
            >
              <img alt={m.alt || `${project.title}, view ${n + 1}`} loading="lazy" src={m.src} />
            </div>
          ))}

          <div className="detail__next">
            <span className="fn-b2">Next</span>
            <a className="link fn-h5" href={`/work/${next.slug}`}>
              {next.title}
            </a>
          </div>
        </div>
      </section>
    </RouteShell>
  );
}
