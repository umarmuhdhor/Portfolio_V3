import { INDEX } from '@/lib/dummy';
import './service-index.css';

/**
 * The service index — the reference's office directory, rebuilt.
 *
 * Structurally: a display heading that reveals line by line, a serif label in
 * the narrow column, and a stack of rows in the wide one. Each row is a
 * three-up text grid over a hairline rule, and inverts to white-on-black on
 * hover. The rule is a child rather than a border so it can invert with the
 * row instead of staying black on a black fill.
 */
export default function ServiceIndex() {
  return (
    <section className="sec-index" data-role="section" id="services">
      <div className="ctr" data-role="container">
        <div className="grd" data-role="grid">
          <h2 className="fn-h3 lh-open sec-index__heading" data-role="h3" data-split>
            {INDEX.heading}
          </h2>

          <p className="fn-b1 f-sf sec-index__label">{INDEX.label}</p>

          <ul className="sec-index__rows">
            {INDEX.rows.map((r) => (
              <li className="sec-index__row" data-index-row key={r.title}>
                <div className="sec-index__cells">
                  <p className="fn-b1 sec-index__title">{r.title}</p>
                  <p className="fn-b1 sec-index__stack">{r.stack}</p>
                  <p className="fn-b1 sec-index__detail">{r.detail}</p>
                  <svg
                    aria-hidden="true"
                    className="sec-index__arrow"
                    fill="none"
                    viewBox="0 0 10 10"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M1 9L9 1M9 1H2M9 1V8" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </div>
                <span aria-hidden="true" className="sec-index__rule" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
