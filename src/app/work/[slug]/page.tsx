import Link from 'next/link';
import { notFound } from 'next/navigation';
import RouteShell from '@/components/RouteShell';
import { PROJECT_PAGES } from '@/lib/dummy';
import '../../page.css';
import '../work.css';
import './case.css';

export function generateStaticParams() {
  return PROJECT_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = PROJECT_PAGES.find((p) => p.slug === slug);
  return project ? { title: project.title, description: project.summary } : {};
}

type Page = (typeof PROJECT_PAGES)[number];
type Plate = Page['gallery'][number];

/** One case-study block: a serif label in the narrow column, content in the wide one. */
function Block({ label, children, id }: { label: string; children: React.ReactNode; id?: string }) {
  return (
    <section className="sec cs" data-role="section" id={id}>
      <div className="ctr" data-role="container">
        <div className="grd" data-role="grid">
          <h2 className="fn-b1 f-sf cs__label">{label}</h2>
          <div className="cs__body">{children}</div>
        </div>
      </div>
    </section>
  );
}

/** A screenshot plate. Phone portraits are shown whole rather than
 *  cover-cropped, which also keeps the WebGL layer (cover fit only) off them. */
function Plate({ plate, title, n }: { plate: Plate; title: string; n: number }) {
  return (
    <figure className="cs-plate">
      <div
        className={`detail__plate${plate.portrait ? ' detail__plate--portrait' : ''}`}
        data-gl={plate.portrait ? undefined : true}
      >
        <img alt={plate.alt || `${title}, view ${n + 1}`} loading="lazy" src={plate.src} />
      </div>
      {plate.caption ? <figcaption className="fn-b2 cs-plate__caption">{plate.caption}</figcaption> : null}
    </figure>
  );
}

const pad = (n: number) => String(n + 1).padStart(2, '0');

/** /work/[slug] — one project, as a case study. Every block is optional:
 *  a record that leaves a field empty simply has fewer sections. */
