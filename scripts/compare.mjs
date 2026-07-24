#!/usr/bin/env node
/**
 * compare.mjs — diff two fingerprints and decide PASS / FAIL.
 *
 *   node scripts/compare.mjs [reference.fingerprint.json] [build.fingerprint.json]
 *
 * This file is the scoring function for the whole build, which makes it the
 * obvious thing to cheat. Two structural defences, both deliberate:
 *
 *  1. It is frozen after Phase 0. Editing it during Phases 1-6 is a stop
 *     condition, and it is committed at the end of Phase 0 so any edit shows
 *     up in the diff.
 *  2. Every exclusion is declared here, once, with a reason. There is no
 *     mechanism for a later phase to widen a tolerance or skip an assertion,
 *     because the tolerances are constants and the assertion list is not
 *     data-driven from the build side.
 *
 * Directionality matters and is not symmetric. For value *sets* (palette, type
 * scale, durations) the assertion is `build ⊆ reference` plus `core ⊆ build`.
 * Set equality would be the wrong test: the reference has components our
 * content has no equivalent of, and forcing their colours in would mean
 * inventing elements purely to satisfy the harness — Goodhart, exactly.
 */

import fs from 'node:fs';
import { BRIEF, ROLES, TOLERANCE, VIEWPORTS } from './roles.mjs';
import { nthMatches, resolveStagger, toHex } from './css-util.mjs';

const refFile = process.argv[2] ?? 'reference.fingerprint.json';
const buildFile = process.argv[3] ?? 'build.fingerprint.json';

if (!fs.existsSync(buildFile)) {
  console.error(`\ncompare: no build fingerprint at ${buildFile}`);
  console.error('Run `npm run fingerprint:build` first (the dev/preview server must be up).\n');
  process.exit(2);
}

const ref = JSON.parse(fs.readFileSync(refFile, 'utf8'));
const build = JSON.parse(fs.readFileSync(buildFile, 'utf8'));

// ---------------------------------------------------------------------------
// Frozen exclusions. Each one names a component and says why it is not part of
// the design system. Nothing may be added here after Phase 0.
// ---------------------------------------------------------------------------
const EXCLUDE = {
  colors: [
    { value: 'rgba(255, 0, 0, 0.15)', why: 'dev grid-overlay component (.enz), renders only behind a debug flag' },
  ],
  gridTemplates: [
    { value: 'repeat(var(--v1327d0d4),1fr)', why: 'the same dev grid overlay — column count is a runtime variable' },
  ],
  // px font-sizes belong to the Nuxt error route and the dev overlay. The
  // design system is authored entirely in rem; see the brief, Part 1.
  ignorePxFontSizes: true,
};

// ---------------------------------------------------------------------------
const results = [];
let idCounter = 0;
function assert({ tier, group, name, expected, actual, ok, viewport }) {
  results.push({ id: ++idCounter, tier, group, name, expected: String(expected), actual: String(actual), ok: !!ok, viewport });
}
const report = [];
function observe(group, name, detail, viewport) {
  report.push({ group, name, detail: String(detail), viewport });
}

const norm = (s) => String(s).replace(/\s+/g, ' ').trim();
const compact = (s) => String(s).replace(/\s+/g, '');

/**
 * Compare a timing function by value, not by spelling.
 *
 * A minifier writes `cubic-bezier(.17,.84,.44,1)` where the source said
 * `cubic-bezier(0.17, 0.84, 0.44, 1)`, and custom property values are stored
 * verbatim rather than normalized by the engine — so the two sides can hold
 * the identical curve and disagree on four leading zeros. The `easing curve is
 * declared` check already allowed both spellings; this makes the companion
 * `no timing function outside the reference set` check agree with it instead of
 * failing a curve the previous assertion just accepted.
 */
const normTiming = (s) =>
  compact(s)
    .toLowerCase()
    .replace(/(^|[(,])\./g, '$10.')
    .replace(/(\d)0+(?=[,)]|$)/g, (m, d) => (/\./.test(m) ? d : m));


// ===========================================================================
// ZERO TOLERANCE — any delta fails
// ===========================================================================
const rDesk = ref.viewports['1920x1080'];
const bDesk = build.viewports['1920x1080'];
const rMob = ref.viewports['375x812'];
const bMob = build.viewports['375x812'];

