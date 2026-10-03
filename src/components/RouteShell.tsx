import ScrollMotion from '@/components/ScrollMotion';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import WebGLLayer from '@/components/WebGLLayer';

/**
 * The frame every route below `/` shares: motion, the WebGL layer, the fixed
 * header, the custom scrollbar and the footer. Keeping it in one place means a
 * new route cannot quietly ship without the scroll layer or the footer.
 */
export default function RouteShell({
  label,
  heading,
  nav = null,
  children,
}: {
  label: string;
  heading: string;
  /** The primary nav entry this route belongs under, if any. */
  nav?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <>
      <ScrollMotion />
      <WebGLLayer />
      <SiteHeader active={nav} />

      <div aria-hidden="true" className="scrollbar">
        <div className="scrollbar-track">
          <div className="scrollbar-thumb" />
        </div>
      </div>

      <main id="main">
        <div className="page" data-role="section">
          <section className="route-head" data-role="section">
            <div className="ctr" data-role="container">
              <div className="grd" data-role="grid">
                <p className="fn-b2 route-head__label">{label}</p>
                <h1 className="fn-h2 f-mn route-head__title" data-role="h2">
                  <span className="lh-open" data-split>
                    {heading}
                  </span>
                </h1>
              </div>
            </div>
          </section>

          {children}

          <SiteFooter />
        </div>
      </main>
    </>
  );
}