export default async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const i = PROJECT_PAGES.findIndex((p) => p.slug === slug);
  if (i === -1) notFound();

  const project = PROJECT_PAGES[i];
  const next = PROJECT_PAGES[(i + 1) % PROJECT_PAGES.length];
  const [cover, ...rest] = project.gallery;

  return (
    <RouteShell heading={project.title} label={`${project.discipline} · ${project.year}`} nav="/work">
      {/* Overview: facts and links beside the one-line pitch ------------- */}
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
              {project.links.length ? (
                <div>
                  <dt className="fn-b2">Links</dt>
                  <dd>
                    <ul className="cs-links">
                      {project.links.map((l) => (
                        <li key={l.href}>
                          <a className="link fn-b1" href={l.href} rel="noreferrer noopener" target="_blank">
                            {l.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className="detail__summary">
              <p className="fn-b2 cs-subtitle">{project.subtitle}</p>
              <p className="fn-h5" data-split-scrub>
                {project.summary}
              </p>
            </div>

            <div className="detail__body" data-reveal>
              {project.description.map((d) => (
                <p className="fn-b1" key={d.slice(0, 24)}>
                  {d}
                </p>
              ))}
              {project.privateNote ? <p className="fn-b2 cs-private">{project.privateNote}</p> : null}
            </div>
          </div>

          {cover ? <Plate n={0} plate={cover} title={project.title} /> : null}
        </div>
      </section>

      {/* Impact: the measured numbers, set large --------------------------- */}
      {project.impact.length ? (
        <Block label="Impact">
          <ul className="cs-impact">
            {project.impact.map((m) => (
              <li className="cs-impact__item" data-reveal key={m.metric}>
                <p className="fn-h4 f-mn cs-impact__value">{m.value}</p>
                <p className="fn-b1">{m.metric}</p>
                {m.note ? <p className="fn-b2 cs-muted">{m.note}</p> : null}
              </li>
            ))}
          </ul>
        </Block>
      ) : null}

      {/* Problem and solution ---------------------------------------------- */}
      {project.problem || project.solution ? (
        <Block label="Brief">
          <div className="cs-pair">
            {project.problem ? (
              <div data-reveal>
                <p className="fn-b2 cs-muted">Problem</p>
                <p className="fn-h5">{project.problem}</p>
              </div>
            ) : null}
            {project.solution ? (
              <div data-reveal>
                <p className="fn-b2 cs-muted">Solution</p>
                <p className="fn-h5">{project.solution}</p>
              </div>
            ) : null}
          </div>
        </Block>
      ) : null}

      {/* What I did --------------------------------------------------------- */}
      {project.responsibilities.length ? (
        <Block label="My role">
          <ol className="cs-rows">
            {project.responsibilities.map((r, n) => (
              <li className="cs-row" data-reveal key={r.slice(0, 32)}>
                <span className="fn-b2 cs-muted">{pad(n)}</span>
                <p className="fn-b1">{r}</p>
              </li>
            ))}
          </ol>
        </Block>
      ) : null}

      {/* Features ----------------------------------------------------------- */}
      {project.features.length ? (
        <Block label="Features">
          <ol className="cs-features">
            {project.features.map((f, n) => (
              <li className="cs-feature" data-reveal key={f.slice(0, 32)}>
                <span className="fn-b2 cs-muted">{pad(n)}</span>
                <p className="fn-b1">{f}</p>
              </li>
            ))}
          </ol>
        </Block>
      ) : null}

      {/* Architecture and stack, by layer ---------------------------------- */}
      {project.architecture || project.stackLayers.length ? (
        <Block label="Architecture">
          {project.architecture ? (
            <p className="fn-h5 cs-architecture" data-reveal>
              {project.architecture}
            </p>
          ) : null}
          <dl className="cs-stack" data-reveal>
            {project.stackLayers.map((l) => (
              <div key={l.label}>
                <dt className="fn-b2 cs-muted">{l.label}</dt>
                <dd className="fn-b1">{l.items.join(', ')}</dd>
              </div>
            ))}
          </dl>
        </Block>
      ) : null}

      {/* Challenges: what broke, and what fixed it ------------------------- */}
      {project.challenges.length ? (
        <Block label="Challenges">
          <ol className="cs-rows">
            {project.challenges.map((c, n) => (
              <li className="cs-challenge" data-reveal key={c.problem.slice(0, 32)}>
                <span className="fn-b2 cs-muted">{pad(n)}</span>
                <div>
                  <p className="fn-b2 cs-muted">Problem</p>
                  <p className="fn-b1">{c.problem}</p>
                </div>
                <div>
                  <p className="fn-b2 cs-muted">Solution</p>
                  <p className="fn-b1">{c.solution}</p>
                </div>
              </li>
            ))}
          </ol>
        </Block>
      ) : null}

      {/* The rest of the screenshots --------------------------------------- */}
      {rest.length ? (
        <section className="sec" data-role="section">
          <div className="ctr" data-role="container">
            {rest.map((m, n) => (
              <Plate key={m.src} n={n + 1} plate={m} title={project.title} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Lessons ------------------------------------------------------------ */}
      {project.lessons.length ? (
        <Block label="Lessons">
          <ol className="cs-lessons">
            {project.lessons.map((l, n) => (
              <li className="cs-lesson" data-reveal key={l.slice(0, 32)}>
                <span className="fn-b2 cs-muted">{pad(n)}</span>
                <p className="fn-h5">{l}</p>
              </li>
            ))}
          </ol>
        </Block>
      ) : null}

      <section className="sec" data-role="section">
        <div className="ctr" data-role="container">
          <Link className="cs-next" href={`/work/${next.slug}`}>
            <span className="fn-b2 cs-muted">Next project</span>
            <span className="fn-h3 cs-next__title">{next.title}</span>
            <span className="fn-b1 cs-muted">{next.subtitle}</span>
          </Link>
        </div>
      </section>
    </RouteShell>
  );
}
