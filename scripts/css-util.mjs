/**
 * Shared pure helpers for the harness. Kept apart from the scripts so they can
 * be unit-tested directly — the cascade resolution in particular is the part
 * most likely to be subtly wrong, and a wrong stagger resolver would make the
 * A/B agree with itself while disagreeing with the reference.
 */

/** Normalize a CSS colour token to lowercase #rrggbb, keeping real alpha as-is. */
export function toHex(v) {
  const s = String(v).trim().toLowerCase();
  let m = /^#([0-9a-f]{3})$/.exec(s);
  if (m) return '#' + [...m[1]].map((c) => c + c).join('');
  if (/^#[0-9a-f]{6}$/.test(s)) return s;
  m = /^rgb\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)\s*\)$/.exec(s);
  if (m) return '#' + [1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, '0')).join('');
  m = /^rgba\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)[,\s]+([\d.]+)\s*\)$/.exec(s);
  if (m) return Number(m[4]) === 1 ? '#' + [1, 2, 3].map((i) => Number(m[i]).toString(16).padStart(2, '0')).join('') : s;
  return s;
}

/** Does an `an+b` nth-child expression select the 1-based position `i`? */
export function nthMatches(expr, i) {
  const e = String(expr).replace(/\s+/g, '');
  const m = /^([+-]?\d*)n([+-]\d+)?$/.exec(e);
  let a;
  let b;
  if (m) {
    a = m[1] === '' || m[1] === '+' ? 1 : m[1] === '-' ? -1 : Number(m[1]);
    b = m[2] ? Number(m[2]) : 0;
  } else if (/^\d+$/.test(e)) {
    a = 0;
    b = Number(e);
  } else {
    return false;
  }
  if (a === 0) return i === b;
  const k = (i - b) / a;
  return Number.isInteger(k) && k >= 0;
}

const norm = (s) => String(s).replace(/\s+/g, ' ').trim();

/** True when a stagger rule targets the image frame rather than the card. */
export function targetsFrame(target) {
  return /\.piz\b|work-frame|\bframe\b/.test(String(target));
}

/**
 * Resolve the 10-item staggered cycle from authored nth-child rules.
 *
 * Rules are applied in source order so that a later, more specific rule wins
 * the way the cascade would — `10n+4 .piz { height: 540rem }` has to beat the
 * earlier four-selector rule that sets 700rem, or position 4 comes out wrong.
 */
export function resolveStagger(staggerRules, componentSuffixes, baseFrameHeight = 540, cycle = 10) {
  const rules = staggerRules.filter((s) => componentSuffixes.some((c) => String(s.component).endsWith(c)));
  const out = [];
  for (let i = 1; i <= cycle; i++) {
    let column = null;
    let marginTop = 0;
    let frameHeight = baseFrameHeight;
    for (const r of rules) {
      if (!nthMatches(r.nth, i)) continue;
      const onFrame = targetsFrame(r.target);
      if (!onFrame && r.gridColumn) column = norm(r.gridColumn).replace(/\s*\/\s*/, ' / ');
      if (!onFrame && r.marginTop) marginTop = parseFloat(r.marginTop);
      if (onFrame && r.height) frameHeight = parseFloat(r.height);
    }
    out.push({ i, column, marginTop, frameHeight });
  }
  return out;
}
