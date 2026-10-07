import RouteShell from '@/components/RouteShell';
import Linked from '@/components/Linked';
import { ABOUT, AWARDS, CAPABILITIES, EDUCATION, EXPERIENCE, PEOPLE, PUBLICATION, img } from '@/lib/dummy';
import '../page.css';
import '../work/work.css';

export const metadata = { title: 'About' };

/** A labelled list of dated rows — experience, education, awards. */
function Record({
  id,
  label,
  rows,
}: {
  id: string;
  label: string;
  rows: { key: string; aside: string; title: string; detail?: string; href?: string | null }[];
}) {
  return (
    <section className="sec" data-role="section" id={id}>
      <div className="ctr" data-role="container">
        <div className="grd" data-role="grid">
          <h2 className="fn-h3 sec-caps__heading" data-role="h3" data-split>
            {label}
          </h2>
          {rows.map((r) => (
            <div className="legal__block" data-reveal key={r.key}>
              <h3 className="fn-b1">{r.aside}</h3>
              <div>
                {r.href ? (
                  <a className="link fn-h5" href={r.href} rel="noreferrer noopener" target="_blank">
                    {r.title}
                  </a>
                ) : (
                  <p className="fn-h5">
                    <Linked>{r.title}</Linked>
                  </p>
                )}
                {r.detail ? (
                  <p className="fn-b1">
                    <Linked>{r.detail}</Linked>
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** /about — the person, the skills, and the record behind the work. */
export default function About() {
  return (
    <RouteShell heading="Apps on the device, agents behind them" label="About" nav="/about">
      {/* The page heading already carries the "About" label, and the skill
          lists that used to sit here are the Capabilities rows below. The
          long bio lives here; the index has the short one. */}
      <section className="sec" data-role="section">
        <div className="ctr" data-role="container">
          <div className="grd sec-about__grid" data-role="grid">
            <div className="sec-about__lead">
              <p className="fn-h5 sec-about__body" data-role="h5" data-split-scrub>
                <Linked>{ABOUT.lead}</Linked>
              </p>
              <div className="sec-about__more">
                {ABOUT.body.map((b) => (
                  <p className="fn-b1" data-reveal key={b.slice(0, 20)}>
                    <Linked>{b}</Linked>
                  </p>
                ))}
              </div>
            </div>
            {ABOUT.portrait ? (
              <figure className="sec-about__portrait" data-reveal>
                <img alt={ABOUT.portraitAlt} height={741} src={ABOUT.portrait} width={541} />
              </figure>
            ) : null}
          </div>
        </div>
      </section>

      <section className="sec" data-role="section">
        <div className="ctr" data-role="container">
          <div className="grd" data-role="grid">
            <p className="fn-b2 sec-caps__label">{CAPABILITIES.label}</p>
            <h2 className="fn-h3 sec-caps__heading" data-role="h3" data-split>
              {CAPABILITIES.heading}
            </h2>
            <ul className="sec-caps__list">
              {CAPABILITIES.items.map((i) => (
                <li className="sec-caps__item" data-reveal key={i.no}>
                  <span className="fn-b2 sec-caps__no">{i.no}</span>
                  <span className="fn-h5 sec-caps__category">{i.category}</span>
                  <span className="fn-b1 sec-caps__skills">{i.skills}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Record
        id="experience"
        label="Experience"
        rows={EXPERIENCE.filter((e) => e.paid).map((e) => ({
          key: e.no,
          aside: e.period,
          title: e.title,
          detail: e.company,
        }))}
      />

      <Record
        id="beyond-work"
        label="Beyond Work"
        rows={EXPERIENCE.filter((e) => !e.paid).map((e) => ({
          key: e.no,
          aside: e.period,
          title: e.title,
          detail: e.company,
        }))}
      />

      <Record
        id="education"
        label="Education"
        rows={EDUCATION.map((e) => ({ key: e.no, aside: e.period, title: e.title, detail: e.detail }))}
      />

      {PUBLICATION ? (
        <Record
          id="publication"
          label="Publication"
          rows={[
            {
              key: 'paper',
              aside: PUBLICATION.year,
              title: PUBLICATION.title,
              detail: `${PUBLICATION.authors}. ${PUBLICATION.venue}. ${PUBLICATION.summary}`,
              href: PUBLICATION.href,
            },
          ]}
        />
      ) : null}

      <Record
        id="awards"
        label="Awards"
        rows={AWARDS.map((a) => ({ key: a.no, aside: a.detail, title: a.title, href: a.href }))}
      />

      <section className="sec" data-role="section" id="team">
        <div className="ctr" data-role="container">
          <div className="sec-people__intro">
            <h2 className="fn-b1 f-sf sec-people__label">Record</h2>
            <h3 className="fn-h3 lh-open sec-people__heading" data-split>
              {PEOPLE.heading.join(' ')}
            </h3>
          </div>

          <div className="sec-people__band">
            <div className="sec-people__marquee">
              <div className="sec-people__track">
                {Array.from({ length: 12 }, (_, i) => (
                  <div className="sec-people__tile" key={i}>
                    <img alt="" loading="lazy" src={img(i)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </RouteShell>
  );
}
