#!/usr/bin/env node
/**
 * gate.mjs — decide whether a phase may advance.
 *
 * `compare.mjs` always runs every assertion and always reports honestly; it is
 * frozen and must stay that way. But the brief gates each phase on a *subset*:
 * Phase 1 is required to pass on root metrics, palette, type scale and easing,
 * and cannot possibly pass a stagger assertion because the project grid does
 * not exist until Phase 3.
 *
 * So the scoping lives here, outside the frozen set, and it works by reading
 * `ab-report/compare.json` rather than by changing what gets measured. Nothing
 * is skipped or weakened — the full report is still produced and quoted. By
 * Phase 6 the scope is everything, so the final gate is the plain exit code of
 * compare.mjs.
 *
 * The scope table below is written once, from the brief, and is not adjusted to
 * fit whatever happens to be failing.
 *
 *   node scripts/gate.mjs --phase 1
 */

import fs from 'node:fs';

/** Assertion groups that must be green for each phase, cumulative. */
const SCOPE = {
  // Phase 1 — design system: "A/B must pass on root metrics, palette, type
  // scale, easing."
  1: ['root', 'breakpoint', 'grid', 'palette', 'type', 'motion', 'tokens', 'font-role'],
  // Phase 2 — static page: "A/B must pass on geometry and per-role computed
  // styles."
  2: ['root', 'breakpoint', 'grid', 'palette', 'type', 'motion', 'tokens', 'font-role', 'geometry', 'role-style'],
  // Phase 3 — project grid: "A/B must pass on grid assertions at zero
  // tolerance."
  3: ['root', 'breakpoint', 'grid', 'palette', 'type', 'motion', 'tokens', 'font-role', 'geometry', 'role-style', 'stagger'],
  4: null, // null = every group
  5: null,
  6: null,
};

const phaseArg = process.argv.indexOf('--phase');
const phase = phaseArg === -1 ? 6 : Number(process.argv[phaseArg + 1]);
const file = 'ab-report/compare.json';

if (!fs.existsSync(file)) {
  console.error(`gate: ${file} not found — run \`npm run ab\` first.`);
  process.exit(2);
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
const scope = SCOPE[phase] ?? null;
const inScope = (r) => scope === null || scope.includes(r.group);

const scoped = data.results.filter(inScope);
const outOfScope = data.results.filter((r) => !inScope(r));
const failures = scoped.filter((r) => !r.ok);
const zeroScoped = scoped.filter((r) => r.tier === 'zero');

console.log('');
console.log(`GATE — Phase ${phase}`);
console.log(`  scope       : ${scope === null ? 'every assertion group' : scope.join(', ')}`);
console.log(`  in scope    : ${scoped.length - failures.length}/${scoped.length} PASS  (zero-tolerance ${zeroScoped.filter((r) => r.ok).length}/${zeroScoped.length})`);

if (outOfScope.length) {
  const deferred = [...new Set(outOfScope.map((r) => r.group))];
  const deferredFails = outOfScope.filter((r) => !r.ok).length;
  console.log(`  deferred    : ${outOfScope.length} assertion(s) in [${deferred.join(', ')}] — ${deferredFails} currently failing, due by their own phase`);
}

if (failures.length) {
  console.log('');
  console.log('  BLOCKING:');
  for (const f of failures) {
    console.log(`    ${f.group}/${f.name}${f.viewport ? ` @${f.viewport}` : ''}`);
    console.log(`      expected ${f.expected}`);
    console.log(`      actual   ${f.actual}`);
  }
}

console.log('');
console.log(`  RESULT      ${failures.length === 0 ? 'GREEN' : 'RED'}`);
console.log('');

process.exit(failures.length === 0 ? 0 : 1);
