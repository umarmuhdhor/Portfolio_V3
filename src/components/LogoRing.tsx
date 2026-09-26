'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RING } from '@/lib/dummy';
import { DURATION, EASE_NAME, prefersReducedMotion, registerEase } from '@/lib/ease';
import { ringSpin } from '@/lib/ring-spin';
import './logo-ring.css';

/* --------------------------------------------------------------------------
   The ring, as measured off the reference

   Seventeen tiles ride a tilted ellipse centred on the section. Fitting a
   conic to the seventeen rendered centres at 1920 gives, with residuals under
   2e-3, semi-axes of 691 and 453.6 about a centre at the origin, rotated
   -17.17deg. The tiles are spaced by equal *arc length* rather than equal
   parameter — the gaps between them measure 17.6deg where the ellipse is
   fastest and 26.6deg where it is slowest, which is what equal arc length
   looks like on an ellipse and is what a conveyor belt does.

   Scale and opacity fall straight out of the vertical position:

     scale   = 0.7 + 0.3 * (1 + sin t) / 2
     opacity = 0.1 + 0.9 * ((1 + sin t) / 2) ^ 1.388

   Both were fitted against the captured values and reproduce them to three
   decimal places. The ring advances a little under two thirds of a turn
   across the section's scroll span.
   -------------------------------------------------------------------------- */

/** Semi-axes and tilt, in reference pixels at a 1920 viewport. */
const A = 691;
const B = 453.6;
const TILT = (-17.17 * Math.PI) / 180;
/** Turns of the ring across the section's full scroll span. */
const TURNS = 0.62;

const SCALE_MIN = 0.7;
const SCALE_SPAN = 0.3;
const OPACITY_MIN = 0.1;
const OPACITY_SPAN = 0.9;
const OPACITY_GAMMA = 1.388;

/**
 * Equal-arc-length sample points around the ellipse.
 *
 * Walks the perimeter finely, accumulates arc length, then picks the `count`
 * parameter values that split it into equal pieces. Done once at module load
 * — the shape never changes, only the offset the scroll applies to it.
 */
function arcLengthTable(count: number, steps = 4096): number[] {
  const cum: number[] = [0];
  let total = 0;
  for (let i = 1; i <= steps; i++) {
    const t0 = ((i - 1) / steps) * Math.PI * 2;
    const t1 = (i / steps) * Math.PI * 2;
    // |dP/dt| on the untilted ellipse; the tilt is a rotation and does not
    // change arc length.
    const dx = A * (Math.cos(t1) - Math.cos(t0));
    const dy = B * (Math.sin(t1) - Math.sin(t0));
    total += Math.hypot(dx, dy);
    cum.push(total);
  }

  const out: number[] = [];
  let j = 0;
  for (let k = 0; k < count; k++) {
    const target = (k / count) * total;
    while (j < steps && cum[j + 1] < target) j++;
    // Linear interpolation inside the segment we landed in.
    const span = cum[j + 1] - cum[j] || 1;
    const frac = (target - cum[j]) / span;
    out.push(((j + frac) / steps) * Math.PI * 2);
  }
  return out;
}

const BASE_T = arcLengthTable(RING.logos.length);

/**
 * Where tile `i` sits, and how big and how solid it is, at ring offset
 * `turn` — in **radians**, matching what ringSpin emits. It used to take
 * turns and multiply here; keeping that while the shared driver hands over
 * radians would have spun the ring 2pi times too fast.
 */
function place(i: number, turn: number) {
  // The ring runs backwards through the table as the page scrolls down, which
  // is the direction the reference turns.
  const t = BASE_T[i] - turn;
  const ux = A * Math.cos(t);
  const uy = B * Math.sin(t);
  const cos = Math.cos(TILT);
  const sin = Math.sin(TILT);

  const v = (1 + Math.sin(t)) / 2;
  return {
    x: ux * cos - uy * sin,
    y: ux * sin + uy * cos,
    scale: SCALE_MIN + SCALE_SPAN * v,
    opacity: OPACITY_MIN + OPACITY_SPAN * v ** OPACITY_GAMMA,
  };
}

