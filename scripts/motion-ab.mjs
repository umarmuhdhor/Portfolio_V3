#!/usr/bin/env node
/**
 * motion-ab.mjs — frame-stepped capture of the project-card hover.
 *
 * Numbers alone will not catch a wrong-feeling hover: a transition can carry
 * the right duration and the right curve and still land wrong because it fires
 * on the wrong property or the caption enters from the wrong side. So both
 * sides are driven through the same interaction, sampled at a fixed rate, and
 * the sampled transform values are compared as a curve.
 *
 *   node scripts/motion-ab.mjs --url <url> --side ref|build --out <file.json>
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const FPS = 30;
const FRAMES = 45; // 1.5s — long enough to cover the 1.109s image scale
const SEL = {
  ref: { card: '.frl .qct', frame: '.piz', image: '.piz img', out: '.i-c .dlx', in: '.i-c .jts' },
  build: {
    card: '[data-role="work-card"]',
    frame: '[data-role="work-frame"]',
    image: '[data-role="work-frame"] img',
    out: '[data-role="caption-out"]',
    in: '[data-role="caption-in"]',
  },
};

function parseArgs(argv) {
  const o = { side: 'ref' };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--url') o.url = argv[++i];
    else if (argv[i] === '--side') o.side = argv[++i];
    else if (argv[i] === '--out') o.out = argv[++i];
  }
  if (!o.url || !o.out) {
    console.error('usage: motion-ab.mjs --url <url> --side ref|build --out <file>');
    process.exit(2);
  }
  return o;
}

const args = parseArgs(process.argv);
const sel = SEL[args.side];

const browser = await chromium.launch({ headless: false });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
page.setDefaultTimeout(60_000);

try {
  await page.goto(args.url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForLoadState('networkidle', { timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(3_000);

  const card = page.locator(sel.card).first();
  await card.scrollIntoViewIfNeeded({ timeout: 30_000 });
  await page.waitForTimeout(800);

  // baseline, then hover, then sample every frame
  const sample = () =>
    page.evaluate(
      (s) => {
        const pick = (q) => {
          const el = document.querySelector(q);
          if (!el) return null;
          const c = getComputedStyle(el);
          return { transform: c.transform, opacity: c.opacity, transitionDuration: c.transitionDuration, transitionTimingFunction: c.transitionTimingFunction };
        };
        return { image: pick(s.image), out: pick(s.out), in: pick(s.in), t: performance.now() };
      },
      sel
    );

  const before = await sample();
  await card.hover({ timeout: 30_000 });

  const frames = [];
  const t0 = Date.now();
  for (let i = 0; i < FRAMES; i++) {
    frames.push({ frame: i, ms: Date.now() - t0, ...(await sample()) });
    const target = ((i + 1) * 1000) / FPS;
    const wait = target - (Date.now() - t0);
    if (wait > 0) await page.waitForTimeout(wait);
  }

  // where did each property stop changing? that is the observed duration
  const settleFrame = (key, prop) => {
    let last = -1;
    for (let i = 1; i < frames.length; i++) {
      if (frames[i][key]?.[prop] !== frames[i - 1][key]?.[prop]) last = i;
    }
    return last;
  };

  const summary = {
    imageSettleFrame: settleFrame('image', 'transform'),
    captionOutSettleFrame: settleFrame('out', 'transform'),
    captionInSettleFrame: settleFrame('in', 'transform'),
    fps: FPS,
    declared: {
      image: before.image ? { duration: before.image.transitionDuration, timing: before.image.transitionTimingFunction } : null,
      out: before.out ? { duration: before.out.transitionDuration, timing: before.out.transitionTimingFunction } : null,
      in: before.in ? { duration: before.in.transitionDuration, timing: before.in.transitionTimingFunction } : null,
    },
    finalImageTransform: frames.at(-1).image?.transform ?? null,
    finalCaptionOut: frames.at(-1).out?.transform ?? null,
    finalCaptionIn: frames.at(-1).in?.transform ?? null,
  };

  fs.mkdirSync(path.dirname(path.resolve(args.out)), { recursive: true });
  fs.writeFileSync(args.out, JSON.stringify({ side: args.side, url: args.url, fps: FPS, summary, before, frames }, null, 2));

  console.log(`motion-ab (${args.side}):`);
  console.log(`  image transform settles at frame ${summary.imageSettleFrame}/${FRAMES} (~${(summary.imageSettleFrame / FPS).toFixed(2)}s), declared ${summary.declared.image?.duration}`);
  console.log(`  caption out settles at frame ${summary.captionOutSettleFrame}, in at ${summary.captionInSettleFrame}, declared ${summary.declared.out?.duration}`);
  console.log(`  final image transform: ${summary.finalImageTransform}`);
  console.log(`  wrote ${args.out}`);
} finally {
  await browser.close();
}
