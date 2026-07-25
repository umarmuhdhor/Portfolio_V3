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
 * position from it rather than from the native scroll event; a second
 * smooth-scroll layer on top would fight it.
 *
 * Two rules this file exists to enforce, both learned the hard way:
 *
 *  1. **Nothing is hidden unless something is guaranteed to show it again.**
 *     `gsap.from()` applies its start state the moment the tween is built, so
 *     if the ScrollTrigger never fires — a mis-measured page, a refresh that
 *     ran before layout settled, a viewport taller than the trigger expected —
 *     the content stays invisible forever. Every reveal here sets its own
 *     start state and is driven by an explicit `onEnter`, with a refresh
 *     afterwards so anything already on screen fires straight away, and a
 *     final safety sweep that shows anything still hidden.
 *
 *  2. **A mask is temporary.** Line masks exist so a line can slide up from
 *     nothing. Once it has arrived, the mask is released — otherwise it spends
 *     the rest of the page clipping the descenders off a 118rem serif.
 */
export default function ScrollMotion() {
  useEffect(() => {
    if (prefersReducedMotion()) return;

    registerEase();
    gsap.registerPlugin(ScrollTrigger, Observer, SplitText);

    // The browser restores the previous scroll offset before Lenis exists, and
    // Lenis then adopts it — so a reload lands mid-page with every reveal above
    // already spent. Start from the top and let the anchor links do the moving.
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    const lenis = new Lenis({
      duration: 1.109,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const splits: SplitText[] = [];
    /** Everything hidden by this component, so it can all be shown again. */
    const hidden = new Set<HTMLElement>();
    const release = (el: HTMLElement) => {
      gsap.set(el, { clearProps: 'opacity,visibility,transform,y,yPercent,color' });
      hidden.delete(el);
    };

    const ctx = gsap.context(() => {
      // --- headings: split to lines, each masked, then unmasked ------------
      gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
        const split = new SplitText(el, { type: 'lines', linesClass: 'ln' });
        splits.push(split);

        const masks: HTMLElement[] = [];
        split.lines.forEach((line) => {
          // Each line needs its own clipping parent, or the mask clips the
          // block as a whole instead of clipping line by line.
          const mask = document.createElement('span');
          mask.className = 'ln-mask';
          line.parentNode?.insertBefore(mask, line);
          mask.appendChild(line);
          masks.push(mask);
        });

        const lines = split.lines as HTMLElement[];
        gsap.set(lines, { yPercent: 101 });
        lines.forEach((l) => hidden.add(l));

        ScrollTrigger.create({
          trigger: el,
          start: 'top 95%',
          once: true,
          onEnter: () =>
            gsap.to(lines, {
              yPercent: 0,
              duration: DURATION.roll,
              ease: EASE_NAME,
              stagger: 0.06,
              onComplete: () => {
                // Released once arrived. A permanent mask on a tight
                // line-height eats the ascenders and descenders.
                masks.forEach((m) => {
                  m.style.overflow = 'visible';
                });
                lines.forEach(release);
              },
            }),
        });
      });

      // --- word-level reveal ----------------------------------------------
      // A timeline rather than a bare tween, per the GSAP guidance: the words
      // stagger up while the whole run fades, so the two stay locked together
      // instead of drifting apart as separate tweens. autoAlpha over opacity
      // so the element leaves the hit-testing tree while it is invisible.
      gsap.utils.toArray<HTMLElement>('[data-split-words]').forEach((el) => {
        const split = new SplitText(el, { type: 'words,lines', wordsClass: 'wd', linesClass: 'ln' });
        splits.push(split);
        const words = split.words as HTMLElement[];

        gsap.set(words, { yPercent: 60, autoAlpha: 0 });
        words.forEach((w) => hidden.add(w));

        ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () => {
            gsap
              .timeline({ onComplete: () => words.forEach(release) })
              .to(words, {
                yPercent: 0,
                autoAlpha: 1,
                duration: DURATION.roll,
                ease: EASE_NAME,
                stagger: { each: 0.02, from: 'start' },
              });
          },
        });
      });

      // --- scrub: long copy resolves as it crosses the viewport ------------
      // Tied to scroll position rather than fired once, so the reader controls
      // the pace. Each word lifts out of grey on its own offset.
      gsap.utils.toArray<HTMLElement>('[data-split-scrub]').forEach((el) => {
        const split = new SplitText(el, { type: 'words', wordsClass: 'wd' });
        splits.push(split);
        const words = split.words as HTMLElement[];

        gsap.set(words, { color: '#929292' });
        gsap.to(words, {
          color: '#000',
          ease: 'none',
          stagger: 0.05,
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            end: 'bottom 55%',
            scrub: true,
          },
        });
      });

      // --- blocks: a short lift -------------------------------------------
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.set(el, { autoAlpha: 0, y: 40 });
        hidden.add(el);
        ScrollTrigger.create({
          trigger: el,
          start: 'top 95%',
          once: true,
          onEnter: () =>
            gsap.to(el, {
              autoAlpha: 1,
              y: 0,
              duration: DURATION.transform,
              ease: EASE_NAME,
              onComplete: () => release(el),
            }),
        });
      });

      // --- work cards: staggered in, in grid order ------------------------
      const cards = gsap.utils.toArray<HTMLElement>('[data-role="work-card"]');
      cards.forEach((card) => {
        gsap.set(card, { autoAlpha: 0, y: 60 });
        hidden.add(card);
        ScrollTrigger.create({
          trigger: card,
          start: 'top 95%',
          once: true,
          onEnter: () =>
            gsap.to(card, {
              autoAlpha: 1,
              y: 0,
              duration: DURATION.roll,
              ease: EASE_NAME,
              onComplete: () => release(card),
            }),
        });
      });

      // --- people band: the tile strip drifts with scroll ------------------
      const tiles = document.querySelector<HTMLElement>('.sec-people__track');
      const marquee = document.querySelector<HTMLElement>('.sec-people__marquee');
      if (tiles && marquee) {
        const travel = () => tiles.scrollWidth - marquee.clientWidth;
        gsap.set(tiles, { x: 0 });
        ScrollTrigger.create({
          trigger: marquee,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => gsap.set(tiles, { x: -travel() * self.progress }),
        });
      }

      // --- header: hides going down, returns going up ---------------------
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

      // --- nav: mark the section in view ----------------------------------
      const navLinks = gsap.utils.toArray<HTMLAnchorElement>('[data-role="nav-link"]');
      const setActive = (id: string) => {
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
      const sections = gsap.utils.toArray<HTMLElement>('section');
      if (counter && sections.length) {
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

      // --- scrollbar thumb -------------------------------------------------
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
    });

    // Fonts change line breaking, which changes every trigger position, so the
    // refresh waits for them. Anything already on screen fires on this pass.
    // Fonts change line breaking, which moves every trigger; the splash locks
    // the scroll height while it is up. Refresh after both, and once more when
    // the splash releases the page.
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) document.fonts.ready.then(refresh);
    else refresh();
    const onLoad = () => refresh();
    window.addEventListener('load', onLoad);

    const splashWatcher = new MutationObserver(() => {
      if (!document.documentElement.classList.contains('is--loading')) {
        refresh();
        splashWatcher.disconnect();
      }
    });
    splashWatcher.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    // Safety net. If a trigger is still holding something invisible well after
    // load, show it. A missing animation is a blemish; a permanently blank
    // section is a broken page, and this file is the only thing that hid it.
    const sweep = window.setTimeout(() => {
      // Masks are released unconditionally, including the ones authored in the
      // markup rather than created here — a mask nothing ever opens spends the
      // page clipping the glyphs it was meant to reveal.
      document.querySelectorAll<HTMLElement>('.ln-mask').forEach((m) => {
        m.style.overflow = 'visible';
      });
      if (!hidden.size) return;
      [...hidden].forEach(release);
      ScrollTrigger.refresh();
    }, 2500);

    return () => {
      window.clearTimeout(sweep);
      splashWatcher.disconnect();
      window.removeEventListener('load', onLoad);
      ctx.revert();
      splits.forEach((s) => s.revert());
      gsap.ticker.remove(raf);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
