import RouteShell from '@/components/RouteShell';
import { ABOUT, CAPABILITIES, INTRO, PEOPLE, img } from '@/lib/dummy';
import '../page.css';
import '../work/work.css';

export const metadata = { title: 'About' };

/** /about — the studio, the practice, and the people behind it. */
export default function About() {
  return (
    <RouteShell heading="A studio shaped by clarity" label="About">
      <section className="sec" data-role="section">
        <div className="ctr" data-role="container">
          <div className="sec-about__lead">
            <p className="fn-b1 sec-about__label" data-role="body-1">
              {ABOUT.label}
            </p>
            <p className="fn-h5 sec-about__body" data-role="h5" data-split-scrub>
              {ABOUT.body}
            </p>
          </div>

          <div className="grd sec-about__cols" data-role="grid">
            {ABOUT.columns.map((c, i) => (
              <div className={`sec-about__col sec-about__col--${i === 0 ? 'a' : 'b'}`} data-reveal key={c.no}>
                <h3 className="fn-b1 f-sf sec-about__col-no">{c.no}</h3>
                <div className="sec-about__col-body">
                  <p className="fn-b1">{c.heading}</p>
                  <ul>
                    {c.items.map((it) => (
                      <li className="fn-b2" key={it}>
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" data-role="section">
        <div className="ctr" data-role="container">
          <div className="grd" data-role="grid">
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

      <section className="sec" data-role="section" id="team">
        <div className="ctr" data-role="container">
          <div className="sec-people__intro">
            <h2 className="fn-b1 f-sf sec-people__label">Team</h2>
            <h3 className="fn-h3 lh-open sec-people__heading" data-split>
              {PEOPLE.heading.join(' ')}
            </h3>
          </div>

          <div className="grd sec-about__cols" data-role="grid">
            {INTRO.experience.map((e, i) => (
              <div className={`sec-about__col sec-about__col--${i % 2 === 0 ? 'a' : 'b'}`} data-reveal key={e.no}>
                <h3 className="fn-b1 f-sf sec-about__col-no">{e.no}</h3>
                <div className="sec-about__col-body">
                  <p className="fn-b1">{e.title}</p>
                  <p className="fn-b2">{e.period}</p>
                </div>
              </div>
            ))}
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
