import { analyzeCss } from '../../scripts/analyze-css.mjs';

describe('analyzeCss', () => {
  it('collects rem font sizes and keeps px sizes separate', () => {
    const r = analyzeCss('.a{font-size:118rem}.b{font-size:14rem}.c{font-size:14rem}.err{font-size:32px}');
    expect(r.fontSizesRem).toEqual({ 118: 1, 14: 2 });
    expect(r.fontSizesPx).toEqual({ 32: 1 });
  });

  it('normalizes #rgb shorthand so #eee and #eeeeee are one colour', () => {
    const r = analyzeCss('.a{color:#eee}.b{color:#EEEEEE}');
    expect(r.palette['#eeeeee']).toBe(2);
  });

  it('reads durations only from transition/animation declarations, ignoring 0s', () => {
    const r = analyzeCss('.a{transition:transform 1.109s cubic-bezier(.17,.84,.44,1),opacity .3s ease}.b{transition-delay:0s}.c{width:5s}');
    expect(Object.keys(r.durations).sort()).toEqual(['0.3', '1.109']);
  });

  it('captures the easing curve with whitespace stripped', () => {
    const r = analyzeCss('.a{transition:transform .6s cubic-bezier(0.17, 0.84, 0.44, 1)}');
    expect(r.timings['cubic-bezier(0.17,0.84,0.44,1)']).toBe(1);
  });

  it('does not mistake a class like .is--a for a custom property', () => {
    const r = analyzeCss('.link.is--a:hover:before{transform:scaleX(0)}:root{--off:.5em}');
    expect(r.customProps).toEqual({ '--off': '.5em' });
  });

  it('counts zero @keyframes on a transition-only sheet', () => {
    const r = analyzeCss('.a{transition:opacity .3s ease}');
    expect(r.keyframes).toBe(0);
  });

  describe('stagger extraction', () => {
    // The reference sets four frame heights in a single selector list. Reading
    // only the last sub-selector silently loses three of the ten rows, and the
    // resulting table still looks plausible — so this is the case worth pinning.
    const multi = '.frl .qct:nth-child(10n+10) .piz,.frl .qct:nth-child(10n+3) .piz,.frl .qct:nth-child(10n+4) .piz,.frl .qct:nth-child(10n+6) .piz{height:700rem}';

    it('expands a selector list into one row per nth-child', () => {
      const r = analyzeCss(multi);
      expect(r.stagger).toHaveLength(4);
      expect(r.stagger.map((s) => s.nth).sort()).toEqual(['10n+10', '10n+3', '10n+4', '10n+6']);
      expect(r.stagger.every((s) => s.height === '700rem')).toBe(true);
    });

    it('records the trailing target so frame rules are distinguishable from card rules', () => {
      const r = analyzeCss(multi + '.frl .qct:nth-child(10n+2){grid-column:9/-1;margin-top:170rem}');
      const frame = r.stagger.find((s) => s.nth === '10n+3');
      const card = r.stagger.find((s) => s.nth === '10n+2');
      expect(frame.target).toBe('.piz');
      expect(card.target).toBe('');
      expect(card.gridColumn).toBe('9/-1');
      expect(card.marginTop).toBe('170rem');
    });

    it('groups by component so unrelated staggered lists stay apart', () => {
      const r = analyzeCss('.frl .qct:nth-child(2){margin-top:1rem}.rse .eoc:nth-child(2){margin-top:9rem}');
      expect([...new Set(r.stagger.map((s) => s.component))].sort()).toEqual(['.frl .qct', '.rse .eoc']);
    });

    it('dedupes identical rows — the reference serves each chunk more than once', () => {
      const rule = '.frl .qct:nth-child(10n+2){grid-column:9/-1;margin-top:170rem}';
      const r = analyzeCss([rule, rule, rule].join('\n'));
      expect(r.stagger).toHaveLength(1);
    });

    it('ignores nth-child rules that set neither position nor size', () => {
      const r = analyzeCss('.frl .qct:nth-child(3){color:#000}');
      expect(r.stagger).toHaveLength(0);
    });
  });
});

describe('analyzeCss — false positives fixed after Phase 1', () => {
  it('does not read the --ease token name as an `ease` timing function', () => {
    const r = analyzeCss(':root{--ease:cubic-bezier(0.17,0.84,0.44,1)}.a{transition:opacity .3s var(--ease)}');
    expect(r.timings.ease).toBeUndefined();
    expect(r.timings['cubic-bezier(0.17,0.84,0.44,1)']).toBe(1);
  });

  it('does not read linear-gradient as a `linear` timing function', () => {
    const r = analyzeCss('.a{background:linear-gradient(180deg,#000,transparent)}');
    expect(r.timings.linear).toBeUndefined();
  });

  it('still reads a genuine ease and linear on a transition', () => {
    const r = analyzeCss('.a{transition:width .4s ease,opacity .4s linear}');
    expect(r.timings.ease).toBe(1);
    expect(r.timings.linear).toBe(1);
  });

  it('ignores the ease Chrome expands out of `animation: none`', () => {
    const r = analyzeCss('.a{animation:auto ease 0s 1 normal none running none}');
    expect(r.timings.ease).toBeUndefined();
  });

  it('drops fully transparent values from the palette, however they serialize', () => {
    const r = analyzeCss('.a{background:linear-gradient(rgb(0, 0, 0), rgba(0, 0, 0, 0))}.b{color:transparent}.c{color:#000}');
    expect(r.palette['rgba(0, 0, 0, 0)']).toBeUndefined();
    // rgb() is kept verbatim here; folding to hex happens in css-util.toHex
    expect(r.palette['rgb(0, 0, 0)']).toBe(1);
    expect(r.palette['#000000']).toBe(1);
  });

  it('keeps a partially transparent colour, which is a real design value', () => {
    const r = analyzeCss('.a{background:rgba(0, 0, 0, 0.4)}');
    expect(r.palette['rgba(0, 0, 0, 0.4)']).toBe(1);
  });
});
