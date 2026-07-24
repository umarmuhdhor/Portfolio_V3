/**
 * Baseline regression tests over the captured reference fingerprint.
 *
 * These are the tests that would fire if the reference site changed under us,
 * or if a later edit to the harness quietly started reading it differently.
 * They are deliberately assertions about the *capture*, not about our build.
 */
import fs from 'node:fs';
import path from 'node:path';
import { BRIEF, ROLES, VIEWPORTS } from '../../scripts/roles.mjs';
import { resolveStagger } from '../../scripts/css-util.mjs';

const FILE = path.resolve('reference.fingerprint.json');
const fp = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const desk = fp.viewports['1920x1080'];
const mob = fp.viewports['375x812'];

describe('reference fingerprint', () => {
  it('was captured by a real renderer, not the static fallback', () => {
    // The static path cannot produce geometry, so a phase gated on geometry
    // would silently assert nothing at all.
    expect(fp.mode).toMatch(/^render-/);
  });

  it('covers all three viewports', () => {
    expect(Object.keys(fp.viewports).sort()).toEqual(VIEWPORTS.map((v) => v.name).sort());
  });

  it('resolves 1rem to one design pixel at each tier', () => {
    expect(desk.root.fontSizePx).toBeCloseTo(1, 3);
    expect(fp.viewports['1440x900'].root.fontSizePx).toBeCloseTo(0.75, 3);
    expect(mob.root.fontSizePx).toBeCloseTo(1, 3);
  });

  it('declares both root font-size formulas', () => {
    const declared = desk.css.rootFontSize.map(parseFloat);
    expect(declared).toContainEqual(expect.closeTo(parseFloat(BRIEF.rootFontSizeDesktop), 6));
    expect(declared).toContainEqual(expect.closeTo(parseFloat(BRIEF.rootFontSizeMobile), 6));
  });

  it('has exactly one breakpoint pair and no tablet tier', () => {
    const bps = Object.keys(desk.css.breakpoints).map((b) => b.replace(/\s/g, ''));
    expect(bps).toContain('(max-width:767.98px)');
    expect(bps).toContain('(min-width:767.99px)');
    expect(bps.filter((b) => !/767\.9[89]/.test(b))).toEqual([]);
  });

  it('uses a 15-column grid', () => {
    expect(Object.keys(desk.css.gridTemplateColumns)).toContain('repeat(15, 1fr)');
  });

  it('runs zero @keyframes site-wide', () => {
    expect(desk.css.keyframes).toBe(0);
  });

  it('carries every colour the brief lists', () => {
    const found = new Set(Object.keys(desk.css.palette));
    const rgb = (hex) => {
      const h = hex.length === 4 ? '#' + [...hex.slice(1)].map((c) => c + c).join('') : hex;
      const n = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
      return `rgb(${n[0]}, ${n[1]}, ${n[2]})`;
    };
    for (const c of BRIEF.palette) expect(found.has(rgb(c))).toBe(true);
  });

  it('declares exactly the five durations from the brief and nothing else', () => {
    const durs = Object.keys(desk.css.durations).map(Number).sort((a, b) => a - b);
    expect(durs).toEqual([...BRIEF.durations].sort((a, b) => a - b));
  });

  it('uses the brief easing curve', () => {
    const timings = Object.keys(desk.css.timings).map((t) => t.replace(/\s/g, ''));
    expect(timings).toContain(BRIEF.ease.replace(/\s/g, ''));
  });

  it('defines all three spacing tokens', () => {
    for (const [k, v] of Object.entries(BRIEF.spacingTokens)) {
      expect(parseFloat(desk.css.customProps[k])).toBe(parseFloat(v));
    }
  });

  it('declares two @font-face families, both font-display: swap', () => {
    expect(desk.css.fontFace).toHaveLength(2);
    for (const f of desk.css.fontFace) expect(f.display).toBe('swap');
  });

  it('reproduces the ten-row stagger table exactly', () => {
    const cardRules = desk.css.stagger.filter((s) => s.component === '.frl .qct');
    const resolved = resolveStagger(cardRules, ['.qct'], 540);
    for (let i = 0; i < 10; i++) {
      expect({
        column: resolved[i].column,
        marginTop: resolved[i].marginTop,
        frameHeight: resolved[i].frameHeight,
      }).toEqual({
        column: BRIEF.stagger[i].column,
        marginTop: BRIEF.stagger[i].marginTop,
        frameHeight: BRIEF.stagger[i].frameHeight,
      });
    }
  });

  it('found geometry for the work grid, so geometry assertions have something to compare', () => {
    expect(desk.geometry['work-card']?.length ?? 0).toBeGreaterThan(0);
    expect(desk.geometry['work-frame']?.length ?? 0).toBeGreaterThan(0);
  });

  it('resolved at least three quarters of the mapped roles', () => {
    const found = Object.keys(desk.styles).length;
    expect(found / ROLES.length).toBeGreaterThanOrEqual(0.75);
  });
});
