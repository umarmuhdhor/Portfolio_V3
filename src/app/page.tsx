import Link from 'next/link';
import LogoRing from '@/components/LogoRing';
import RadialDiagram from '@/components/RadialDiagram';
import ScrollMotion from '@/components/ScrollMotion';
import ServiceIndex from '@/components/ServiceIndex';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import WebGLLayer from '@/components/WebGLLayer';
import WorkGrid from '@/components/WorkGrid';
import {
  BAND,
  INTRO,
  CONTACT,
  DIAGRAM,
  HERO,
  PEOPLE,
  PLATES,
  PROCESS,
  RING,
  STATEMENT,
  WORK,
} from '@/lib/dummy';
import './page.css';

/** A full-bleed image frame that the WebGL layer can take over. */
function Frame({
  className,
  src,
  alt = '',
  eager = false,
}: {
  className: string;
  src: string;
  alt?: string;
  eager?: boolean;
}) {
  return (
    <div className={className} data-gl data-parallax>
      <img alt={alt} loading={eager ? 'eager' : 'lazy'} src={src} />
    </div>
  );
}

/**
 * The page — every block from hero to footer, in the reference's order and at
 * its measure. Content is placeholder; see src/lib/dummy.ts.
 */
export default function Home() {
  return (
    <>
      <ScrollMotion />
      <WebGLLayer />
      <SiteHeader overHero />

      <div aria-hidden="true" className="scrollbar">
        <div className="scrollbar-track">
          <div className="scrollbar-thumb" />
        </div>
      </div>

      <main id="main">
        <div className="page" data-role="section">
          {/* 1 — hero: full-bleed plate, name set low ---------------------- */}
          <section className="sec-hero" data-role="section" id="index">
            <Frame
              alt="Concrete facade, photographed from below"
              className="sec-hero__plate"
              eager
              src={PLATES.hero}
            />
            <div className="sec-hero__title">
              <div className="ctr" data-role="container">
                {/* The measured 0.8 leading stays on the heading; the wrap
                    spacing opens on an inner span so a two-line display line
                    does not collapse into itself. */}
                <h1 className="fn-h4 f-mn" data-role="h4">
                  <span className="lh-open" data-split>
                    {HERO.name}
                  </span>
                </h1>
                <p className="fn-b1 sec-hero__role">{HERO.role}</p>
              </div>
            </div>
          </section>

          {/* 2 — statement -------------------------------------------------- */}
          <section className="sec-statement" data-role="section">
            <div className="ctr" data-role="container">
              <div className="sec-statement__head">
                <h2 className="fn-h2 f-mn" data-role="h2">
                  <span className="lh-open" data-split>
                    {STATEMENT.heading}
                  </span>
                </h2>
                <div className="sec-statement__meta">
                  {STATEMENT.meta.map((m) => (
                    <span className="fn-b1" key={m}>
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <Frame
              alt="Patch panel in a server rack"
              className="sec-statement__plate"
              src={PLATES.statement}
            />
          </section>

          {/* 3 — introduction: who this is, and what they have done.
              Occupies the reference's about slot, so the section indices below
              it keep lining up with theirs. */}
          <section className="sec sec-intro" data-role="section" id="about">
            <div className="ctr" data-role="container">
              <div className="grd" data-role="grid">
                <p className="fn-b2 sec-intro__label">{INTRO.label}</p>

                <h2 className="fn-h3 sec-intro__name">
                  <span className="lh-open" data-split>
                    {INTRO.name}
                  </span>
                </h2>

                <p className="fn-h5 sec-intro__role" data-split-words>
                  {INTRO.role}
                </p>

                <div className="sec-intro__body">
                  {INTRO.body.map((b) => (
                    <p className="fn-b1" data-reveal key={b.slice(0, 20)}>
                      {b}
                    </p>
                  ))}
                </div>

                <dl className="sec-intro__meta" data-reveal>
                  {INTRO.meta.map((m) => (
                    <div key={m.key}>
                      <dt className="fn-b2">{m.key}</dt>
                      <dd className="fn-b1">{m.value}</dd>
                    </div>
                  ))}
                </dl>

                <ol className="sec-intro__exp">
                  {INTRO.experience.map((e) => (
                    <li className="sec-intro__exp-item" data-reveal key={e.no}>
                      <span className="fn-b2 sec-intro__exp-no">{e.no}</span>
                      <span className="fn-b2 sec-intro__exp-period">{e.period}</span>
                      <span className="fn-h5 sec-intro__exp-title">{e.title}</span>
                      <span className="sec-intro__exp-body">
                        <span className="fn-b1 sec-intro__exp-company">{e.company}</span>
                        <span className="fn-b1 sec-intro__exp-summary">{e.body}</span>
                      </span>
                    </li>
                  ))}
                </ol>

                <ul className="sec-intro__stack" data-reveal>
                  {INTRO.stack.map((t) => (
                    <li className="fn-b2" key={t}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 5 — the service index: a directory of what gets built ----------- */}
          <ServiceIndex />

          {/* 6 — selected work, ahead of the process blocks ---------------- */}
          <section className="sec-work" data-role="section" id="work">
            <div className="ctr" data-role="container">
              {/* Heading and the way to the rest on one line: the link is where
                  the eye ends the heading, not a screen further down. */}
              <div className="sec-work__head">
                <h2 className="lh-open fn-h4 f-mn sec-work__heading" data-split>
                  {WORK.heading.join(' ')}
                </h2>
                <Link className="link fn-b1 is--a sec-work__cta" href="/work">
                  {WORK.cta}
                </Link>
              </div>
              <WorkGrid layout="row" projects={WORK.cards} />
              <Link className="link fn-b1 is--a sec-work__cta sec-work__cta--end" href="/work">
                {WORK.cta}
              </Link>
            </div>
          </section>

          {/* 7 — process, two editorial blocks ------------------------------- */}
          <section className="sec-process" data-role="section">
            <div className="ctr" data-role="container">
              {PROCESS.map((b, i) => (
                <div className="sec-process__block" key={b.note}>
                  {/* Label, heading and what it means read as one unit, with
                      the photograph after them rather than between them. */}
                  <div className="grd sec-process__spread" data-role="grid">
                    <p className="fn-b2 sec-process__label">
                      {String(i + 1).padStart(2, '0')} — {b.note}
                    </p>
                    <h2 className="lh-open fn-h4 f-mn sec-process__heading" data-split>
                      {b.heading.join(' ')}
                    </h2>
                    <div className="sec-process__text">
                      <p className="fn-h5 sec-process__lead" data-split-scrub>
                        {b.lead}
                      </p>
                      <p className="fn-b1 sec-process__body" data-reveal>
                        {b.body}
                      </p>
                    </div>
                  </div>
                  <Frame className="sec-process__plate" src={PLATES.process[i] ?? PLATES.process[0]} />
                </div>
              ))}
            </div>
          </section>

          {/* 7 — radial diagram, desktop only -------------------------------- */}
          <section className="sec-diagram sec--desk" data-role="section">
            <div className="sec-diagram__stage">
              <div className="sec-diagram__marquees">
                {DIAGRAM.headings.map((h, i) => (
                  <h2
                    className={`fn-h4 f-mn lh-open sec-diagram__marquee sec-diagram__marquee--${i === 0 ? 'a' : 'b'}`}
                    data-lines
                    key={h[0]}
                  >
                    <span className="ln-mask">
                      <span className="ln">{h[0]}</span>
                    </span>
                    <span className="ln-mask">
                      <span className="ln">{h[1]}</span>
                    </span>
                  </h2>
                ))}
              </div>
              <RadialDiagram />
            </div>
          </section>

          {/* 8 — people, marquee and stats ----------------------------------- */}
          <section className="sec-people" data-role="section">
            <div className="ctr" data-role="container">
              <div className="sec-people__intro">
                <h2 className="fn-b1 f-sf sec-people__label" data-lines>
                  {PEOPLE.label.map((l) => (
                    <span className="ln-mask" key={l}>
                      <span className="ln">{l}</span>
                    </span>
                  ))}
                </h2>
                <h3 className="lh-open fn-h3 sec-people__heading" data-split>
                  {PEOPLE.heading.join(' ')}
                </h3>
              </div>

              <div className="sec-people__band">
                <div className="sec-people__marquee">
                  <div className="sec-people__track">
                    {BAND.map((src) => (
                      <div className="sec-people__tile" key={src}>
                        <img alt="" loading="lazy" src={src} />
                      </div>
                    ))}
                  </div>
                  <h2 className="fn-h2 f-mn lh-open sec-people__over" data-lines>
                    {PEOPLE.marqueeHeading.map((l) => (
                      <span className="ln-mask" key={l}>
                        <span className="ln">{l}</span>
                      </span>
                    ))}
                  </h2>
                </div>
                <div className="sec-people__cols">
                  {PEOPLE.columns.map((c) => (
                    <p className="fn-b1 sec-people__col" data-reveal key={c.slice(0, 16)}>
                      {c}
                    </p>
                  ))}
                </div>
              </div>

              <div className="sec-people__stats">
                <dl className="sec-people__stats-col">
                  {PEOPLE.stats.map((s) => (
                    <div className="sec-people__stat" data-reveal key={s.value}>
                      <dt className="fn-h2 f-mn sec-people__stat-value">{s.value}</dt>
                      <dd className="fn-b1 sec-people__stat-label">{s.label}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          {/* 10 — the tools ring --------------------------------------------- */}
          <section className="sec-ring" data-role="section">
            <div className="ctr" data-role="container">
              <h2 className="fn-h2 f-mn sec-ring__heading" data-role="h2">
                <span className="lh-open" data-split>
                  {RING.heading}
                </span>
              </h2>
            </div>
            <LogoRing />
          </section>

          {/* 11 — contact ----------------------------------------------------- */}
          <section className="sec-contact" data-role="section" id="contact">
            <div className="ctr" data-role="container">
              <div className="grd" data-role="grid">
                <p className="fn-b2 sec-contact__label">{CONTACT.label}</p>
                <h2 className="lh-open fn-h2 f-mn sec-contact__heading" data-split>
                  {CONTACT.heading.join(' ')}
                </h2>
                <p className="fn-b1 sec-contact__body" data-split-words>
                  {CONTACT.body}
                </p>
                <div className="sec-contact__cta">
                  <a className="link fn-h5" href={`mailto:${CONTACT.cta}`}>
                    {CONTACT.cta}
                  </a>
                  <ul className="sec-contact__links">
                    {CONTACT.links.map((l) => (
                      <li key={l.href}>
                        <a
                          className="link fn-b1"
                          href={l.href}
                          rel="noreferrer noopener"
                          target="_blank"
                        >
                          {l.label} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <SiteFooter />
        </div>
      </main>
    </>
  );
}
