#!/usr/bin/env node
/**
 * fingerprint.mjs — capture a content-independent style + geometry fingerprint.
 *
 *   node scripts/fingerprint.mjs --url <url> --out <file.json> [--side ref|build]
 *                                [--static] [--headless]
 *
 * Pixel-diffing the two sites is meaningless: the content differs by design.
 * What is comparable is computed style, resolved geometry normalized to viewport
 * width, and the authored CSS rule set. That is what this captures.
 *
 * The reference is WebGL-heavy and can hang a headless renderer. Order of
 * attack, per the brief: headed chromium → swiftshader → static CSS parse.
 * Two render attempts maximum, then fall back. The mode used is recorded in the
 * output so a report can never quietly rest on the weaker path.
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { ROLES, STYLE_PROPS, VIEWPORTS } from './roles.mjs';
import { analyzeCss } from './analyze-css.mjs';

const NAV_TIMEOUT = 60_000;
const EVAL_TIMEOUT = 60_000;
const SETTLE_MS = 3_500;

function parseArgs(argv) {
  const out = { headless: false, static: false, side: 'ref' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--url') out.url = argv[++i];
    else if (a === '--out') out.out = argv[++i];
    else if (a === '--side') out.side = argv[++i];
    else if (a === '--headless') out.headless = true;
    else if (a === '--static') out.static = true;
  }
  if (!out.url || !out.out) {
    console.error('usage: fingerprint.mjs --url <url> --out <file> [--side ref|build] [--static] [--headless]');
    process.exit(2);
  }
  return out;
}

// ---------------------------------------------------------------------------
// in-page collector — serialized into the browser, must stay self-contained
// ---------------------------------------------------------------------------
function collect({ roles, styleProps, side, analyzeCssSrc }) {
  const analyze = new Function(`return (${analyzeCssSrc})`)();
  const sel = (r) => (side === 'ref' ? r.ref : r.build);
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const round = (n, p = 5) => (Number.isFinite(n) ? Number(n.toFixed(p)) : null);

  /** Split a CSS list on top-level commas only — cubic-bezier() has commas. */
  const splitTop = (s) => {
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

  // --- root metrics --------------------------------------------------------
  const rootFontPx = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const root = {
    fontSizePx: round(rootFontPx, 4),
    clientWidth: vw,
    clientHeight: vh,
    remToPx: round(rootFontPx, 4),
    // the invariant that matters: 1rem === one design pixel
    remPerViewportWidth: round(rootFontPx / vw, 9),
  };

  // --- per-role computed styles + geometry --------------------------------
  const styles = {};
  const geometry = {};
  const missing = [];

  for (const r of roles) {
    let nodes = [];
    try {
      nodes = Array.from(document.querySelectorAll(sel(r)));
    } catch {
      nodes = [];
    }
    if (!nodes.length) {
      missing.push(r.id);
      continue;
    }
    const take = r.all ? nodes : [nodes[0]];

    const cs = getComputedStyle(take[0]);
    const s = {};
    for (const p of styleProps) s[p] = cs.getPropertyValue(p).trim();
    const fam = s['font-family'].toLowerCase();
    // role, not string: which elements use the serif is part of the design,
    // but the serif's *name* differs between the two builds by decision
    s.__familyRole = /serif/.test(fam) && !/sans-serif/.test(fam) ? 'serif' : 'sans';
    s.__instanceCount = nodes.length;
    s.__transitions = splitTop(cs.transitionProperty).map((prop, i) => ({
      property: prop,
      duration: splitTop(cs.transitionDuration)[i] ?? splitTop(cs.transitionDuration)[0] ?? null,
      timing: splitTop(cs.transitionTimingFunction)[i] ?? splitTop(cs.transitionTimingFunction)[0] ?? null,
      delay: splitTop(cs.transitionDelay)[i] ?? splitTop(cs.transitionDelay)[0] ?? null,
    }));
    styles[r.id] = s;

    geometry[r.id] = take.map((el, i) => {
      const b = el.getBoundingClientRect();
      const c = getComputedStyle(el);
      return {
        i,
        x: round(b.x / vw),
        y: round((b.y + window.scrollY) / vw),
        w: round(b.width / vw),
        h: round(b.height / vw),
        gridColumnStart: c.gridColumnStart,
        gridColumnEnd: c.gridColumnEnd,
        marginTopRem: round(parseFloat(c.marginTop || '0') / rootFontPx, 3),
        heightRem: round(b.height / rootFontPx, 3),
      };
    });
  }

  // --- live palette / motion / type, walked over the rendered tree ---------
  const livePalette = {};
  const liveMotion = {};
  const liveTiming = {};
  const liveDurations = {};
  const liveFontSizes = {};

  for (const el of document.querySelectorAll('*')) {
    const c = getComputedStyle(el);
    for (const p of ['color', 'background-color', 'border-top-color', 'outline-color']) {
      const v = c.getPropertyValue(p).trim();
      if (!v || v === 'rgba(0, 0, 0, 0)' || v === 'transparent') continue;
      livePalette[v] = (livePalette[v] || 0) + 1;
    }
    const ds = splitTop(c.transitionDuration);
    const fns = splitTop(c.transitionTimingFunction);
    for (let i = 0; i < ds.length; i++) {
      if (!ds[i] || ds[i] === '0s') continue;
      const fn = (fns[i] ?? fns[0] ?? '').replace(/\s+/g, '');
      liveMotion[`${ds[i]} ${fn}`] = (liveMotion[`${ds[i]} ${fn}`] || 0) + 1;
      liveTiming[fn] = (liveTiming[fn] || 0) + 1;
      liveDurations[ds[i]] = (liveDurations[ds[i]] || 0) + 1;
    }
    const fs = parseFloat(c.fontSize);
    if (Number.isFinite(fs)) {
      const rem = String(Number((fs / rootFontPx).toFixed(2)));
      liveFontSizes[rem] = (liveFontSizes[rem] || 0) + 1;
    }
  }

  // --- authored CSS --------------------------------------------------------
  // Same-origin sheets and inline <style> only; cross-origin sheets throw on
  // cssRules access and are counted rather than silently dropped.
  // The reference serves each chunk twice — once as a <link> and once inlined
  // into the SSR <style> block — so deduping by sheet href is not enough.
  // Deduping by rule text is, and it costs one Set.
  const seenRules = new Set();
  const parts = [];
  let crossOrigin = 0;
  let sheetCount = 0;
  for (const sheet of Array.from(document.styleSheets)) {
    let rules;
    try {
      rules = sheet.cssRules;
    } catch {
      crossOrigin++;
      continue;
    }
    if (!rules) continue;
    sheetCount++;
    for (const rule of rules) {
      const t = rule.cssText;
      if (seenRules.has(t)) continue;
      seenRules.add(t);
      parts.push(t);
    }
  }
  const css = analyze(parts.join('\n'));
  css.sheetCount = sheetCount;
  css.ruleCount = seenRules.size;
  css.crossOriginSheets = crossOrigin;

  let animations = [];
  try {
    animations = document.getAnimations().map((a) => {
      const t = a.effect?.getTiming?.() ?? {};
      return { duration: t.duration ?? null, easing: t.easing ?? null, delay: t.delay ?? null };
    });
  } catch {
    animations = [];
  }

  return {
    root,
    styles,
    geometry,
    missingRoles: missing,
    live: {
      palette: livePalette,
      motion: liveMotion,
      timing: liveTiming,
      durations: liveDurations,
      fontSizes: liveFontSizes,
    },
    css,
    animations: { count: animations.length, timings: animations.slice(0, 50) },
    docHeight: round(document.documentElement.scrollHeight / vw),
  };
}

