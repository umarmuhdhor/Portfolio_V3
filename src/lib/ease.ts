/**
 * One easing curve, registered once, in both languages.
 *
 * The design system declares `--ease` in CSS. GSAP tweens have to run on the
 * numerically identical curve or the motion drifts apart from the transitions
 * it sits next to — visibly, on anything that hands off between a tween and a
 * CSS state change. So the curve is read back out of the cascade rather than
 * retyped here, and converted into a CustomEase.
 */
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

export const EASE_NAME = 'ref';

/** The five durations, in seconds. This is the entire set — there is no sixth. */
export const DURATION = {
  color: 0.3,
  ui: 0.4,
  transform: 0.5,
  roll: 0.6,
  image: 1.109,
} as const;

/** Fallback control points, used when the cascade cannot be read (SSR). */
const FALLBACK: [number, number, number, number] = [0.17, 0.84, 0.44, 1];

/** Pull the four control points out of a `cubic-bezier(a, b, c, d)` string. */
export function parseCubicBezier(value: string): [number, number, number, number] | null {
  const m = /cubic-bezier\(\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*,\s*([-\d.]+)\s*\)/.exec(value);
  if (!m) return null;
  const pts = m.slice(1, 5).map(Number);
  return pts.every(Number.isFinite) ? (pts as [number, number, number, number]) : null;
}

/** A cubic-bezier timing function is the same curve as this SVG path. */
export function bezierToPath([x1, y1, x2, y2]: [number, number, number, number]): string {
  return `M0,0 C${x1},${y1} ${x2},${y2} 1,1`;
}

let registered = false;

/**
 * Register `--ease` as a GSAP CustomEase. Idempotent, and safe to call before
 * hydration — it no-ops on the server, where there is no cascade to read.
 */
export function registerEase(): string {
  if (typeof window === 'undefined') return EASE_NAME;
  if (registered) return EASE_NAME;

  gsap.registerPlugin(CustomEase);

  const declared = getComputedStyle(document.documentElement).getPropertyValue('--ease');
  const points = parseCubicBezier(declared) ?? FALLBACK;
  CustomEase.create(EASE_NAME, bezierToPath(points));

  gsap.defaults({ ease: EASE_NAME, duration: DURATION.transform });
  registered = true;
  return EASE_NAME;
}

/** True when the visitor has asked for reduced motion. Motion is then skipped
 *  entirely rather than shortened. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
