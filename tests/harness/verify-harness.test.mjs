/**
 * The tamper guard is the one control standing between an autonomous loop and
 * the easiest way to turn a red gate green: editing the thing that measures it.
 * These tests assert the guard actually covers the files that matter.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const LOCK = path.resolve('harness.lock.json');
const lock = JSON.parse(fs.readFileSync(LOCK, 'utf8'));

describe('harness lock', () => {
  it('covers every file that could be used to weaken a gate', () => {
    expect(Object.keys(lock.files).sort()).toEqual(
      [
        'reference.fingerprint.json',
        'scripts/analyze-css.mjs',
        'scripts/compare.mjs',
        'scripts/crosscheck.mjs',
        'scripts/css-util.mjs',
        'scripts/fingerprint.mjs',
        'scripts/roles.mjs',
      ].sort()
    );
  });

  it('locks the reference fingerprint, which is the reconciliation anchor', () => {
    expect(lock.files['reference.fingerprint.json']).toBeDefined();
  });

  it('still matches the files on disk', () => {
    for (const [file, meta] of Object.entries(lock.files)) {
      const actual = crypto.createHash('sha256').update(fs.readFileSync(path.resolve(file))).digest('hex');
      expect({ file, sha256: actual }).toEqual({ file, sha256: meta.sha256 });
    }
  });

  it('records why each file is frozen, so a relock has to be justified', () => {
    for (const meta of Object.values(lock.files)) {
      expect(typeof meta.why).toBe('string');
      expect(meta.why.length).toBeGreaterThan(10);
    }
  });
});
