'use client';

import { useEffect } from 'react';

/**
 * Keeps the header in its clear, white-type state while the hero photograph
 * is under it, and hands it the frosted backdrop once the hero has gone.
 *
 * An IntersectionObserver rather than a ScrollTrigger: it has to work with
 * reduced motion too, where ScrollMotion never starts. The top margin is the
 * bar's own height, so the switch happens as the photograph leaves the bar
 * rather than the viewport.
 */
export default function HeaderOverHero() {
  useEffect(() => {
    const header = document.querySelector<HTMLElement>('[data-role="header"]');
    const hero = document.querySelector<HTMLElement>('.sec-hero');
    if (!header || !hero) return;

    const observer = new IntersectionObserver(
      ([entry]) => header.classList.toggle('is--over-hero', entry.isIntersecting),
      { rootMargin: `-${header.offsetHeight}px 0px 0px 0px` },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  return null;
}