// ---------------------------------------------------------------------------
// static fallback — no renderer, CSS text only
// ---------------------------------------------------------------------------
async function staticFingerprint(url) {
  const res = await fetch(url, {
    headers: {
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    },
  });
  const html = await res.text();
  const base = new URL(url);
  const hrefs = [...new Set([...html.matchAll(/href="([^"]+\.css)"/g)].map((m) => new URL(m[1], base).href))];
  const inline = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
  const chunks = await Promise.all(
    hrefs.map((h) =>
      fetch(h)
        .then((r) => r.text())
        .catch(() => '')
    )
  );
  const css = analyzeCss([...chunks, ...inline].join('\n'));
  css.sheetCount = hrefs.length + inline.length;
  css.crossOriginSheets = 0;

  return {
    root: { fontSizePx: null, clientWidth: null, remToPx: null, remPerViewportWidth: null },
    styles: {},
    geometry: {},
    missingRoles: ROLES.map((r) => r.id),
    live: { palette: {}, motion: {}, timing: {}, durations: {}, fontSizes: {} },
    css,
    animations: { count: 0, timings: [] },
    docHeight: null,
  };
}

// ---------------------------------------------------------------------------
async function renderFingerprint({ url, side, headless, attempt }) {
  const args = attempt === 2 ? ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] : [];
  const browser = await chromium.launch({ headless: headless || attempt === 2, args });
  const analyzeCssSrc = analyzeCss.toString();
  const out = {};
  try {
    for (const vp of VIEWPORTS) {
      const ctx = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
        isMobile: vp.mobile,
        hasTouch: vp.mobile,
      });
      const page = await ctx.newPage();
      page.setDefaultTimeout(EVAL_TIMEOUT);
      page.setDefaultNavigationTimeout(NAV_TIMEOUT);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: NAV_TIMEOUT });
      await page.waitForLoadState('networkidle', { timeout: NAV_TIMEOUT }).catch(() => {});
      await page.waitForTimeout(SETTLE_MS);
      await page.evaluate(() => document.fonts?.ready).catch(() => {});

      const data = await page.evaluate(collect, { roles: ROLES, styleProps: STYLE_PROPS, side, analyzeCssSrc });
      out[vp.name] = data;

      const dir = path.resolve('ab-report');
      fs.mkdirSync(dir, { recursive: true });
      await page
        .screenshot({ path: path.join(dir, `${side}-${vp.name}.png`), fullPage: false, timeout: 30_000 })
        .catch((e) => console.warn(`  screenshot ${vp.name} failed: ${e.message.split('\n')[0]}`));

      await ctx.close();
      console.log(
        `  ✓ ${vp.name}  rootFont=${data.root.fontSizePx}px  roles=${Object.keys(data.styles).length}/${ROLES.length}  css=${data.css.bytes}B`
      );
    }
  } finally {
    await browser.close();
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv);
  console.log(`fingerprint: ${args.side} → ${args.url}`);

  let result = null;
  let mode = null;

  if (!args.static) {
    for (let attempt = 1; attempt <= 2 && !result; attempt++) {
      try {
        console.log(`  render attempt ${attempt} (${attempt === 1 ? 'headed' : 'swiftshader'})…`);
        result = await renderFingerprint({ ...args, attempt });
        mode = attempt === 1 ? (args.headless ? 'render-headless' : 'render-headed') : 'render-swiftshader';
      } catch (e) {
        console.warn(`  attempt ${attempt} failed: ${e.message.split('\n')[0]}`);
      }
    }
  }

  if (!result) {
    console.log('  falling back to static CSS parse');
    const s = await staticFingerprint(args.url);
    result = Object.fromEntries(VIEWPORTS.map((v) => [v.name, s]));
    mode = 'static';
  }

  const payload = { url: args.url, side: args.side, capturedAt: new Date().toISOString(), mode, viewports: result };
  fs.mkdirSync(path.dirname(path.resolve(args.out)), { recursive: true });
  fs.writeFileSync(args.out, JSON.stringify(payload, null, 2));
  console.log(`  wrote ${args.out}  (mode=${mode})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
