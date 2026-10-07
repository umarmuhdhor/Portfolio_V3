import Linked from '@/components/Linked';
import { INDEX } from '@/lib/dummy';
import './service-index.css';

/**
 * The skill index.
 *
 * A label and a display heading, then one block per category: the category
 * named once on the left, its skills listed on the right with where each was
 * used. Grouping says "Frameworks" once instead of on eight rows, and puts
 * the left-hand columns — empty in a flat table — to work.
 */
export default function ServiceIndex() {
  return (
    <section className="sec-index" data-role="section" id="services">
      <div className="ctr" data-role="container">
        <div className="grd" data-role="grid">
          <p className="fn-b2 sec-index__label">{INDEX.label}</p>

          <h2 className="fn-h3 lh-open sec-index__heading" data-role="h3" data-split>
            {INDEX.heading}
          </h2>

          <div className="sec-index__groups">
            {INDEX.groups.map((g) => (
              <section className="sec-index__group" data-reveal key={g.category}>
                <h3 className="fn-h5 sec-index__category">
                  {g.category}
                  <span className="fn-b2 sec-index__count">{String(g.rows.length).padStart(2, '0')}</span>
                </h3>
                <ul className="sec-index__rows">
                  {g.rows.map((r) => (
                    <li className="sec-index__row" key={r.title}>
                      <p className="fn-b1 sec-index__title">{r.title}</p>
                      <p className="fn-b1 sec-index__detail">
                        <Linked>{r.detail}</Linked>
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
