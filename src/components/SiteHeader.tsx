/**
 * Fixed header — name left, nav right.
 *
 * The name links home, but a logo is easy to miss as a link, so the nav also
 * carries an explicit Home item. Colour comes from state rather than
 * mix-blend-mode: difference turns white type mid-grey over a mid-grey
 * photograph, which is most of the hero. HeaderOverHero keeps `is--over-hero`
 * on while the hero is under the bar; away from it the bar takes a frosted
 * backdrop so it reads over anything.
 */
import Link from 'next/link';
import { HEADER } from '@/lib/dummy';
import HeaderOverHero from './HeaderOverHero';
import LogoMark from './LogoMark';
import './site-header.css';

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export default function SiteHeader({ active = '/', overHero = false }: { active?: string | null; overHero?: boolean }) {
  return (
    <header className={`site-header t-header${overHero ? ' is--over-hero' : ''}`} data-role="header">
      <div className="ctr" data-role="container">
        <div className="site-header__row">
          <Link className="site-header__brand fn-b1" href="/">
            <LogoMark className="site-header__mark" />
            <span>{HEADER.name}</span>
          </Link>

          <nav aria-label="Primary">
            <ul className="site-header__nav">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    aria-current={item.href === active ? 'page' : undefined}
                    className={`link fn-b1${item.href === active ? ' is--a' : ''}`}
                    data-role="nav-link"
                    href={item.href}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      {overHero ? <HeaderOverHero /> : null}
    </header>
  );
}