// --- root font-size formula ------------------------------------------------
const near = (a, b, eps = 1e-6) => Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < eps;
for (const [label, rv, bv, want] of [
  ['desktop', rDesk, bDesk, parseFloat(BRIEF.rootFontSizeDesktop)],
  ['mobile', rMob, bMob, parseFloat(BRIEF.rootFontSizeMobile)],
]) {
  const rHas = rv.css.rootFontSize.map(parseFloat).some((v) => near(v, want, 1e-6));
  const bHas = bv.css.rootFontSize.map(parseFloat).some((v) => near(v, want, 1e-6));
  assert({
    tier: 'zero',
    group: 'root',
    name: `root font-size formula (${label})`,
    expected: `${want}vw  [ref: ${rHas ? 'present' : 'MISSING'}]`,
    actual: bv.css.rootFontSize.join(' | ') || 'none',
    ok: rHas && bHas,
  });
}

// 1rem must resolve to one design pixel at every viewport
for (const vp of VIEWPORTS) {
  const r = ref.viewports[vp.name].root.fontSizePx;
  const b = build.viewports[vp.name].root.fontSizePx;
  assert({
    tier: 'zero',
    group: 'root',
    name: `1rem resolves to ${r}px`,
    expected: `${r}px`,
    actual: `${b}px`,
    ok: near(r, b, 1e-3),
    viewport: vp.name,
  });
}

// --- breakpoint ------------------------------------------------------------
const rBp = new Set(Object.keys(rDesk.css.breakpoints).map(compact));
const bBp = new Set(Object.keys(bDesk.css.breakpoints).map(compact));
for (const want of ['(max-width:767.98px)', '(min-width:767.99px)']) {
  assert({ tier: 'zero', group: 'breakpoint', name: `${want} declared`, expected: want, actual: bBp.has(want) ? 'present' : 'absent', ok: bBp.has(want) });
}
const strayBp = [...bBp].filter((k) => !rBp.has(k));
assert({
  tier: 'zero',
  group: 'breakpoint',
  name: 'no breakpoint outside the reference set',
  expected: 'none',
  actual: strayBp.join(', ') || 'none',
  ok: strayBp.length === 0,
});

// --- grid-template-columns -------------------------------------------------
const gtcExcluded = new Set(EXCLUDE.gridTemplates.map((e) => compact(e.value)));
const bGtc = Object.keys(bDesk.css.gridTemplateColumns).map(norm);
assert({
  tier: 'zero',
  group: 'grid',
  name: 'grid-template-columns: repeat(15, 1fr)',
  expected: 'repeat(15, 1fr)',
  actual: bGtc.join(' | ') || 'none',
  ok: bGtc.some((g) => /repeat\(\s*15\s*,\s*1fr\s*\)/.test(g)),
});
const rGtc = new Set(Object.keys(rDesk.css.gridTemplateColumns).map(compact));
const strayGtc = bGtc.map(compact).filter((g) => !rGtc.has(g) && !gtcExcluded.has(g));
if (strayGtc.length) observe('grid', 'grid templates not present on the reference', strayGtc.join(' | '));

// --- palette ---------------------------------------------------------------
const excludedColors = new Set(EXCLUDE.colors.map((c) => toHex(c.value)));
const rPal = new Set(Object.keys(rDesk.css.palette).map(toHex).filter((c) => !excludedColors.has(c)));
const bPalRaw = new Set([...Object.keys(bDesk.css.palette), ...Object.keys(bMob.css.palette)].map(toHex));
const bPal = new Set([...bPalRaw].filter((c) => !excludedColors.has(c)));

for (const c of BRIEF.palette) {
  assert({ tier: 'zero', group: 'palette', name: `core colour ${c} present`, expected: c, actual: bPal.has(toHex(c)) ? 'present' : 'absent', ok: bPal.has(toHex(c)) });
}
const invented = [...bPal].filter((c) => !rPal.has(c));
assert({
  tier: 'zero',
  group: 'palette',
  name: 'no colour outside the reference palette',
  expected: 'none invented',
  actual: invented.join(', ') || 'none',
  ok: invented.length === 0,
});
const unusedRefColors = [...rPal].filter((c) => !bPal.has(c));
if (unusedRefColors.length) observe('palette', 'reference colours our content has no component for', unusedRefColors.join(', '));

