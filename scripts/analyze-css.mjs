/**
 * analyzeCss — the single authored-CSS analyzer.
 *
 * It has to run in two places: inside the page (over CSSOM `cssText`) and in
 * node (over fetched stylesheet text in the static fallback). Rather than keep
 * two implementations that can drift apart, this one function is stringified
 * and rebuilt inside the browser. Do not add imports or closures to it.
 *
 * Live computed styles cannot serve as the source of truth for the *sets* we
 * assert at zero tolerance — palette, type scale, duration set, easing. A
 * colour that only appears on a hover state or a route we did not visit is
 * still part of the design system, and a live walk would miss it. The authored
 * rule text sees all of it.
 */
export function analyzeCss(css) {
  const freq = (re, pick) => {
    const out = {};
    for (const m of css.matchAll(re)) {
      const k = pick(m);
      if (k == null) continue;
      out[k] = (out[k] || 0) + 1;
    }
    return out;
  };

  // Normalize colours to a comparable form: lowercase hex, #rgb → #rrggbb.
  const normHex = (h) => {
    let v = h.toLowerCase();
    if (/^#[0-9a-f]{3}$/.test(v)) v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    return v;
  };

  // Fully transparent is the absence of a colour, not a colour. Chrome keeps
  // the `transparent` keyword when serializing some gradients and expands it to
  // `rgba(0, 0, 0, 0)` in others, so the same authored declaration can show up
  // either way — neither belongs in a palette. The live-DOM walk in
  // fingerprint.mjs already drops both; this keeps the authored walk consistent
  // with it.
  const TRANSPARENT = /^(transparent|rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\))$/;

  const palette = {};
  for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g)) {
    const raw = m[0].toLowerCase().replace(/\s+/g, ' ').trim();
    if (TRANSPARENT.test(raw)) continue;
    const k = normHex(m[0]);
    palette[k] = (palette[k] || 0) + 1;
  }

  // Type scale — rem font-sizes only. px font-sizes belong to the dev overlay
  // and the error route, neither of which is part of the design system.
  const fontSizesRem = freq(/font-size:\s*([0-9.]+)rem/g, (m) => String(parseFloat(m[1])));
  const fontSizesPx = freq(/font-size:\s*([0-9.]+)px/g, (m) => String(parseFloat(m[1])));

  // Durations, as they appear inside transition / animation shorthands and
  // longhands — a bare "0s" is not a duration in the design sense.
  const durations = {};
  for (const m of css.matchAll(/(?:transition|animation)(?:-duration)?\s*:\s*([^;}]+)/g)) {
    for (const d of m[1].matchAll(/(?:^|[\s,])(\d*\.?\d+)s\b/g)) {
      const v = parseFloat(d[1]);
      if (v === 0) continue;
      durations[String(v)] = (durations[String(v)] || 0) + 1;
    }
  }

  // Timing functions, read only from the declarations where one means anything.
  //
  // Scanning the whole sheet for the bare words produced two false positives.
  // `linear` matched inside `linear-gradient`, and `ease` matched inside the
  // custom property name `--ease` and inside `var(--ease)` — so declaring the
  // curve as a token, which the brief requires, registered as a second timing
  // function that the reference did not have. The lookarounds fix the word
  // matches; restricting the scan to transition declarations and to
  // `animation-timing-function` fixes the rest, since Chrome serializes
  // `animation: none` as `animation: auto ease 0s 1 normal none running none`
  // and that `ease` is an initial value, not a design decision.
  const TIMING = /(?<![-\w])(?:cubic-bezier\(\s*[^)]*\)|steps\([^)]*\)|ease-in-out|ease-out|ease-in|ease|linear)(?![-\w])/g;

  const timings = {};
  // Custom-property declarations are included because the brief requires the
  // curve to live in `--ease`. When it does, the literal cubic-bezier never
  // appears inside a transition declaration — only `var(--ease)` does — so
  // scanning transitions alone would report that the curve is not declared at
  // all. The lookarounds still apply to the value, not the property name.
  for (const decl of css.matchAll(
    /(?:transition(?:-timing-function)?|animation-timing-function|--[a-zA-Z][\w-]*)\s*:\s*([^;}]+)/g
  )) {
    for (const m of decl[1].matchAll(TIMING)) {
      const k = m[0].replace(/\s+/g, '');
      timings[k] = (timings[k] || 0) + 1;
    }
  }

  const gridTemplateColumns = freq(/grid-template-columns:\s*([^;}]+)/g, (m) => m[1].trim().replace(/\s+/g, ' '));
  const breakpoints = freq(/\((?:max|min)-width:\s*[^)]+\)/g, (m) => m[0].replace(/\s+/g, ''));

  // A custom property declaration starts a declaration — anchor on `{`, `;` or
  // whitespace so `.is--a:hover` is not read as a `--a` property.
  const customProps = {};
  for (const m of css.matchAll(/(?:^|[{;\s])(--[a-zA-Z][\w-]*)\s*:\s*([^;}]+)/g)) customProps[m[1]] = m[2].trim();

  const rootFontSize = [...css.matchAll(/(?::root|html)[^{}]*\{[^}]*?font-size:\s*([^;}]+)/g)].map((m) => m[1].trim());

  const fontFace = [...css.matchAll(/@font-face\s*\{([^}]*)\}/g)].map((m) => ({
    family: (/font-family:\s*([^;]+)/.exec(m[1]) || [])[1]?.trim() ?? null,
    weight: (/font-weight:\s*([^;]+)/.exec(m[1]) || [])[1]?.trim() ?? null,
    display: (/font-display:\s*([^;]+)/.exec(m[1]) || [])[1]?.trim() ?? null,
  }));

  // Stagger: every nth-child rule that positions or sizes something.
  //
  // Two things make this less trivial than it looks. Rules are frequently
  // written as selector *lists* — the 700rem frame height is one rule covering
  // four different nth-child values — so each sub-selector has to be read
  // separately or three of the four rows silently vanish. And the same
  // stylesheet is linked more than once on the reference, so identical rows
  // are deduped by content.
  const splitTopLevel = (s) => {
    const out = [];
    let depth = 0;
    let cur = '';
    for (const ch of s) {
      if (ch === '(') depth++;
      else if (ch === ')') depth--;
      if (ch === ',' && depth === 0) {
        out.push(cur.trim());
        cur = '';
      } else cur += ch;
    }
    if (cur.trim()) out.push(cur.trim());
    return out;
  };

  const stagger = [];
  const staggerSeen = new Set();
  for (const m of css.matchAll(/([^{}]*:nth-child\([^)]*\)[^{}]*)\{([^}]*)\}/g)) {
    const body = m[2];
    const gc = (/grid-column:\s*([^;]+)/.exec(body) || [])[1]?.trim() ?? null;
    const mt = (/margin-top:\s*([^;]+)/.exec(body) || [])[1]?.trim() ?? null;
    const h = (/(?:^|;)\s*height:\s*([^;]+)/.exec(body) || [])[1]?.trim() ?? null;
    if (!gc && !mt && !h) continue;

    for (const sub of splitTopLevel(m[1])) {
      const nthMatch = /:nth-child\(\s*([0-9n+\- ]+)\s*\)/.exec(sub);
      if (!nthMatch) continue;
      const row = {
        selector: sub,
        // component = selector up to the nth-child, so ".frl .qct" groups apart
        // from the other staggered lists on the page
        component: sub.split(':nth-child')[0].trim(),
        // trailing part after the nth-child — ".piz" means the rule targets the
        // frame inside the card, not the card itself
        target: sub.split(/:nth-child\([^)]*\)/)[1]?.trim() || '',
        nth: nthMatch[1].replace(/\s+/g, ''),
        gridColumn: gc,
        marginTop: mt,
        height: h,
      };
      const key = JSON.stringify(row);
      if (staggerSeen.has(key)) continue;
      staggerSeen.add(key);
      stagger.push(row);
    }
  }

  return {
    palette,
    fontSizesRem,
    fontSizesPx,
    durations,
    timings,
    gridTemplateColumns,
    breakpoints,
    customProps,
    rootFontSize,
    fontFace,
    stagger,
    keyframes: (css.match(/@keyframes/g) || []).length,
    bytes: css.length,
  };
}
