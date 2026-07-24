import { nthMatches, resolveStagger, targetsFrame, toHex } from '../../scripts/css-util.mjs';
import { BRIEF } from '../../scripts/roles.mjs';

describe('nthMatches', () => {
  it('matches an+b at every position in the cycle', () => {
    expect(nthMatches('10n+1', 1)).toBe(true);
    expect(nthMatches('10n+1', 11)).toBe(true);
    expect(nthMatches('10n+1', 2)).toBe(false);
  });

  it('treats a bare 10n as selecting position 10, not position 0', () => {
    expect(nthMatches('10n', 10)).toBe(true);
    expect(nthMatches('10n', 20)).toBe(true);
    expect(nthMatches('10n', 1)).toBe(false);
  });

  it('handles the 9n+9 selector, which is genuinely 9n and not 10n', () => {
    expect(nthMatches('9n+9', 9)).toBe(true);
    expect(nthMatches('9n+9', 18)).toBe(true);
    // within a single 10-cycle it selects only position 9
    expect([1, 2, 3, 4, 5, 6, 7, 8, 10].some((i) => nthMatches('9n+9', i))).toBe(false);
  });

  it('never matches a position before the start of the sequence', () => {
    expect(nthMatches('10n+5', 5)).toBe(true);
    expect(nthMatches('10n+15', 5)).toBe(false);
  });

  it('rejects malformed expressions rather than matching everything', () => {
    expect(nthMatches('odd', 1)).toBe(false);
    expect(nthMatches('', 1)).toBe(false);
  });
});

describe('toHex', () => {
  it('folds shorthand, longhand and rgb() to one representation', () => {
    expect(toHex('#EEE')).toBe('#eeeeee');
    expect(toHex('#eeeeee')).toBe('#eeeeee');
    expect(toHex('rgb(238, 238, 238)')).toBe('#eeeeee');
  });

  it('keeps a real alpha channel distinct instead of flattening it', () => {
    expect(toHex('rgba(0, 0, 0, 0.4)')).toBe('rgba(0, 0, 0, 0.4)');
    expect(toHex('rgba(0, 0, 0, 1)')).toBe('#000000');
  });
});

describe('targetsFrame', () => {
  it('separates rules on the image frame from rules on the card', () => {
    expect(targetsFrame('.piz')).toBe(true);
    expect(targetsFrame('[data-role="work-frame"]')).toBe(true);
    expect(targetsFrame('')).toBe(false);
  });
});

describe('resolveStagger', () => {
  // The authored rules exactly as the reference ships them, including the
  // four-selector 700rem group and the 10n+4 override that comes after it.
  const rules = [
    { component: '.frl .qct', nth: '10n+10', target: '.piz', gridColumn: null, marginTop: null, height: '700rem' },
    { component: '.frl .qct', nth: '10n+3', target: '.piz', gridColumn: null, marginTop: null, height: '700rem' },
    { component: '.frl .qct', nth: '10n+4', target: '.piz', gridColumn: null, marginTop: null, height: '700rem' },
    { component: '.frl .qct', nth: '10n+6', target: '.piz', gridColumn: null, marginTop: null, height: '700rem' },
    { component: '.frl .qct', nth: '10n+1', target: '', gridColumn: '1/8', marginTop: null, height: null },
    { component: '.frl .qct', nth: '10n+2', target: '', gridColumn: '9/-1', marginTop: '170rem', height: null },
    { component: '.frl .qct', nth: '10n+3', target: '', gridColumn: '1/5', marginTop: '416rem', height: null },
    { component: '.frl .qct', nth: '10n+4', target: '', gridColumn: '6/12', marginTop: '188rem', height: null },
    { component: '.frl .qct', nth: '10n+4', target: '.piz', gridColumn: null, marginTop: null, height: '540rem' },
    { component: '.frl .qct', nth: '10n+5', target: '', gridColumn: '8/15', marginTop: '-214rem', height: null },
    { component: '.frl .qct', nth: '10n+6', target: '', gridColumn: '5/9', marginTop: '178rem', height: null },
    { component: '.frl .qct', nth: '10n+7', target: '', gridColumn: '1/8', marginTop: '323rem', height: null },
    { component: '.frl .qct', nth: '10n+8', target: '', gridColumn: '9/-1', marginTop: '154rem', height: null },
    { component: '.frl .qct', nth: '9n+9', target: '', gridColumn: '2/8', marginTop: '638rem', height: null },
    { component: '.frl .qct', nth: '9n+9', target: '.piz', gridColumn: null, marginTop: null, height: '500rem' },
    { component: '.frl .qct', nth: '10n', target: '', gridColumn: '11/-2', marginTop: '100rem', height: null },
  ];

  const resolved = resolveStagger(rules, ['.qct'], 540);

  it('reproduces all ten rows of the brief stagger table', () => {
    for (let i = 0; i < 10; i++) {
      const want = BRIEF.stagger[i];
      expect({
        column: resolved[i].column,
        marginTop: resolved[i].marginTop,
        frameHeight: resolved[i].frameHeight,
      }).toEqual({ column: want.column, marginTop: want.marginTop, frameHeight: want.frameHeight });
    }
  });

  it('lets the later 10n+4 rule win over the earlier 700rem group', () => {
    expect(resolved[3].frameHeight).toBe(540);
  });

  it('falls back to the base frame height where no nth rule sets one', () => {
    expect(resolved[0].frameHeight).toBe(540);
  });

  it('defaults margin-top to 0 for the first card', () => {
    expect(resolved[0].marginTop).toBe(0);
  });

  it('keeps the negative margin on card 5 signed', () => {
    expect(resolved[4].marginTop).toBe(-214);
  });

  it('ignores rules belonging to a different component', () => {
    const mixed = [...rules, { component: '.rse .eoc', nth: '10n+1', target: '', gridColumn: '99/99', marginTop: '999rem', height: null }];
    expect(resolveStagger(mixed, ['.qct'], 540)[0].column).toBe('1 / 8');
  });
});
