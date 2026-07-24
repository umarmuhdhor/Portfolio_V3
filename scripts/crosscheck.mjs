#!/usr/bin/env node
/**
 * crosscheck.mjs — Phase 0 only.
 *
 * The A/B harness cannot validate its own baseline: if the reference
 * fingerprint is wrong, every later phase is measured against a wrong number
 * and the harness will happily confirm its own error. So before anything is
 * built, the captured fingerprint is scored against the ~40 values that were
 * measured by hand and written into Part 1 of the brief.
 *
 *   ≥90% match → baseline trustworthy, proceed
 *   <90%       → stop; either the site changed or the harness misreads
 *
 * Where the two disagree the *measurement* wins — this script reports what the
 * capture actually found, it does not adjust the capture to fit the brief.
 *
 *   node scripts/crosscheck.mjs [reference.fingerprint.json]
 */

import fs from 'node:fs';
import { BRIEF } from './roles.mjs';
import { nthMatches, resolveStagger, toHex } from './css-util.mjs';

const file = process.argv[2] ?? 'reference.fingerprint.json';
const fp = JSON.parse(fs.readFileSync(file, 'utf8'));

const desktop = fp.viewports['1920x1080'];
const mobile = fp.viewports['375x812'];
const css = desktop.css;

const results = [];
const note = [];
const check = (group, name, expected, actual, ok) =>
  results.push({ group, name, expected: String(expected), actual: String(actual), ok: !!ok });

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
const norm = (s) => String(s).replace(/\s+/g, ' ').trim();



// ---------------------------------------------------------------------------
// 1. root font-size formula  (2 checks)
// ---------------------------------------------------------------------------
// The capture reads back through CSSOM, which rounds the authored literal
// (0.0520833333vw → 0.0520833vw). Compare numerically at the precision CSSOM
// preserves rather than as strings.
const declaredRoot = css.rootFontSize.map((v) => parseFloat(v));
const wantDesktop = parseFloat(BRIEF.rootFontSizeDesktop);
const wantMobile = parseFloat(BRIEF.rootFontSizeMobile);
const near = (a, b) => Number.isFinite(a) && Math.abs(a - b) < 1e-6;

check(
  'root',
  'root font-size (desktop) = 0.0520833333vw',
  BRIEF.rootFontSizeDesktop,
  css.rootFontSize.find((v) => near(parseFloat(v), wantDesktop)) ?? css.rootFontSize.join(' | '),
  declaredRoot.some((v) => near(v, wantDesktop))
);
check(
  'root',
  'root font-size (mobile) = 0.2666666667vw',
  BRIEF.rootFontSizeMobile,
  css.rootFontSize.find((v) => near(parseFloat(v), wantMobile)) ?? css.rootFontSize.join(' | '),
  declaredRoot.some((v) => near(v, wantMobile))
);

// the derived consequence: 1rem === 1 design px at each tier
note.push({
  label: '1rem = 1 design px',
  detail: `1920 → ${desktop.root.fontSizePx}px, 1440 → ${fp.viewports['1440x900'].root.fontSizePx}px, 375 → ${mobile.root.fontSizePx}px`,
});

// ---------------------------------------------------------------------------
// 2. breakpoint  (2 checks)
// ---------------------------------------------------------------------------
const bpKeys = Object.keys(css.breakpoints);
check(
  'breakpoint',
  'max-width: 767.98px present',
  '(max-width:767.98px)',
  bpKeys.filter((k) => k.includes('max-width')).join(' ') || 'none',
  bpKeys.some((k) => k.replace(/\s/g, '') === '(max-width:767.98px)')
);
check(
  'breakpoint',
  'min-width: 767.99px present',
  '(min-width:767.99px)',
  bpKeys.filter((k) => k.includes('min-width')).join(' ') || 'none',
  bpKeys.some((k) => k.replace(/\s/g, '') === '(min-width:767.99px)')
);
const extraBp = bpKeys.filter((k) => !/767\.9[89]/.test(k));
if (extraBp.length) note.push({ label: 'extra breakpoints found', detail: extraBp.join(', ') });