export default function LogoRing() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stage = root.current;
    if (!stage) return;

    const tiles = gsap.utils.toArray<HTMLElement>('[data-ring-tile]', stage);
    if (!tiles.length) return;

    // A and B are design units, and design px === rem — so they have to be
    // multiplied by the live root font size or the ring stays 1920-sized on
    // every viewport. Read per paint: the root size is a vw expression.
    const unit = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 1;

    // Below the breakpoint the root size stops tracking the viewport, so a
    // 691-unit semi-major axis is 691 real pixels on a 375px phone and most
    // of the ring is off-screen. Shrink the *radii* to fit rather than
    // scaling the whole stage, which would shrink the marks with it.
    //
    // Fitting to width alone collapses the minor axis to about 110px, and the
    // heading is more than twice that tall — the marks end up sitting on the
    // type instead of orbiting it. So the fit is driven by the axis that has
    // to clear the heading, and the widest few marks are allowed to run past
    // the edge, where they are the faintest ones anyway and the section
    // clips them.
    const fitFactor = (u: number) =>
      Math.min(1, Math.max((window.innerWidth * 0.46) / (A * u), (window.innerHeight * 0.33) / (B * u)));

    // Reduced motion still needs the ring *placed*, or seventeen tiles stack
    // on top of each other in the middle of the section. It just does not turn.
    let turnNow = 0;
    const paint = (turn: number) => {
      turnNow = turn;
      const u = unit();
      const fit = fitFactor(u);
      tiles.forEach((el, i) => {
        const p = place(i, turn);
        gsap.set(el, {
          // The tile is anchored at the stage centre; these two pull it back
          // by half its own size so x/y read as the centre of the tile.
          xPercent: -50,
          yPercent: -50,
          x: p.x * u * fit,
          y: p.y * u * fit,
          scale: p.scale,
          opacity: p.opacity,
        });
      });
    };

    if (prefersReducedMotion()) {
      paint(0);
      gsap.set(stage, { autoAlpha: 1 });
      return;
    }

    registerEase();
    gsap.registerPlugin(ScrollTrigger);

    paint(0);

    // The reference fades the whole cloud in as the section arrives, rather
    // than fading each tile — the per-tile opacity is already carrying the
    // depth, and doing both at once reads as a flicker.
    gsap.set(stage, { autoAlpha: 0 });
    const fade = ScrollTrigger.create({
      trigger: stage,
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.to(stage, { autoAlpha: 1, duration: DURATION.image, ease: EASE_NAME }),
    });

    // Scroll drives the ring, but does not own it. On `scrub` alone the wheel
    // stopped dead the moment the section's trigger hit either end of its
    // range and sat frozen mid-turn, which reads as broken rather than as
    // finished. ringSpin adds a slow constant drift underneath the scroll
    // term so it never stops.
    const stopSpin = ringSpin({
      stage,
      paint: (turn) => paint(turn),
      scrollTurns: TURNS,
      idleTurnsPerSecond: 0.01,
    });

    // A resize changes the root font size, and with it every radius. Without
    // this the ring keeps the geometry of the width it was first painted at.
    const onResize = () => paint(turnNow);
    window.addEventListener('resize', onResize);

    // Belt and braces: if the fade trigger never fires, the tiles must not be
    // left invisible.
    const sweep = window.setTimeout(() => gsap.set(stage, { autoAlpha: 1 }), 2500);

    return () => {
      window.clearTimeout(sweep);
      window.removeEventListener('resize', onResize);
      fade.kill();
      stopSpin();
    };
  }, []);

  return (
    <div className="sec-ring__stage" ref={root}>
      {RING.logos.map((l) => (
        <div className="sec-ring__tile" data-ring-tile key={l.src}>
          <img alt={l.label} loading="lazy" src={l.src} />
        </div>
      ))}
    </div>
  );
}
