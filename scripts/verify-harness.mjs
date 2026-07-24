#!/usr/bin/env node
/**
 * verify-harness.mjs — the tamper guard.
 *
 * The A/B harness is the scoring function for the whole build, and the same
 * agent writes both the CSS being scored and the scorer. The autorun addendum
 * states that the harness is frozen after Phase 0, but a stated rule is not a
 * control: nothing stops a later phase from widening a tolerance, adding an
 * exclusion, or editing the reference fingerprint to match whatever the build
 * happens to produce. Each of those turns a red gate green without touching a
 * single line of the CSS that was actually wrong.
 *
 * So the frozen files are hashed at the end of Phase 0 into harness.lock.json,
 * and this runs first in `npm run ab`. Any drift is a hard failure with a
 * non-zero exit, before a single assertion is evaluated.
 *
 * Changing a frozen file legitimately means: re-run with --relock, and say in
 * the phase report what changed and why. The lock file is committed, so the
 * relock shows up in the diff either way — which is the point.
 *
 *   node scripts/verify-harness.mjs [--relock]
 */

import fs from 'node:fs';
import crypto from 'node:crypto';

const LOCK = 'harness.lock.json';

/**
 * Everything a generator could touch to make a red gate go green without
 * fixing the build.
 */
const FROZEN = [
  { file: 'scripts/compare.mjs', why: 'the assertions and the exit code' },
  { file: 'scripts/crosscheck.mjs', why: 'the Phase 0 baseline validation' },
  { file: 'scripts/fingerprint.mjs', why: 'what gets measured at all' },
  { file: 'scripts/analyze-css.mjs', why: 'how authored CSS is read into value sets' },
  { file: 'scripts/css-util.mjs', why: 'the stagger cascade resolver' },
  { file: 'scripts/roles.mjs', why: 'the role map, the tolerance bands, and the brief ground truth' },
  { file: 'reference.fingerprint.json', why: 'the reconciliation anchor — external fact, not our output' },
];

const hash = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');

const relock = process.argv.includes('--relock');

if (relock) {
  const lock = {
    lockedAt: new Date().toISOString(),
    note: 'Frozen after Phase 0. See PORTFOLIO-V4-AUTORUN.md, harness tamper rule.',
    files: Object.fromEntries(FROZEN.map((f) => [f.file, { sha256: hash(f.file), why: f.why }])),
  };
  fs.writeFileSync(LOCK, JSON.stringify(lock, null, 2));
  console.log(`harness: locked ${FROZEN.length} files → ${LOCK}`);
  for (const f of FROZEN) console.log(`  ${lock.files[f.file].sha256.slice(0, 12)}  ${f.file}`);
  process.exit(0);
}

if (!fs.existsSync(LOCK)) {
  console.error(`\nharness: no ${LOCK}. Run \`node scripts/verify-harness.mjs --relock\` to freeze the harness (Phase 0 only).\n`);
  process.exit(2);
}

const lock = JSON.parse(fs.readFileSync(LOCK, 'utf8'));
const drift = [];

for (const { file, why } of FROZEN) {
  if (!fs.existsSync(file)) {
    drift.push({ file, why, problem: 'MISSING' });
    continue;
  }
  const now = hash(file);
  const then = lock.files[file]?.sha256;
  if (!then) drift.push({ file, why, problem: 'NOT IN LOCK' });
  else if (now !== then) drift.push({ file, why, problem: `CHANGED (${then.slice(0, 12)} → ${now.slice(0, 12)})` });
}

if (drift.length) {
  console.error('');
  console.error('HARNESS TAMPER CHECK — FAILED');
  console.error(`  locked at ${lock.lockedAt}`);
  console.error('');
  for (const d of drift) {
    console.error(`  ${d.problem}  ${d.file}`);
    console.error(`      this file controls: ${d.why}`);
  }
  console.error('');
  console.error('  The harness is frozen after Phase 0. A gate cannot be turned green by');
  console.error('  editing the thing that measures it. Stop, report what needs to change and');
  console.error('  why, and only then re-lock with --relock.');
  console.error('');
  process.exit(1);
}

console.log(`harness: verified ${FROZEN.length} frozen files against ${LOCK} (locked ${lock.lockedAt})`);
