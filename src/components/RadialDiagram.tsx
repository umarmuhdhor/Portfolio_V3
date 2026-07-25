'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DURATION, EASE_NAME, prefersReducedMotion, registerEase } from '@/lib/ease';
import { DIAGRAM } from '@/lib/dummy';

const SIZE = 864;
const C = SIZE / 2;
const PETALS = 8;

/**
 * The radial diagram — eight petals drawn as SVG arcs, with eight numbered
 * nodes sitting on the ring.
 *
 * Each petal is two quarter-circle arcs meeting at the centre and at the rim,
 * so the shape is built from geometry rather than a traced path. The whole
 * group turns with scroll progress and the petals draw themselves in on
 * entry — under `prefers-reduced-motion` it renders complete and still.
 */
function petalPath(index: number): string {
  const step = (Math.PI * 2) / PETALS;
  const a0 = index * step;
  const a1 = a0 + step;
  const r = C * 0.72;
  const p0 = [C + Math.cos(a0) * r, C + Math.sin(a0) * r];
  const p1 = [C + Math.cos(a1) * r, C + Math.sin(a1) * r];
  // Two arcs bowed toward the rim, meeting at the centre — a leaf shape.
  return `M${C},${C} A${r},${r} 0 0 1 ${p0[0].toFixed(2)},${p0[1].toFixed(2)} A${r},${r} 0 0 1 ${p1[0].toFixed(2)},${p1[1].toFixed(2)} Z`;
}

export default function RadialDiagram() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;

    registerEase();
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const paths = el.querySelectorAll<SVGPathElement>('path');
      const group = el.querySelector<SVGGElement>('g');
      const nodes = el.querySelectorAll<HTMLElement>('.radial__node');

      paths.forEach((p) => {
        const len = p.getTotalLength();
        gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      });
      gsap.set(nodes, { opacity: 0 });

      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          gsap.to(paths, { strokeDashoffset: 0, duration: DURATION.image, ease: EASE_NAME, stagger: 0.06 });
          gsap.to(nodes, { opacity: 1, duration: DURATION.color, ease: EASE_NAME, stagger: 0.04, delay: 0.3 });
        },
      });

      // The ring turns with scroll rather than on a timer, so the motion is
      // tied to the reader's pace.
      if (group) {
        ScrollTrigger.create({
          trigger: el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          onUpdate: (self) => gsap.set(group, { rotate: self.progress * 90, transformOrigin: '50% 50%' }),
        });
      }
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div className="radial" ref={root}>
      <div className="radial__nodes">
        {DIAGRAM.nodes.map((n, i) => {
          const angle = (i / PETALS) * Math.PI * 2 - Math.PI / 2;
          const r = 46; // percent of the box, keeps the nodes on the rim
          return (
            <span
              className="radial__node fn-b2"
              key={n}
              style={{
                left: `${50 + Math.cos(angle) * r}%`,
                top: `${50 + Math.sin(angle) * r}%`,
              }}
            >
              {n}
            </span>
          );
        })}
      </div>

      <svg aria-hidden="true" className="radial__svg" viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <g>
          {Array.from({ length: PETALS }, (_, i) => (
            <path d={petalPath(i)} fill="none" key={i} stroke="#000" strokeWidth="1" />
          ))}
        </g>
      </svg>
    </div>
  );
}
