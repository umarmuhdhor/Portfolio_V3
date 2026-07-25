import ScrollMotion from '@/components/ScrollMotion';
import SiteHeader from '@/components/SiteHeader';
import WebGLLayer from '@/components/WebGLLayer';
import WorkGrid from '@/components/WorkGrid';
import {
  ABOUT,
  CAPABILITIES,
  FOOTER,
  LOGOS,
  NAME,
  PRINCIPLES,
  PROCESS,
  PROJECTS,
  SERVICES,
  STATS,
  TAGLINE,
} from '@/lib/content';
import './page.css';

/**
 * The portfolio — ten sections, mapped one-for-one onto the reference's
 * structure. The content is mine; the grid, rhythm and type are measured.
 */
export default function Home() {
  return (
    <>
      <ScrollMotion />
      <WebGLLayer />
      <SiteHeader counter="01" />

      {/* The reference hides the native bar above the breakpoint and draws its
          own; the thumb is positioned from scroll progress in ScrollMotion. */}
      <div aria-hidden="true" className="scrollbar">
        <div className="scrollbar-track">
          <div className="scrollbar-thumb" />
        </div>
      </div>

      <main id="main">
        {/* The reference wraps its sections in a single div inside #main; its own
            section selector counts that wrapper, so the shape is reproduced here
            or every section index compares against the wrong counterpart. */}
        <div className="page" data-role="section">
        {/* 1 — hero -------------------------------------------------------- */}
        <section className="sec hero" data-role="section" id="index">
          <div className="ctr" data-role="container">
            <div className="grd" data-role="grid">
              <h1 className="fn-h2 hero__name e-lh hero__name--centred" data-role="h2" data-split>
                {NAME}
              </h1>
              <div className="hero__frame" data-gl>
                <img alt="" src="/images/profile/foto_alief.webp" />
              </div>
            </div>
          </div>
        </section>

        {/* 2 — statement --------------------------------------------------- */}
        <section className="sec" data-role="section">
          <div className="ctr" data-role="container">
            <div className="grd" data-role="grid">
              <h2 className="fn-h3 statement__tagline" data-role="h3" data-split>
                {TAGLINE}
              </h2>

              {SERVICES.map((s) => (
                <div className="statement__col" data-reveal key={s.heading}>
                  <p className="fn-b1 statement__col-heading" data-role="body-1">
                    {s.heading}
                  </p>
                  <ul>
                    {s.items.map((i) => (
                      <li className="fn-b2" key={i}>
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="statement__frame" data-gl>
                <img alt="" loading="lazy" src="/images/work/grooth.webp" />
              </div>
            </div>
          </div>
        </section>

        {/* 3 — about ------------------------------------------------------- */}
        <section className="sec" data-role="section" id="about">
          <div className="ctr" data-role="container">
            <div className="grd" data-role="grid">
              <div className="about__meta">
                {ABOUT.meta.map((m) => (
                  <div key={m.key}>
                    <p className="about__meta-key fn-b2" data-role="body-2">
                      {m.key}
                    </p>
                    <p className="fn-b1">{m.value}</p>
                  </div>
                ))}
              </div>

              <div className="about__manifesto" data-reveal>
                {ABOUT.manifesto.map((p) => (
                  <p className="fn-h5" data-role="h5" key={p.slice(0, 24)}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 4 — capabilities ------------------------------------------------ */}
        <section className="sec" data-role="section">
          <div className="ctr" data-role="container">
            <div className="grd" data-role="grid">
              {CAPABILITIES.groups.map((g) => (
                <div className="caps__group" data-reveal key={g.heading}>
                  <p className="caps__heading fn-b1">{g.heading}</p>
                  <ul>
                    {g.items.map((i) => (
                      <li className="fn-b2" key={i}>
                        {i}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              <div className="caps__meta">
                {CAPABILITIES.meta.map((m) => (
                  <div key={m.key}>
                    <p className="caps__meta-key fn-b2">{m.key}</p>
                    <p className="fn-b1">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5 — process ----------------------------------------------------- */}
        <section className="sec" data-role="section">
          <div className="ctr" data-role="container">
            <div className="grd" data-role="grid">
              <h2 className="fn-h3 process__heading" data-split>{PROCESS.heading}</h2>

              <div className="process__frame" data-gl>
                <img alt="" loading="lazy" src="/images/work/keretaxpress-web.webp" />
              </div>
              <div className="process__frame" data-gl>
                <img alt="" loading="lazy" src="/images/work/peduliPasal.webp" />
              </div>

              <div className="process__steps">
                {PROCESS.steps.map((s) => (
                  <div className="process__step" data-reveal key={s.no}>
                    <p className="fn-b2 process__step-no">{s.no}</p>
                    <p className="fn-h5 process__step-title">{s.title}</p>
                    <p className="fn-b1 process__step-body">{s.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 6 — selected work ----------------------------------------------- */}
        <section className="sec" data-role="section" id="work">
          <div className="ctr" data-role="container">
            <div className="grd" data-role="grid">
              <h2 className="fn-h3 work__heading" data-split>Selected work</h2>
            </div>
            <WorkGrid projects={PROJECTS} />
          </div>
        </section>

        {/* 7 — principles -------------------------------------------------- */}
        <section className="sec sec--desk" data-role="section">
          <div className="ctr" data-role="container">
            <div className="grd" data-role="grid">
              <h2 className="fn-h3 principles__heading" data-split>Tools</h2>

              <ol className="principles__list">
                {PRINCIPLES.map((p) => (
                  <li className="principles__item" data-reveal key={p.no}>
                    <span className="fn-b2 principles__no">{p.no}</span>
                    <span className="fn-h5 principles__title">{p.title}</span>
                    <span className="fn-b1 principles__body">{p.body}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* 8 — stats and image wall ---------------------------------------- */}
        <section className="sec" data-role="section">
          <div className="ctr" data-role="container">
            <div className="grd" data-role="grid">
              <h2 className="fn-h3 stats__heading" data-split>Certifications, and the hours behind them</h2>

              <div className="stats__row">
                {STATS.map((s) => (
                  <div key={s.label}>
                    <p className="fn-h4">{s.value}</p>
                    <p className="fn-b2 stats__label">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="stats__wall">
                <div className="stats__wall-frame" data-gl>
                  <img alt="" loading="lazy" src="/images/work/arcadeCalc.webp" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9 — logo wall --------------------------------------------------- */}
        <section className="sec sec--tight" data-role="section">
          <div className="ctr" data-role="container">
            <div className="grd" data-role="grid">
              <h2 className="fn-h5 logos__heading">Programmes and issuers</h2>

              <div className="logos__row">
                {LOGOS.map((l) => (
                  <div className="logos__item" data-reveal key={l.src}>
                    <img alt={l.alt} loading="lazy" src={l.src} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
        {/* 10 — footer ------------------------------------------------------- */}
      <footer className="footer" data-role="footer" id="contact">
        <div className="ctr" data-role="container">
          <div className="grd" data-role="grid">
            {/* The reference opens its footer with a ~103rem brand mark at
                column 1. It is a plain anchor — no underline treatment — so it
                stays position: static. */}
            <a className="fn-b1 footer__brand" data-role="footer-link" href={FOOTER.brand.href}>
              {FOOTER.brand.label}
            </a>

            <p className="fn-meta footer__name">{NAME}</p>

            <h2 className="fn-h4 footer__headline" data-role="h4">
              Open to backend and cloud work
            </h2>

            <div className="footer__links">
              {FOOTER.columns.map((c) => (
                <div key={c.heading}>
                  <p className="fn-b2 footer__col-heading">{c.heading}</p>
                  <ul>
                    {c.links.map((l) => (
                      <li key={l.href}>
                        <a
                          className="link fn-b1"
                          data-role="footer-link"
                          href={l.href}
                          rel={l.href.startsWith('http') ? 'noreferrer noopener' : undefined}
                          target={l.href.startsWith('http') ? '_blank' : undefined}
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="footer__col">
              <p className="fn-b2 footer__col-heading">Address</p>
              <ul>
                {FOOTER.address.map((a) => (
                  <li className="fn-b1" key={a}>
                    {a}
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer__col">
              <p className="fn-b2 footer__col-heading">Hours</p>
              <ul>
                {FOOTER.hours.map((h) => (
                  <li className="fn-b1" key={h}>
                    {h}
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer__meta">
              <div className="footer__meta-row">
                <span className="fn-b2">© 2026</span>
                <span className="fn-b2">Built from a measured spec</span>
                <span className="fn-b2">Indonesia</span>
              </div>
            </div>
          </div>
        </div>
        </footer>
        </div>
      </main>
    </>
  );
}