// --- type scale ------------------------------------------------------------
const rType = new Set(Object.keys(rDesk.css.fontSizesRem).map(Number));
const bType = new Set([...Object.keys(bDesk.css.fontSizesRem), ...Object.keys(bMob.css.fontSizesRem)].map(Number));
const invalidType = [...bType].filter((t) => !rType.has(t)).sort((a, b) => a - b);
assert({
  tier: 'zero',
  group: 'type',
  name: 'every rem font-size is on the reference type scale',
  expected: [...rType].sort((a, b) => a - b).join(' '),
  actual: invalidType.length ? `off-scale: ${invalidType.join(' ')}` : 'all on scale',
  ok: invalidType.length === 0,
});
if (!EXCLUDE.ignorePxFontSizes) {
  const bPx = Object.keys(bDesk.css.fontSizesPx);
  assert({ tier: 'zero', group: 'type', name: 'no px font-sizes', expected: 'none', actual: bPx.join(' ') || 'none', ok: bPx.length === 0 });
}
const unusedType = [...rType].filter((t) => !bType.has(t)).sort((a, b) => a - b);
if (unusedType.length) observe('type', 'reference sizes not exercised by our content', unusedType.join(' '));

// --- easing + durations ----------------------------------------------------
const rTim = new Set(Object.keys(rDesk.css.timings).map(normTiming));
const bTim = new Set(Object.keys(bDesk.css.timings).map(normTiming));
const easeHit = [...bTim].some((t) => t === normTiming(BRIEF.ease) || t === normTiming(BRIEF.easeCompact));
assert({ tier: 'zero', group: 'motion', name: 'the easing curve is declared', expected: BRIEF.ease, actual: [...bTim].join(' | ') || 'none', ok: easeHit });
const strayTim = [...bTim].filter((t) => !rTim.has(t));
assert({ tier: 'zero', group: 'motion', name: 'no timing function outside the reference set', expected: 'none', actual: strayTim.join(', ') || 'none', ok: strayTim.length === 0 });

const rDur = new Set(Object.keys(rDesk.css.durations).map(Number));
const bDur = new Set(Object.keys(bDesk.css.durations).map(Number));
for (const d of BRIEF.durations) {
  assert({ tier: 'zero', group: 'motion', name: `duration ${d}s declared`, expected: `${d}s`, actual: bDur.has(d) ? 'present' : 'absent', ok: bDur.has(d) });
}
const strayDur = [...bDur].filter((d) => !rDur.has(d)).sort((a, b) => a - b);
assert({ tier: 'zero', group: 'motion', name: 'no duration outside the reference set', expected: 'none', actual: strayDur.map((d) => d + 's').join(', ') || 'none', ok: strayDur.length === 0 });

assert({ tier: 'zero', group: 'motion', name: '@keyframes count', expected: `${rDesk.css.keyframes}`, actual: `${bDesk.css.keyframes}`, ok: bDesk.css.keyframes === rDesk.css.keyframes });

// --- spacing tokens --------------------------------------------------------
for (const [k, v] of Object.entries(BRIEF.spacingTokens)) {
  const got = bDesk.css.customProps[k];
  const ok = got != null && parseFloat(got) === parseFloat(v) && /em$/.test(got);
  assert({ tier: 'zero', group: 'tokens', name: `${k}: ${v}`, expected: v, actual: got ?? 'absent', ok });
}

// --- project stagger — the centrepiece ------------------------------------
const rStagger = resolveStagger(rDesk.css.stagger, ['.qct'], 540);
const bStagger = resolveStagger(bDesk.css.stagger, ['[data-role="work-card"]', '.card'], 540);
const haveBuildStagger = bDesk.css.stagger.length > 0;

for (let i = 0; i < 10; i++) {
  const r = rStagger[i];
  const b = bStagger[i];
  const ok = haveBuildStagger && b.column === r.column && b.marginTop === r.marginTop && b.frameHeight === r.frameHeight;
  assert({
    tier: 'zero',
    group: 'stagger',
    name: `card ${r.i}: grid-column / margin-top / frame height`,
    expected: `${r.column} · ${r.marginTop}rem · ${r.frameHeight}rem`,
    actual: haveBuildStagger ? `${b.column} · ${b.marginTop}rem · ${b.frameHeight}rem` : 'no staggered rules found',
    ok,
  });
}

