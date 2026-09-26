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
  CAPABILITIES,
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
      <SiteHeader counter="01" />

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
                    {HERO.lines.join(' ')}
                  </span>
                </h1>
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
                      <span className="fn-b1 sec-intro__exp-body">{e.body}</span>
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

                {/* Capabilities live inside the introduction rather than in a
                    section of their own. The reference carries its service
                    list in the same block as its about copy, and splitting
                    them into two sections put an extra section root ahead of
                    the desktop-only diagram, which shifted every section
                    index after it out of alignment with the reference. */}
                <h2 className="fn-h3 sec-caps__heading" data-role="h3" data-split>
                  {CAPABILITIES.heading}
                </h2>
                <p className="fn-b2 sec-caps__label">{CAPABILITIES.label}</p>
                <ul className="sec-caps__list">
                  {CAPABILITIES.items.map((i) => (
                    <li className="fn-h5 sec-caps__item" data-reveal key={i}>
                      {i}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 5 — the service index: a directory of what gets built ----------- */}
          <ServiceIndex />

          {/* 6 — process, two editorial blocks ------------------------------- */}
          <section className="sec-process" data-role="section">
            <div className="ctr" data-role="container">
              {PROCESS.map((b, i) => (
                <div className="sec-process__block" key={b.note}>
                  <h2 className="lh-open fn-h4 f-mn sec-process__heading" data-split>
                    {b.heading.join(' ')}
                  </h2>
                  <Frame className="sec-process__plate" src={PLATES.process[i] ?? PLATES.process[0]} />
                  <div className="grd sec-process__spread" data-role="grid">
                    <p className="fn-h5 lh-open sec-process__lead" data-split-scrub>
                      {b.lead}
                    </p>
                    <div className="sec-process__note" data-reveal>
                      <p className="fn-b1 f-sf">{b.note}</p>
                      <p className="fn-b1">{b.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 6 — selected work ----------------------------------------------- */}
          <section className="sec-work" data-role="section" id="work">
            <div className="ctr" data-role="container">
              <p className="lh-open fn-h4 f-mn sec-work__heading" data-split>
                {WORK.heading.join(' ')}
              </p>
              <WorkGrid projects={WORK.cards} />
              <a className="link fn-b1 is--a sec-work__cta" href="#work">
                {WORK.cta}
              </a>
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
                <div className="sec-people__stats-col">
                  {PEOPLE.stats.map((s) => (
                    <div className="sec-people__stat" data-reveal key={s.value}>
                      <h3 className="fn-h2 f-mn">{s.value}</h3>
                      <h3 className="fn-h3 lh-open">{s.label}</h3>
                    </div>
                  ))}
                </div>
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
                <a className="link fn-h5 sec-contact__cta" href={`mailto:${CONTACT.cta}`}>
                  {CONTACT.cta}
                </a>
              </div>
            </div>
          </section>

          <SiteFooter />
        </div>
      </main>
    </>
  );
}
