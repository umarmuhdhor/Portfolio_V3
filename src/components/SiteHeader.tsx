/**
 * Fixed header — brand left, nav right, plus the running counter.
 *
 * mix-blend-mode: difference is what lets a white header sit over both light
 * and dark sections without a colour swap, which is why the transition covers
 * mix-blend-mode as well as transform.
 */
import './site-header.css';

const NAV = [
  { label: 'Index', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function SiteHeader({ counter = '01' }: { counter?: string }) {
  return (
    <header className="site-header t-header" data-role="header">
      <div className="ctr" data-role="container">
        <div className="site-header__row">
          <div className="site-header__brand">
            <span className="ln-mask">
              <span className="ln fn-b1 fn-meta" data-role="body-1">
                <span data-role="nav-counter">{counter}</span>
              </span>
            </span>
          </div>

          <nav aria-label="Primary">
            <ul className="site-header__nav">
              {NAV.map((item, i) => (
                <li key={item.href}>
                  <a className={`link fn-b1${i === 0 ? ' is--a' : ''}`} data-role="nav-link" href={item.href}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
