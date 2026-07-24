#!/usr/bin/env node
/**
 * visual-ab.mjs — side-by-side and 50% onion-skin composites.
 *
 * Strictly a secondary check. The numeric diff is the gate; these images catch
 * rhythm and density errors that a per-element diff reads as fine. A phase is
 * never reported green off screenshots.
 *
 *   node scripts/visual-ab.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';
import { VIEWPORTS } from './roles.mjs';

const DIR = path.resolve('ab-report');

function read(file) {
  if (!fs.existsSync(file)) return null;
  return PNG.sync.read(fs.readFileSync(file));
}

/** Copy src into dst at (ox, oy), blending with `alpha` (1 = opaque). */
function blit(dst, src, ox, oy, alpha = 1) {
  for (let y = 0; y < src.height; y++) {
    const dy = y + oy;
    if (dy < 0 || dy >= dst.height) continue;
    for (let x = 0; x < src.width; x++) {
      const dx = x + ox;
      if (dx < 0 || dx >= dst.width) continue;
      const s = (y * src.width + x) << 2;
      const d = (dy * dst.width + dx) << 2;
      for (let c = 0; c < 3; c++) {
        dst.data[d + c] = alpha === 1 ? src.data[s + c] : Math.round(dst.data[d + c] * (1 - alpha) + src.data[s + c] * alpha);
      }
      dst.data[d + 3] = 255;
    }
  }
}

function fill(png, v = 255) {
  for (let i = 0; i < png.data.length; i += 4) {
    png.data[i] = png.data[i + 1] = png.data[i + 2] = v;
    png.data[i + 3] = 255;
  }
}

let made = 0;
for (const vp of VIEWPORTS) {
  const a = read(path.join(DIR, `ref-${vp.name}.png`));
  const b = read(path.join(DIR, `build-${vp.name}.png`));
  if (!a || !b) {
    console.warn(`  skip ${vp.name}: missing ${!a ? 'ref' : 'build'} screenshot`);
    continue;
  }

  const GAP = 24;
  const sbs = new PNG({ width: a.width + GAP + b.width, height: Math.max(a.height, b.height) });
  fill(sbs, 210);
  blit(sbs, a, 0, 0);
  blit(sbs, b, a.width + GAP, 0);
  fs.writeFileSync(path.join(DIR, `sidebyside-${vp.name}.png`), PNG.sync.write(sbs));

  const onion = new PNG({ width: Math.max(a.width, b.width), height: Math.max(a.height, b.height) });
  fill(onion, 255);
  blit(onion, a, 0, 0, 1);
  blit(onion, b, 0, 0, 0.5);
  fs.writeFileSync(path.join(DIR, `onion-${vp.name}.png`), PNG.sync.write(onion));

  made += 2;
  console.log(`  ✓ ${vp.name}: sidebyside + onion`);
}

console.log(`visual-ab: wrote ${made} composite(s) into ab-report/`);
