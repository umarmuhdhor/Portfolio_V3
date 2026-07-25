import RouteShell from '@/components/RouteShell';
import { LEGAL } from '@/lib/dummy';
import '../page.css';
import '../work/work.css';

export const metadata = { title: 'Legal' };

/** /legal — the footer link resolves here rather than dead-ending. */
export default function Legal() {
  return (
    <RouteShell heading={LEGAL.heading} label={LEGAL.label}>
      <section className="sec" data-role="section">
        <div className="ctr" data-role="container">
          <div className="grd" data-role="grid">
            {LEGAL.blocks.map((b) => (
              <div className="legal__block" data-reveal key={b.title}>
                <h2 className="fn-h5">{b.title}</h2>
                <p className="fn-b1">{b.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </RouteShell>
  );
}
