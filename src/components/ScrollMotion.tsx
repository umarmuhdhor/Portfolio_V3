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
    const documentRoot = document.documentElement;
    documentRoot.classList.remove('is--dark');
    if (prefersReducedMotion()) return;

    registerEase();
    gsap.registerPlugin(ScrollTrigger, Observer, SplitText);

    const lenis = new Lenis({
      anchors: true,
      duration: 1.109,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      stopInertiaOnNavigate: true,
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
      // --- headings: masked lines, staggered by word ------------------------
      // This used to slide each whole line up as one rigid block, six
      // hundredths apart. It read as a slideshow: every heading on the page
      // arrived the same way, at the same speed, in the same number of
      // pieces. Splitting to words *inside* the line mask and staggering
      // those instead keeps the discipline — nothing ever escapes its line
      // box, the mask still comes off at the end — while giving the type
      // somewhere to travel from. The words are close enough together
      // (0.025) that a heading still reads as one gesture rather than as
      // letters being typed.
      gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
        const split = new SplitText(el, { type: 'lines,words', linesClass: 'ln', wordsClass: 'wd' });
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
        const words = split.words as HTMLElement[];
        // Words carry the motion; the line stays put so the mask has a fixed
        // edge to clip against.
        gsap.set(words, { yPercent: 108 });
        words.forEach((w) => hidden.add(w));

        ScrollTrigger.create({
          trigger: el,
          start: 'top 95%',
          once: true,
          onEnter: () =>
            gsap.to(words, {
              yPercent: 0,
              duration: DURATION.roll,
              ease: EASE_NAME,
              stagger: { each: 0.025, from: 'start' },
              onComplete: () => {
                // Released once arrived. A permanent mask on a tight
                // line-height eats the ascenders and descenders.
                masks.forEach((m) => {
                  m.style.overflow = 'visible';
                });
                words.forEach(release);
                lines.forEach(release);
              },
            }),
        });
      });

      // --- word-level reveal ----------------------------------------------
      // A timeline rather than a bare tween: words stagger up while the whole
      // run fades, so the two stay locked together. Opacity keeps the content
      // in the accessibility tree before its visual reveal.
      gsap.utils.toArray<HTMLElement>('[data-split-words]').forEach((el) => {
        const split = new SplitText(el, { type: 'words,lines', wordsClass: 'wd', linesClass: 'ln' });
        splits.push(split);
        const words = split.words as HTMLElement[];

        gsap.set(words, { yPercent: 60, opacity: 0 });
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
                opacity: 1,
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

      // --- hand-authored line masks ---------------------------------------
      // The diagram marquees and the people labels ship their masks in the
      // markup rather than getting them from SplitText, because their line
      // breaks are authored rather than found. They still have to move: on
      // the reference these slide up exactly like a split heading does, and
      // without this they sat still and were released by the safety sweep.
      gsap.utils.toArray<HTMLElement>('[data-lines]').forEach((el) => {
        const lines = gsap.utils.toArray<HTMLElement>('.ln', el);
        if (!lines.length) return;

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
                el.querySelectorAll<HTMLElement>('.ln-mask').forEach((m) => {
                  m.style.overflow = 'visible';
                });
                lines.forEach(release);
              },
            }),
        });
      });

      // --- the dark run ----------------------------------------------------
      // The reference flips its diagram section from transparent to black
      // about 530px into its own scroll, and everything from there to the
      // footer is black outright. Sampling the reference at 60px intervals
      // put the entire change between +500 and +560, so it is a threshold
      // rather than a scrub — a class toggle, with the fade carried by a CSS
      // transition on background-color and color.
      // The class goes on the document element rather than on the section:
      // the gaps between the dark sections are body margins, and painting the
      // sections individually leaves those gaps white.
      const diagram = document.querySelector<HTMLElement>('.sec-diagram');
      if (diagram) {
        ScrollTrigger.create({
          trigger: diagram,
          start: 'top -530px',
          // No end: once the run starts it holds all the way to the footer,
          // which is black on its own account.
          onEnter: () => documentRoot.classList.add('is--dark'),
          onLeaveBack: () => documentRoot.classList.remove('is--dark'),
        });
      }

      // --- plates: the image drifts against its frame ----------------------
      // Measured off the reference: the hero plate translates at ~0.20 of the
      // scroll rate and the statement plate at ~0.188. Over a trigger span of
      // one viewport plus one frame, +/-14.4% of a 140%-tall image is that
      // rate. The 140% lives in page.css next to a comment saying so — the
      // two numbers are a pair and cannot be changed independently.
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((frame) => {
        const image = frame.querySelector('img');
        if (!image) return;

        gsap.fromTo(
          image,
          { yPercent: -14.4 },
          {
            yPercent: 14.4,
            ease: 'none',
            scrollTrigger: {
              trigger: frame,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      // --- blocks: a short lift -------------------------------------------
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.set(el, { opacity: 0, y: 40 });
        hidden.add(el);
        ScrollTrigger.create({
          trigger: el,
          start: 'top 95%',
          once: true,
          onEnter: () =>
            gsap.to(el, {
              opacity: 1,
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
        gsap.set(card, { opacity: 0, y: 60 });
        hidden.add(card);
        ScrollTrigger.create({
          trigger: card,
          start: 'top 95%',
          once: true,
          onEnter: () =>
            gsap.to(card, {
              opacity: 1,
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
            if (lenis.scroll > 200) {
              gsap.to(header, {
                yPercent: -100,
                duration: DURATION.roll,
                ease: EASE_NAME,
                overwrite: 'auto',
              });
            }
          },
          onUp: () =>
            gsap.to(header, {
              yPercent: 0,
              duration: DURATION.roll,
              ease: EASE_NAME,
              overwrite: 'auto',
            }),
          tolerance: 12,
        });
      }

      // --- nav: mark the section in view ----------------------------------
      // On the index the sections stand in for the pages the nav points at:
      // the work section lights "Work", and so on. The hero lights nothing —
      // the name on the left is the way back there.
      const navLinks = gsap.utils.toArray<HTMLAnchorElement>('[data-role="nav-link"]');
      if (window.location.pathname === '/') {
        const setActive = (href: string | null) => {
          navLinks.forEach((a) => a.classList.toggle('is--a', a.getAttribute('href') === href));
        };
        const spy: [string, string | null][] = [
          ['index', null],
          ['work', '/work'],
          ['about', '/about'],
          ['contact', '/contact'],
        ];
        spy.forEach(([id, href]) => {
          const section = document.getElementById(id);
          if (!section) return;
          ScrollTrigger.create({
            trigger: section,
            start: 'top 50%',
            end: 'bottom 50%',
            onToggle: (self) => self.isActive && setActive(href),
          });
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

    // Safety net. If a trigger is still holding something invisible when it
    // should be on screen, show it. A missing animation is a blemish; a
    // permanently blank section is a broken page, and this file is the only
    // thing that hid it.
    //
    // Scope matters here, and getting it wrong is why the page felt lifeless.
    // This used to release *everything* hidden, two and a half seconds after
    // load, no matter where it was. Since almost every heading on a 26,000px
    // page is below the fold at that moment, almost every heading was quietly
    // un-hidden before its own trigger could ever fire — so it never
    // animated, it simply existed. The reveals were all written and none of
    // them ran. A rescue is only a rescue for something that should already
    // be visible, so the sweep now only touches what has reached the
    // viewport, and leaves everything below it to its own ScrollTrigger.
    const rescueVisible = () => {
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>('.ln-mask').forEach((m) => {
        if (m.getBoundingClientRect().top < vh) m.style.overflow = 'visible';
      });
      [...hidden].forEach((el) => {
        if (el.getBoundingClientRect().top < vh) release(el);
      });
    };

    const sweep = window.setTimeout(() => {
      rescueVisible();
      ScrollTrigger.refresh();
    }, 2500);

    // And a standing guard for the rest of the page: anything still hidden
    // once the reader has scrolled it into view had a trigger that did not
    // fire. Checks once a second, and stops as soon as there is nothing left
    // hidden — which on a healthy page is shortly after the last reveal.
    const guard = window.setInterval(() => {
      if (!hidden.size) {
        window.clearInterval(guard);
        return;
      }
      rescueVisible();
    }, 1000);

    return () => {
      window.clearInterval(guard);
      window.clearTimeout(sweep);
      splashWatcher.disconnect();
      window.removeEventListener('load', onLoad);
      documentRoot.classList.remove('is--dark');
      ctx.revert();
      splits.forEach((s) => s.revert());
      gsap.ticker.remove(raf);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
