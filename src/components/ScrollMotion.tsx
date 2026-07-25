'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Observer } from 'gsap/Observer';
import { SplitText } from 'gsap/SplitText';
import { DURATION, EASE_NAME, prefersReducedMotion, registerEase } from '@/lib/ease';

/**
 * Scroll motion — Lenis drives, GSAP reacts.
 *
 * Lenis is the single scroll source of truth. ScrollTrigger is told to read
 * position from it rather than from the native scroll event; adding a second
 * smooth-scroll layer on top would fight it and produce the drift you see on
 * sites that bolt two together.
 *
 * Every tween here runs on the CustomEase built from `--ease` and on one of the
 * five durations. There is no sixth duration and no second curve.
 *
 * prefers-reduced-motion bypasses all of it — not a shortened version, no
 * motion at all. Lenis is never constructed, no trigger is created, and the
 * elements are left in their final state by the CSS.
 */
export default function ScrollMotion() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    registerEase();
    gsap.registerPlugin(ScrollTrigger, Observer, SplitText);

    const lenis = new Lenis({
      // Matches the reference's feel: long, low-friction glide rather than a
      // short damped one.
      duration: 1.109,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
    });

    // ScrollTrigger reads from Lenis, not from the native scroll position.
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // --- headings: split to lines, reveal from behind a mask -------------
      const splits: SplitText[] = [];
      gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
        const split = new SplitText(el, { type: 'lines', linesClass: 'ln' });
        splits.push(split);

        // Each line needs its own overflow:hidden parent or the mask clips the
        // whole block instead of each line.
        split.lines.forEach((line) => {
          const mask = document.createElement('span');
          mask.className = 'ln-mask';
          line.parentNode?.insertBefore(mask, line);
          mask.appendChild(line);
        });

        gsap.from(split.lines, {
          yPercent: 101,
          duration: DURATION.roll,
          ease: EASE_NAME,
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });

      // --- blocks: a short lift, nothing more -----------------------------
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 40,
          duration: DURATION.transform,
          ease: EASE_NAME,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        });
      });

      // --- work cards: staggered in, in grid order ------------------------
      const cards = gsap.utils.toArray<HTMLElement>('[data-role="work-card"]');
      if (cards.length) {
        gsap.from(cards, {
          opacity: 0,
          y: 60,
          duration: DURATION.roll,
          ease: EASE_NAME,
          stagger: 0.08,
          scrollTrigger: { trigger: cards[0], start: 'top 90%', once: true },
        });
      }

      // --- header: hides on the way down, returns on the way up -----------
      const header = document.querySelector<HTMLElement>('[data-role="header"]');
      if (header) {
        Observer.create({
          type: 'wheel,touch,scroll',
          onDown: () => {
            if (lenis.scroll > 200) gsap.to(header, { yPercent: -100, duration: DURATION.roll, ease: EASE_NAME });
          },
          onUp: () => gsap.to(header, { yPercent: 0, duration: DURATION.roll, ease: EASE_NAME }),
          tolerance: 12,
        });
      }

      // --- nav: mark the section currently in view ------------------------
      const navLinks = gsap.utils.toArray<HTMLAnchorElement>('[data-role="nav-link"]');
      const setActive = (id: string | null) => {
        navLinks.forEach((a) => a.classList.toggle('is--a', a.getAttribute('href') === `#${id}`));
      };
      ['index', 'work', 'about', 'contact'].forEach((id) => {
        const section = document.getElementById(id);
        if (!section) return;
        ScrollTrigger.create({
          trigger: section,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: (self) => self.isActive && setActive(id),
        });
      });

      // --- running counter ------------------------------------------------
      const counter = document.querySelector<HTMLElement>('[data-role="nav-counter"]');
      if (counter) {
        const sections = gsap.utils.toArray<HTMLElement>('[data-role="section"]');
        ScrollTrigger.create({
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            const n = Math.min(sections.length, Math.max(1, Math.ceil(self.progress * sections.length)));
            counter.textContent = String(n).padStart(2, '0');
          },
        });
      }

      // --- scrollbar thumb ------------------------------------------------
      const thumb = document.querySelector<HTMLElement>('.scrollbar-thumb');
      const track = document.querySelector<HTMLElement>('.scrollbar-track');
      if (thumb && track) {
        ScrollTrigger.create({
          trigger: document.body,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            const travel = track.clientHeight - thumb.offsetHeight;
            gsap.set(thumb, { y: travel * self.progress });
          },
        });
      }

      ScrollTrigger.refresh();

      return () => splits.forEach((s) => s.revert());
    });

    return () => {
      ctx.revert();
      gsap.ticker.remove(raf);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
