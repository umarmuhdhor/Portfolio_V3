/**
 * Placeholder content for the structural build.
 *
 * The point of this pass is the page *shape* — every block from hero to footer
 * in the same order, at the same measure, with the same behaviour. The words
 * and pictures are stand-ins and are meant to be swapped; they are kept here so
 * the swap is one file, not a hunt through nine components.
 */

/** The image pool. Real files so the WebGL layer has something to upload. */
export const IMAGES = [
  '/images/work/arcadeCalc.webp',
  '/images/work/grooth.webp',
  '/images/work/peduliPasal.webp',
  '/images/work/keretaxpress-web.webp',
  '/images/work/keretaxpress-mobile.webp',
  '/images/work/ytSum.webp',
  '/images/work/iot.webp',
];

/** Cycle the pool so every frame on the page gets something. */
export const img = (i: number) => IMAGES[i % IMAGES.length];

export const HERO = {
  lines: ['Studio for', 'Considered Work'],
};

export const STATEMENT = {
  heading: 'We design and build digital products with restraint, clarity and intent.',
  meta: ['Est. 2019', 'Independent', 'Worldwide'],
};

export const ABOUT = {
  label: 'About',
  body:
    'A small team working across brand, product and interface. We take on a limited number of engagements each year so that every one of them gets the attention it needs.',
  columns: [
    { no: '01', heading: 'Discipline', items: ['Brand systems', 'Art direction', 'Editorial'] },
    { no: '02', heading: 'Practice', items: ['Product design', 'Interface', 'Prototyping'] },
  ],
};

export const CAPABILITIES = {
  heading: 'Capabilities',
  label: 'Services',
  items: [
    'Brand identity and systems',
    'Digital product design',
    'Interface and interaction',
    'Design engineering',
    'Motion and WebGL',
    'Art direction',
  ],
};

/** Two editorial blocks, each: heading, full-bleed frame, then a text spread. */
export const PROCESS = [
  {
    heading: ['Clarity before', 'Complexity'],
    lead:
      'Every engagement starts with the same question: what is actually being asked for, and what would it cost to do it properly.',
    note: 'Approach',
    body:
      'We work in the open, in short cycles, with the people who will own the result. Nothing is handed over cold.',
  },
  {
    heading: ['Precision in', 'Development'],
    lead:
      'Design that cannot be built is a drawing. We write the front end ourselves so the thing that ships is the thing that was designed.',
    note: 'Delivery',
    body: 'Measured, tested and documented. A build nobody else can maintain is not finished.',
  },
];

export const WORK = {
  heading: ['Selected', 'Work'],
  cta: 'See All',
  /** Eight cards, matching the reference's cycle. */
  cards: Array.from({ length: 8 }, (_, i) => ({
    title: ['Northwind', 'Atelier Ré', 'Common Field', 'Salt & Stone', 'Meridian', 'Foldwork', 'Halden', 'Verso'][i],
    metric: ['860 m²', '1 180 m²', '2 400 m²', '3 050 m²', '1 640 m²', '720 m²', '2 090 m²', '1 375 m²'][i],
    image: img(i),
  })),
};

/** The radial diagram section — two marquee headings and eight numbered nodes. */
export const DIAGRAM = {
  headings: [
    ['Refined & Bold', 'Essential'],
    ['Simplicity & Clarity', 'of Approach'],
  ],
  nodes: ['01', '02', '03', '04', '05', '06', '07', '08'],
};

export const PEOPLE = {
  label: ['People &', 'Process'],
  heading: ['A studio shaped by', 'clarity, trust, and a', 'collective pursuit of', 'thoughtful design.'],
  marqueeHeading: ['Built on', 'People'],
  columns: [
    'We hire slowly and keep teams small. Everyone who touches the work has their name on it.',
    'Fifteen people across four countries, one shared studio calendar and a standing Thursday review.',
  ],
  stats: [
    { value: '48', label: 'Projects delivered since the studio opened its doors in 2019.' },
    { value: '15', label: 'People across brand, product, engineering and motion.' },
    { value: '04', label: 'Countries, one calendar, and a standing Thursday review.' },
    { value: '09', label: 'Years of practice behind the founding team.' },
  ],
};

export const CONTACT = {
  label: 'Contact',
  heading: ['Start a', 'Conversation'],
  body: 'Tell us what you are working on. We reply to everything within two working days.',
  cta: 'hello@example.com',
};

export const FOOTER = {
  brand: 'STUDIO',
  columns: [
    { heading: 'Contact', links: [{ label: 'Email', href: 'mailto:hello@example.com' }, { label: 'GitHub', href: '#' }] },
    { heading: 'Site', links: [{ label: 'Work', href: '#work' }, { label: 'About', href: '#about' }] },
    { heading: 'Elsewhere', links: [{ label: 'LinkedIn', href: '#' }, { label: 'Design guide', href: '/styleguide' }] },
  ],
  address: ['Amsterdam', 'Remote friendly'],
  hours: ['Mon — Fri', '09:00 — 18:00 CET'],
  meta: ['© 2026', 'Structural placeholder build', 'Worldwide'],
};
