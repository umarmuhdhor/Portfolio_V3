import { notFound } from 'next/navigation';
import RouteShell from '@/components/RouteShell';
import { PROJECT_PAGES } from '@/lib/dummy';
import '../../page.css';
import '../work.css';

export function generateStaticParams() {
  return PROJECT_PAGES.map((p) => ({ slug: p.slug }));
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
            </dl>

            <p className="fn-h5 detail__summary" data-split-scrub>
              {project.summary}
            </p>
          </div>

          {project.gallery.map((src, n) => (
            <div className="detail__plate" data-gl key={src + n}>
              <img alt={`${project.title}, view ${n + 1}`} loading="lazy" src={src} />
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
