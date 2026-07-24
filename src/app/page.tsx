import SiteHeader from '@/components/SiteHeader';
import './page.css';

/**
 * The portfolio page. Phase 1 establishes the design-system shell — header,
 * container, grid, link behaviour — and the ten content sections land in
 * Phase 2.
 */
export default function Home() {
  return (
    <>
      <SiteHeader counter="01" />
      <main id="main">
        <section className="page-intro" data-role="section" id="index">
          <div className="ctr" data-role="container">
            <div className="grd" data-role="grid">
              <h1 className="fn-h2 page-intro__title" data-role="h2">
                Andi Muhammad Alief Fauzan
              </h1>
              <p className="fn-b1 page-intro__lead" data-role="body-1">
                Backend Developer &amp; Cloud Computing Specialist
              </p>
              <p className="fn-b2 page-intro__meta" data-role="body-2">
                <a className="link" data-role="link" href="/styleguide">
                  Design system
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