// ---------------------------------------------------------------------------
// 3. 15-column grid  (1 check)
// ---------------------------------------------------------------------------
const gtc = Object.keys(css.gridTemplateColumns).map(norm);
check(
  'grid',
  'grid-template-columns: repeat(15, 1fr)',
  'repeat(15, 1fr)',
  gtc.find((g) => /repeat\(\s*15\s*,\s*1fr\s*\)/.test(g)) ?? gtc.join(' | '),
  gtc.some((g) => /repeat\(\s*15\s*,\s*1fr\s*\)/.test(g))
);
const otherGrids = gtc.filter((g) => !/repeat\(\s*15\s*,\s*1fr\s*\)/.test(g));
if (otherGrids.length) note.push({ label: 'other grid templates (sub-layouts)', detail: otherGrids.join(' | ') });

// ---------------------------------------------------------------------------
// 4. palette  (7 checks — one per brief colour)
// ---------------------------------------------------------------------------
const foundColors = new Set(Object.keys(css.palette).map(toHex));
for (const c of BRIEF.palette) {
  check('palette', `colour ${c} in use`, c, foundColors.has(toHex(c)) ? 'present' : 'absent', foundColors.has(toHex(c)));
}
const briefSet = new Set(BRIEF.palette.map(toHex));
const extraColors = [...foundColors].filter((c) => !briefSet.has(c));
if (extraColors.length) note.push({ label: 'colours found but NOT in brief', detail: extraColors.join(', ') });

// ---------------------------------------------------------------------------
// 5. type scale  (16 checks — one per brief value)
// ---------------------------------------------------------------------------
const remSizes = new Set(Object.keys(css.fontSizesRem).map(Number));
const pxSizes = new Set(Object.keys(css.fontSizesPx).map(Number));
for (const t of BRIEF.typeScale) {
  const inRem = remSizes.has(t);
  check('type', `type scale ${t}rem`, `${t}rem`, inRem ? 'present (rem)' : pxSizes.has(t) ? `only as ${t}px` : 'absent', inRem);
}
const extraSizes = [...remSizes].filter((s) => !BRIEF.typeScale.includes(s)).sort((a, b) => a - b);
if (extraSizes.length) note.push({ label: 'rem font-sizes found but NOT in brief', detail: extraSizes.map((s) => s + 'rem').join(', ') });
if (pxSizes.size) note.push({ label: 'px font-sizes (dev overlay / error route, not design system)', detail: [...pxSizes].sort((a, b) => a - b).map((s) => s + 'px').join(', ') });

// ---------------------------------------------------------------------------
// 6. easing curve  (1 check)
// ---------------------------------------------------------------------------
const timings = Object.keys(css.timings).map((t) => t.replace(/\s+/g, ''));
const easeWanted = BRIEF.ease.replace(/\s+/g, '');
const easeAlt = BRIEF.easeCompact.replace(/\s+/g, '');
const easeHit = timings.find((t) => t === easeWanted || t === easeAlt || t === easeWanted.replace(/0\./g, '.'));
check('motion', `easing curve ${BRIEF.ease}`, BRIEF.ease, easeHit ?? timings.join(' | '), !!easeHit);
const otherTimings = timings.filter((t) => t !== easeHit);
if (otherTimings.length) note.push({ label: 'other timing functions present', detail: otherTimings.join(', ') });

// ---------------------------------------------------------------------------
// 7. durations  (5 checks)
// ---------------------------------------------------------------------------
const durs = new Set(Object.keys(css.durations).map(Number));
for (const d of BRIEF.durations) {
  check('motion', `duration ${d}s`, `${d}s`, durs.has(d) ? 'present' : 'absent', durs.has(d));
}
const extraDurs = [...durs].filter((d) => !BRIEF.durations.includes(d)).sort((a, b) => a - b);
if (extraDurs.length) note.push({ label: 'durations found but NOT in brief', detail: extraDurs.map((d) => d + 's').join(', ') });

