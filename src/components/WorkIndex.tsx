'use client';

import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import WorkGrid, { type Card } from './WorkGrid';
import './work-index.css';

type Filter = { id: string; label: string; count: number };

/**
 * The /work grid with a discipline filter above it.
 *
 * Filtering remounts the grid (keyed by the filter) instead of hiding cards:
 * the stagger is written against nth-child, so hidden cards would still hold
 * their slots and leave holes. A remounted grid restarts the cycle cleanly,
 * and its cards fade up in order. Everything below the grid has moved, so the
 * scroll triggers are re-measured once the new layout has painted.
 */
export default function WorkIndex({ cards, filters }: { cards: (Card & { category: string })[]; filters: Filter[] }) {
  const [active, setActive] = useState('all');
  const changed = useRef(false);

  useEffect(() => {
    if (!changed.current) return;
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [active]);

  const shown = active === 'all' ? cards : cards.filter((c) => c.category === active);
  const options = [{ id: 'all', label: 'All', count: cards.length }, ...filters];

  return (
    <>
      <div aria-label="Filter projects by discipline" className="work-filter" role="group">
        {options.map((f) => (
          <button
            aria-pressed={active === f.id}
            className="work-filter__btn"
            key={f.id}
            onClick={() => {
              changed.current = true;
              setActive(f.id);
            }}
            type="button"
          >
            <span className={`link fn-b1${active === f.id ? ' is--a' : ''}`}>{f.label}</span>
            <sup className="fn-b2 work-filter__count">{f.count}</sup>
          </button>
        ))}
      </div>

      <p aria-live="polite" className="v-hid">
        {shown.length} {shown.length === 1 ? 'project' : 'projects'} shown.
      </p>

      <div className={changed.current ? 'work-index is--filtered' : 'work-index'} key={active}>
        <WorkGrid projects={shown} />
      </div>
    </>
  );
}
