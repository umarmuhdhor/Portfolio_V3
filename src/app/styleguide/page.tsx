import Link from 'next/link';
import './styleguide.css';

/**
 * /styleguide — the design system rendered as evidence.
 *
 * Every value shown here is read from the same CSS the portfolio uses, so this
 * route is also a usable fingerprint target: if a type size or a colour shows
 * up here that is not on the reference scale, the A/B harness fails on it.
 */

const TYPE_SCALE = [
  { role: 'h1', cls: 'fn-h1', px: 400, mobile: 200, family: 'serif' },
  { role: 'h2', cls: 'fn-h2', px: 175, mobile: 40, family: 'serif' },
  { role: 'h3', cls: 'fn-h3', px: 118, mobile: 36, family: 'serif' },
  { role: 'h4', cls: 'fn-h4', px: 80, mobile: 30, family: 'serif' },
  { role: 'h5', cls: 'fn-h5', px: 40, mobile: 26, family: 'serif' },
  { role: 'body-1', cls: 'fn-b1', px: 16, mobile: 14, family: 'sans' },
  { role: 'body-2', cls: 'fn-b2', px: 14, mobile: 12, family: 'sans' },
  { role: 'btn', cls: 'fn-btn', px: 14, mobile: 14, family: 'sans' },
  { role: 'meta', cls: 'fn-meta', px: 19, mobile: 12, family: 'sans' },
  { role: 'note', cls: 'fn-note', px: 9, mobile: 9, family: 'sans' },
] as const;

const PALETTE = [
  { hex: '#000', use: 'text, inverted backgrounds' },
  { hex: '#fff', use: 'page background' },
  { hex: '#e2e2e2', use: 'hairline borders' },
  { hex: '#eee', use: 'outline on empty project frames' },
  { hex: '#f0f0f0', use: 'subtle fills' },
  { hex: '#f8f8f8', use: 'subtle fills, lighter' },
  { hex: '#ccc', use: 'rules, dividers' },
  { hex: '#6e6e6e', use: 'muted / secondary text' },
] as const;

const MOTION = [
  { d: '0.3s', use: 'colour, opacity' },
  { d: '0.4s', use: 'scrollbar thumb width + opacity, the one non-custom ease' },
  { d: '0.5s', use: 'transform' },
  { d: '0.6s', use: 'caption roll, header' },
  { d: '1.109s', use: 'image scale on hover, link underline' },
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="sg__section" data-role="section">
      <p className="sg__label fn-b2" data-role="body-2">
        {title}
      </p>
      {children}
    </section>
  );
}

export default function Styleguide() {
  return (
    <main className="sg" id="main">
      <div className="ctr" data-role="container">
        <h1 className="fn-h4" data-role="h4">
          Design system
        </h1>

        <Section title="Type scale: design px equals rem">
          {TYPE_SCALE.map((t) => (
            <div className="sg__row" key={t.role}>
              <span className="sg__row-key fn-b2">
                {t.px}rem · {t.mobile}rem · {t.family}
              </span>
              <span className={`sg__row-value ${t.cls}`} data-role={t.role === 'meta' || t.role === 'note' ? undefined : t.role}>
                Umar Muhdhor
              </span>
            </div>
          ))}
        </Section>

        <Section title="Palette: monochrome, no accent colour exists">
          <div className="sg__swatches">
            {PALETTE.map((c) => (
              <div className="sg__swatch" key={c.hex}>
                <div className="sg__chip" style={{ backgroundColor: c.hex }} />
                <p className="sg__chip-label fn-b2">
                  {c.hex} · {c.use}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Grid: 15 columns, 20rem gap, one breakpoint at 767.98px">
          <div className="sg__overlay">
            <div className="grd sg__overlay-grid" data-role="grid">
              {Array.from({ length: 15 }, (_, i) => (
                <div className="sg__overlay-col" key={i} />
              ))}
            </div>
          </div>
        </Section>

        <Section title="Motion: one curve, five durations, zero keyframes">
          <div className="sg__row">
            <span className="sg__row-key fn-b2">curve</span>
            <span className="sg__row-value fn-b1" data-role="body-1">
              cubic-bezier(0.17, 0.84, 0.44, 1)
            </span>
          </div>
          {MOTION.map((m) => (
            <div className="sg__row" key={m.d}>
              <span className="sg__row-key fn-b2">{m.d}</span>
              <span className="sg__row-value fn-b1">{m.use}</span>
            </div>
          ))}
        </Section>

        <Section title="Link underline: scaled ::before, active route inverts">
          <div className="sg__links">
            <Link className="link fn-b1" data-role="link" href="/styleguide">
              Default: wipes in on hover
            </Link>
            <Link className="link fn-b1 is--a" href="/styleguide">
              Active: rests underlined, collapses on hover
            </Link>
            <button className="btn fn-btn" data-role="btn" type="button">
              Button
            </button>
          </div>
        </Section>

        <Section title="Spacing tokens">
          <div className="art sg__stack">
            <p className="fn-b1">
              --space-general: 2em · --space-heading: 1em · --off: 0.5em
            </p>
          </div>
        </Section>
      </div>
    </main>
  );
}