// resolved, per rendered card — catches a stagger that is authored right but
// overridden by something else in the cascade
const rCards = rDesk.geometry['work-card'] ?? [];
const bCards = bDesk.geometry['work-card'] ?? [];
const nCards = Math.min(rCards.length, bCards.length);
if (rCards.length !== bCards.length) {
  observe('stagger', 'card count differs (content-driven, expected)', `ref ${rCards.length} · build ${bCards.length}`);
}
for (let i = 0; i < nCards; i++) {
  const r = rCards[i];
  const b = bCards[i];
  assert({
    tier: 'zero',
    group: 'stagger',
    name: `resolved card ${i + 1} grid-column`,
    expected: `${r.gridColumnStart} / ${r.gridColumnEnd}`,
    actual: `${b.gridColumnStart} / ${b.gridColumnEnd}`,
    ok: r.gridColumnStart === b.gridColumnStart && r.gridColumnEnd === b.gridColumnEnd,
  });
  assert({
    tier: 'zero',
    group: 'stagger',
    name: `resolved card ${i + 1} margin-top (rem)`,
    expected: `${r.marginTopRem}rem`,
    actual: `${b.marginTopRem}rem`,
    ok: near(r.marginTopRem, b.marginTopRem, 0.51),
  });
}

// --- per-role type role (sans vs serif) ------------------------------------
for (const role of ROLES) {
  if (!role.family) continue;
  const b = bDesk.styles[role.id];
  if (!b) continue;
  assert({
    tier: 'zero',
    group: 'font-role',
    name: `${role.id} uses the ${role.family}`,
    expected: role.family,
    actual: b.__familyRole,
    ok: b.__familyRole === role.family,
  });
}

// ===========================================================================
// TOLERANCE BANDS — geometry, normalized to viewport width
// ===========================================================================
// x and width are grid-derived and content-independent, so they are asserted.
// y is a function of everything above it on the page and our content differs by
// design, so it is reported and never failed.
for (const vp of VIEWPORTS) {
  const r = ref.viewports[vp.name];
  const b = build.viewports[vp.name];
  for (const role of ROLES) {
    if (role.geometry === false) continue;
    const rg = r.geometry[role.id];
    const bg = b.geometry[role.id];
    if (!rg?.length || !bg?.length) continue;
    const band = role.text ? TOLERANCE.text : TOLERANCE.geometry;
    const n = Math.min(rg.length, bg.length);
    for (let i = 0; i < n; i++) {
      for (const axis of ['x', 'w']) {
        const d = Math.abs(rg[i][axis] - bg[i][axis]);
        assert({
          tier: role.text ? 'text' : 'geometry',
          group: 'geometry',
          name: `${role.id}[${i}].${axis}`,
          expected: `${rg[i][axis].toFixed(4)} ±${(band * 100).toFixed(1)}%`,
          actual: `${bg[i][axis].toFixed(4)} (Δ${(d * 100).toFixed(2)}%)`,
          ok: d <= band,
          viewport: vp.name,
        });
      }
      if (Math.abs(rg[i].y - bg[i].y) > band) {
        observe('geometry', `${role.id}[${i}].y differs (content-driven)`, `ref ${rg[i].y.toFixed(3)} · build ${bg[i].y.toFixed(3)}`, vp.name);
      }
    }
  }

  // frame heights are authored in rem and must be exact
  const rf = r.geometry['work-frame'] ?? [];
  const bf = b.geometry['work-frame'] ?? [];
  for (let i = 0; i < Math.min(rf.length, bf.length); i++) {
    assert({
      tier: 'zero',
      group: 'geometry',
      name: `work-frame[${i}] height (rem)`,
      expected: `${rf[i].heightRem}rem`,
      actual: `${bf[i].heightRem}rem`,
      ok: near(rf[i].heightRem, bf[i].heightRem, 0.51),
      viewport: vp.name,
    });
  }
}

