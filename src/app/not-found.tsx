import Link from 'next/link';
import RouteShell from '@/components/RouteShell';
import './page.css';
import './work/work.css';

export const metadata = { title: 'Page not found' };

export default function NotFound() {
  return (
    <RouteShell heading="Page not found" label="404">
      <section className="sec" data-role="section">
        <div className="ctr" data-role="container">
          <div className="grd" data-role="grid">
            <div className="not-found__body" data-reveal>
              <p className="fn-h5">This page moved, changed its name, or never existed.</p>
              <div className="not-found__actions">
                <Link className="link fn-b1 is--a" href="/work">
                  Browse selected work
                </Link>
                <Link className="link fn-b1" href="/">
                  Return home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </RouteShell>
  );
}
