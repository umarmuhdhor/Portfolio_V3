'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { DURATION, EASE_NAME, prefersReducedMotion, registerEase } from '@/lib/ease';

/**
 * Splash — the load overlay.
 *
 * A white plate over the whole viewport with a percentage counting up in the
 * bottom-left corner and a 4px rule at the top that fills as it goes, matching
 * the reference's `.tlk` / `.zuk` / `.yap`.
 *
 * The count is tied to real progress, not a fixed timer: it tracks how many of
 * the page's images have decoded. A splash that finishes before the page does
 * is worse than no splash, because the reveal lands on a half-built layout.
 * There is still a floor and a ceiling — it never snaps instantly, and it never
 * holds the page hostage to one slow asset.
 *
 * Under `prefers-reduced-motion` it does not render at all.
 */
const MIN_MS = 900;
const MAX_MS = 4000;

export default function Splash() {
  const [done, setDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setDone(true);
      return;
    }
    registerEase();

    const root = rootRef.current;
    const bar = barRef.current;
    const count = countRef.current;
    if (!root || !bar || !count) return;

    document.documentElement.classList.add('is--loading');

    const progress = { value: 0 };
    const started = Date.now();

    const render = () => {
      const pct = Math.round(progress.value * 100);
      count.textContent = String(pct).padStart(2, '0');
      gsap.set(bar, { scaleX: progress.value });
    };

    /** Fraction of the page's images that have finished decoding. */
    const assetProgress = () => {
      const imgs = Array.from(document.images);
      if (!imgs.length) return 1;
      return imgs.filter((i) => i.complete && i.naturalWidth > 0).length / imgs.length;
    };

    const tick = gsap.ticker.add(() => {
      const elapsed = Date.now() - started;
      // The bar advances toward whichever is further along: real asset
      // progress, or the floor set by MIN_MS, so it always keeps moving.
      const floor = Math.min(1, elapsed / MIN_MS);
      const target = Math.max(assetProgress() * 0.98, floor * 0.98);
      progress.value += (target - progress.value) * 0.08;
      render();
    });

    const finish = () => {
      gsap.ticker.remove(tick);
      const tl = gsap.timeline({
        onComplete: () => {
          document.documentElement.classList.remove('is--loading');
          setDone(true);
        },
      });
      tl.to(progress, {
        value: 1,
        duration: DURATION.color,
        ease: EASE_NAME,
        onUpdate: render,
      })
        .to(count, { autoAlpha: 0, duration: DURATION.color, ease: EASE_NAME }, '-=0.1')
        // The plate leaves upward, uncovering the page rather than fading over it.
        .to(root, { yPercent: -100, duration: DURATION.image, ease: EASE_NAME }, '-=0.15')
        .to(bar, { autoAlpha: 0, duration: DURATION.color, ease: EASE_NAME }, '<');
    };

    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      const elapsed = Date.now() - started;
      window.setTimeout(finish, Math.max(0, MIN_MS - elapsed));
    };

    if (document.readyState === 'complete') settle();
    else window.addEventListener('load', settle, { once: true });
    // Never hold the page for one slow asset.
    const cap = window.setTimeout(settle, MAX_MS);

    return () => {
      gsap.ticker.remove(tick);
      window.clearTimeout(cap);
      window.removeEventListener('load', settle);
      document.documentElement.classList.remove('is--loading');
    };
  }, []);

  if (done) return null;

  return (
    <>
      <div aria-hidden="true" className="splash-bar" ref={barRef} />
      <div className="splash" ref={rootRef} role="status" aria-live="polite" aria-label="Loading">
        <div className="splash__inner">
          <div className="ctr" data-role="container">
            <span className="fn-h4 f-mn splash__count" ref={countRef}>
              00
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
