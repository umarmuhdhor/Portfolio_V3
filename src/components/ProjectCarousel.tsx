'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import './project-carousel.css';

export type CarouselPlate = {
  src: string;
  alt: string;
  caption?: string | null;
};

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * A case study's screenshots as one swipeable strip.
 *
 * The strip is a plain scroll-snap container, so touch and trackpad swipes
 * work with no script; the buttons, dots and arrow keys only move that same
 * scroll position. The active slide is read back from the scroll offset rather
 * than tracked separately, so dragging, buttons and keys can never disagree.
 * Slides show their picture whole on a neutral plate: covers and flow diagrams
 * are cropped by nothing.
 */
export default function ProjectCarousel({ plates, title }: { plates: CarouselPlate[]; title: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const last = plates.length - 1;

  const goTo = useCallback((n: number) => {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(last, n));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: next * el.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  }, [last]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const read = () => {
      frame = 0;
      setIndex(Math.round(el.scrollLeft / el.clientWidth));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(index + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goTo(index - 1);
    }
  };

  const caption = plates[index]?.caption;

  return (
    <div
      aria-label={`${title} screenshots`}
      aria-roledescription="carousel"
      className="pcar"
      role="region"
    >
      <div className="pcar__viewport">
        <div className="pcar__track" onKeyDown={onKeyDown} ref={track} tabIndex={0}>
          {plates.map((p, n) => (
            <figure
              aria-label={`${n + 1} of ${plates.length}`}
              aria-roledescription="slide"
              className="pcar__slide"
              key={p.src}
              role="group"
            >
              <img alt={p.alt} decoding="async" loading={n === 0 ? 'eager' : 'lazy'} src={p.src} />
            </figure>
          ))}
        </div>

        <button
          aria-label="Previous image"
          className="pcar__btn pcar__btn--prev"
          disabled={index === 0}
          onClick={() => goTo(index - 1)}
          type="button"
        >
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
        <button
          aria-label="Next image"
          className="pcar__btn pcar__btn--next"
          disabled={index === last}
          onClick={() => goTo(index + 1)}
          type="button"
        >
          <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
      </div>

      <div className="pcar__bar">
        <p aria-live="polite" className="fn-b2 pcar__count">
          {pad(index + 1)} / {pad(plates.length)}
        </p>

        <div className="pcar__dots">
          {plates.map((p, n) => (
            <button
              aria-current={n === index ? 'true' : undefined}
              aria-label={`Show image ${n + 1}`}
              className={`pcar__dot${n === index ? ' is--a' : ''}`}
              key={p.src}
              onClick={() => goTo(n)}
              type="button"
            />
          ))}
        </div>
      </div>

      {caption ? <p className="fn-b2 pcar__caption">{caption}</p> : null}
    </div>
  );
}
