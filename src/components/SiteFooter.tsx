import { FOOTER } from '@/lib/dummy';

/** The footer, shared by every route. */
export default function SiteFooter() {
  return (
    <footer className="footer" data-role="footer" id="contact">
      <div className="ctr" data-role="container">
        <div className="grd" data-role="grid">
          <a className="fn-b1 footer__brand" data-role="footer-link" href="/">
            {FOOTER.brand}
          </a>

          <div className="footer__links">
            {FOOTER.columns.map((c) => (
              <div key={c.heading}>
                <p className="fn-b2 footer__col-heading">{c.heading}</p>
                <ul>
                  {c.links.map((l) => (
                    <li key={l.label}>
                      <a className="link fn-b1" data-role="footer-link" href={l.href}>
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="footer__col footer__col--a">
            <p className="fn-b2 footer__col-heading">Address</p>
            <ul>
              {FOOTER.address.map((a) => (
                <li className="fn-b1" key={a}>
                  {a}
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col footer__col--b">
            <p className="fn-b2 footer__col-heading">Timezone</p>
            <ul>
              {FOOTER.hours.map((h) => (
                <li className="fn-b1" key={h}>
                  {h}
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__meta">
            <div className="footer__meta-row">
              {FOOTER.meta.map((m) => (
                <span className="fn-b2" key={m}>
                  {m}
                </span>
              ))}
              <a className="link fn-b2" href="/legal">
                Legal
              </a>
            </div>
          </div>
        </div>

        {/* The closing wordmark. The reference ends its footer with a
            full-bleed 1860x556 SVG of its initials — a graphic, not a link,
            which is why the small brand link above it stays where it is.
            Ours is set in the page's own serif rather than traced into
            paths, so it stays inside the type system instead of becoming a
            second asset to keep in step. Letters spread edge to edge, which
            fills the measure whatever the font metrics turn out to be.
            aria-hidden: the accessible name is already on the link above. */}
        <div aria-hidden="true" className="footer__mark">
          {FOOTER.brand.split('').map((ch, i) => (
            <span key={`${ch}-${i}`}>{ch}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}
