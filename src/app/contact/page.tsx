import RouteShell from '@/components/RouteShell';
import { CONTACT, FOOTER } from '@/lib/dummy';
import '../page.css';
import '../work/work.css';

export const metadata = { title: 'Contact' };

/** /contact — how to reach the studio. */
export default function Contact() {
  return (
    <RouteShell heading={CONTACT.heading.join(' ')} label={CONTACT.label}>
      <section className="sec" data-role="section">
        <div className="ctr" data-role="container">
          <div className="grd" data-role="grid">
            <p className="fn-h5 detail__summary" data-split-words>
              {CONTACT.body}
            </p>

            <dl className="detail__facts" data-reveal>
              <div>
                <dt className="fn-b2">Email</dt>
                <dd>
                  <a className="link fn-b1" href={`mailto:${CONTACT.cta}`}>
                    {CONTACT.cta}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="fn-b2">Address</dt>
                <dd className="fn-b1">{FOOTER.address.join(', ')}</dd>
              </div>
              <div>
                <dt className="fn-b2">Timezone</dt>
                <dd className="fn-b1">{FOOTER.hours.join(', ')}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </RouteShell>
  );
}