// ---------------------------------------------------------------------------
// 8. project stagger — 10 rows, each column/margin/height together
// ---------------------------------------------------------------------------
// Rules are read in source order and applied like the cascade would, so an
// override such as `10n+4 .piz { height: 540rem }` beats the earlier 700rem
// group rule for position 4.
const cardRules = css.stagger.filter((s) => s.component === '.frl .qct');
const BASE_FRAME_HEIGHT = 540; // from the non-nth rule `.frl .qct .piz { height: 540rem }`
const resolved = resolveStagger(cardRules, ['.qct'], BASE_FRAME_HEIGHT);
const resolve = (i) => resolved[i - 1];


for (const row of BRIEF.stagger) {
  const i = Number(row.nth.replace(/^\d*n\+?/, '')) || 10; // 10n → position 10
  const got = resolve(i);
  const ok = got.column === row.column && got.marginTop === row.marginTop && got.frameHeight === row.frameHeight;
  check(
    'stagger',
    `nth ${row.nth}`,
    `col ${row.column} · mt ${row.marginTop}rem · h ${row.frameHeight}rem`,
    `col ${got.column} · mt ${got.marginTop}rem · h ${got.frameHeight}rem`,
    ok
  );
}

// ---------------------------------------------------------------------------
// supplementary — reported, not scored
// ---------------------------------------------------------------------------
const supp = [];
const sp = (name, expected, actual) => supp.push({ name, expected, actual, ok: norm(expected) === norm(actual) });
for (const [k, v] of Object.entries(BRIEF.spacingTokens)) sp(`token ${k}`, v, css.customProps[k] ?? 'absent');
sp('@keyframes count', '0', String(css.keyframes));
sp('@font-face families', '2 (sans + serif), font-display: swap', `${css.fontFace.length} → ${css.fontFace.map((f) => `${f.family}/${f.display}`).join(', ')}`);
sp('hover: image scale', '1.035', /scale\(1\.035\)/.test(JSON.stringify(desktop.styles)) ? '1.035' : 'see build phase');

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------
const pass = results.filter((r) => r.ok).length;
const total = results.length;
const pct = (pass / total) * 100;

const W = [10, 42, 34, 34];
const pad = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s.padEnd(n));

console.log('');
console.log('PHASE 0 CROSS-CHECK — captured fingerprint vs Part 1 of the brief');
console.log(`source : ${fp.url}`);
console.log(`mode   : ${fp.mode}   captured ${fp.capturedAt}`);
console.log('');
console.log(pad('GROUP', W[0]) + pad('ASSERTION', W[1]) + pad('BRIEF SAYS', W[2]) + pad('CAPTURE FOUND', W[3]) + 'RESULT');
console.log('-'.repeat(W[0] + W[1] + W[2] + W[3] + 7));
for (const r of results) {
  console.log(pad(r.group, W[0]) + pad(r.name, W[1]) + pad(r.expected, W[2]) + pad(r.actual, W[3]) + (r.ok ? 'MATCH' : 'DIFF'));
}
console.log('');
console.log('SUPPLEMENTARY (reported, not scored)');
for (const s of supp) console.log(`  ${s.ok ? '·' : '!'} ${pad(s.name, 34)} brief=${pad(s.expected, 30)} found=${s.actual}`);

if (note.length) {
  console.log('');
  console.log('CAPTURE FOUND THINGS THE BRIEF DOES NOT LIST');
  for (const n of note) console.log(`  · ${n.label}: ${n.detail}`);
}

const byGroup = {};
for (const r of results) {
  byGroup[r.group] ??= { p: 0, t: 0 };
  byGroup[r.group].t++;
  if (r.ok) byGroup[r.group].p++;
}
console.log('');
console.log('PER GROUP');
for (const [g, v] of Object.entries(byGroup)) console.log(`  ${pad(g, 12)} ${v.p}/${v.t}`);

console.log('');
console.log(`TOTAL  ${pass}/${total}  =  ${pct.toFixed(1)}%   threshold 90%`);
const verdict = pct >= 90 ? 'BASELINE TRUSTWORTHY — proceed to Phase 1' : 'STOP — baseline not trustworthy';
console.log(`VERDICT: ${verdict}`);
console.log('');

fs.writeFileSync(
  'ab-report/crosscheck.json',
  JSON.stringify({ pass, total, pct, results, supplementary: supp, notes: note, mode: fp.mode }, null, 2)
);

process.exit(pct >= 90 ? 0 : 1);