// ===========================================================================
// REPORT ONLY — expected to differ
// ===========================================================================
for (const role of ROLES) {
  const r = rDesk.styles[role.id];
  const b = bDesk.styles[role.id];
  if (!r || !b) {
    if (!b) observe('roles', `${role.id} not present in build`, `ref has ${r ? r.__instanceCount : 0} instance(s)`);
    else if (!r) observe('roles', `${role.id} not present on the reference homepage`, `build has ${b.__instanceCount}`);
    continue;
  }
  if (r['font-family'] !== b['font-family']) {
    observe('roles', `${role.id} font-family string differs (expected — Switzer substitution)`, `ref "${r['font-family']}" · build "${b['font-family']}"`);
  }
  if (r.__instanceCount !== b.__instanceCount) {
    observe('roles', `${role.id} instance count differs (content-driven)`, `ref ${r.__instanceCount} · build ${b.__instanceCount}`);
  }
  for (const p of ['font-size', 'line-height', 'letter-spacing', 'color', 'background-color', 'text-align', 'display', 'overflow', 'position']) {
    if (norm(r[p]) !== norm(b[p])) {
      assert({
        tier: 'text',
        group: 'role-style',
        name: `${role.id} ${p}`,
        expected: r[p] || '(unset)',
        actual: b[p] || '(unset)',
        ok: false,
      });
    }
  }
}

if (ref.mode !== 'render-headed' && ref.mode !== 'render-headless' && ref.mode !== 'render-swiftshader') {
  observe('harness', 'reference captured via the static fallback', `mode=${ref.mode} — geometry assertions are unavailable in this mode`);
}

// ===========================================================================
// output
// ===========================================================================
const tiers = ['zero', 'geometry', 'text'];
const tierLabel = { zero: 'ZERO TOLERANCE', geometry: `GEOMETRY ±${TOLERANCE.geometry * 100}%`, text: `TEXT-BOUNDED ±${TOLERANCE.text * 100}%` };

const pad = (s, n) => (String(s).length > n ? String(s).slice(0, n - 1) + '…' : String(s).padEnd(n));

console.log('');
console.log('A/B REPORT');
console.log(`  reference : ${ref.url}  (${ref.mode}, ${ref.capturedAt})`);
console.log(`  build     : ${build.url}  (${build.mode}, ${build.capturedAt})`);
console.log('');

for (const tier of tiers) {
  const rows = results.filter((r) => r.tier === tier);
  if (!rows.length) continue;
  const fails = rows.filter((r) => !r.ok);
  console.log(`${tierLabel[tier]} — ${rows.length - fails.length}/${rows.length} PASS`);
  // passing rows are summarized per group; failures are always shown in full
  const groups = [...new Set(rows.map((r) => r.group))];
  for (const g of groups) {
    const gr = rows.filter((r) => r.group === g);
    const gf = gr.filter((r) => !r.ok);
    console.log(`  ${pad(g, 12)} ${gr.length - gf.length}/${gr.length}${gf.length ? '  ← see failures' : ''}`);
  }
  for (const f of fails) {
    console.log(`  FAIL  ${f.group}/${f.name}${f.viewport ? ` @${f.viewport}` : ''}`);
    console.log(`        expected : ${f.expected}`);
    console.log(`        actual   : ${f.actual}`);
  }
  console.log('');
}

if (report.length) {
  console.log('REPORTED, NOT FAILED (expected to differ)');
  const shown = report.slice(0, 40);
  for (const o of shown) console.log(`  · ${o.group}/${o.name}${o.viewport ? ` @${o.viewport}` : ''}: ${o.detail}`);
  if (report.length > shown.length) console.log(`  … and ${report.length - shown.length} more (see ab-report/compare.json)`);
  console.log('');
}

const pass = results.filter((r) => r.ok).length;
const total = results.length;
const zero = results.filter((r) => r.tier === 'zero');
const zeroPass = zero.filter((r) => r.ok).length;

console.log(`TOTAL       ${pass} PASS, ${total - pass} FAIL  (of ${total})`);
console.log(`ZERO-TOL    ${zeroPass}/${zero.length}`);
console.log(`RESULT      ${pass === total ? 'GREEN' : 'RED'}`);
console.log('');

fs.mkdirSync('ab-report', { recursive: true });
fs.writeFileSync(
  'ab-report/compare.json',
  JSON.stringify({ pass, total, zeroPass, zeroTotal: zero.length, results, reported: report, exclusions: EXCLUDE }, null, 2)
);

process.exit(pass === total ? 0 : 1);
