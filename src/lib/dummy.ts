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

/* --------------------------------------------------------------------------
   Real content — the introduction. Not placeholder.
   -------------------------------------------------------------------------- */

export const INTRO = {
  label: 'Introduction',
  name: 'Andi Muhammad Alief Fauzan',
  role: 'Backend Developer & Cloud Computing Specialist',
  body: [
    'I build the parts of a product people never see and always feel — the API that answers quickly, the pipeline that does not drop a record, the deploy that goes out without anyone holding their breath.',
    'Most of my work sits on Google Cloud. I like problems where the constraint is real: a budget, a latency target, a dataset that will not fit in memory. Those are the ones that make you choose properly instead of reaching for the default.',
  ],
  meta: [
    { key: 'Based', value: 'Indonesia' },
    { key: 'Focus', value: 'Backend & Cloud' },
    { key: 'Studying', value: 'Informatics' },
    { key: 'Status', value: 'Open to work' },
  ],
  /** Experience, most recent first. */
  experience: [
    {
      no: '01',
      period: '2025',
      title: 'Google Cloud Arcade Facilitator',
      body: 'Ran the programme for a cohort of students, and built the leaderboard tooling that scored it.',
    },
    {
      no: '02',
      period: '2024 — 2025',
      title: 'Bangkit Academy — Cloud Computing',
      body: 'Google, GoTo and Traveloka programme. Backend and cloud track, ending in a capstone deployed on Cloud Run.',
    },
    {
      no: '03',
      period: '2024 — now',
      title: 'Informatics undergraduate',
      body: 'Coursework in systems, networks and data, alongside the projects listed under Work.',
    },
    {
      no: '04',
      period: '2022 — now',
      title: 'Freelance and personal projects',
      body: 'Nine shipped projects across web, mobile, IoT and ML deployment. Every one of them is listed.',
    },
  ],
  stack: ['TypeScript', 'Go', 'Node.js', 'Flutter', 'Google Cloud', 'Cloud Run', 'Docker', 'Vertex AI'],
};

/** Slugged project records — the source for /work and /work/[slug]. */
export const PROJECT_PAGES = WORK.cards.map((c, i) => ({
  slug: c.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, ''),
  title: c.title,
  metric: c.metric,
  image: c.image,
  year: String(2019 + (i % 6)),
  discipline: ['Brand', 'Product', 'Interface', 'Editorial'][i % 4],
  summary:
    'A placeholder record standing in for a real case study. The layout, the column spans and the frame heights are measured; the words are not.',
  facts: [
    { key: 'Year', value: String(2019 + (i % 6)) },
    { key: 'Scope', value: ['Brand', 'Product', 'Interface', 'Editorial'][i % 4] },
    { key: 'Area', value: c.metric },
    { key: 'Status', value: 'Delivered' },
  ],
  gallery: [img(i), img(i + 1), img(i + 2)],
}));

export const LEGAL = {
  label: 'Legal',
  heading: 'Terms and privacy',
  blocks: [
    {
      title: 'Placeholder notice',
      body:
        'This page is a structural placeholder. It exists so the route set matches the reference and so the footer link resolves rather than dead-ending.',
    },
    {
      title: 'Content',
      body:
        'Every string on this site outside the introduction is stand-in copy. Nothing here constitutes a real term, policy or agreement.',
    },
  ],
};
