import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * The turn driver shared by both rings.
 *
 * A ring driven purely by `scrub` stops dead the moment its ScrollTrigger
 * reaches either end of its range. That is correct for a parallax plate,
 * which has nowhere left to go, but wrong for a wheel: a wheel that freezes
 * mid-turn reads as broken rather than as finished, and the reference's keeps
 * moving.
 *
 * So the angle is the sum of two terms:
 *
 *   - a scroll term, which the reader controls and which is what makes the
 *     ring feel attached to the page, and
 *   - a time term, a slow constant drift that never runs out.
 *
 * The time term is small enough that scrolling clearly dominates while the
 * reader is moving, and only becomes the visible motion once they stop. The
 * ticker is registered once and removed on teardown; it is skipped entirely
 * when the ring is off-screen, so an idle page below the fold is not paying
 * for seventeen transform writes a frame.
 */
export function ringSpin({
  stage,
  paint,
  scrollTurns,
  idleTurnsPerSecond,
}: {
  stage: HTMLElement;
  paint: (turn: number) => void;
  /** Turns contributed across the ring's full scroll span. */
  scrollTurns: number;
  /** Turns per second contributed by the idle drift. */
  idleTurnsPerSecond: number;
}) {
  const TAU = Math.PI * 2;

  let scrollTurn = 0;
  let idleTurn = 0;
  let visible = true;
  let last = performance.now();

  const trigger = ScrollTrigger.create({
    trigger: stage,
    start: 'top bottom',
    end: 'bottom top',
    scrub: true,
    onUpdate: (self) => {
      scrollTurn = (self.progress - 0.5) * scrollTurns * TAU;
    },
    onToggle: (self) => {
      visible = self.isActive;
      // Reset the clock on re-entry so a ring that has been off-screen for a
      // minute does not jump a minute's worth of drift on its way back in.
      last = performance.now();
    },
  });

  const tick = () => {
    const now = performance.now();
    const dt = (now - last) / 1000;
    last = now;
    if (!visible) return;
    idleTurn += dt * idleTurnsPerSecond * TAU;
    paint(scrollTurn + idleTurn);
  };

  gsap.ticker.add(tick);

  return () => {
    gsap.ticker.remove(tick);
    trigger.kill();
  };
}
