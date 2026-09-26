/**
 * Every string and every picture on the site, in one place.
 *
 * This file used to hold placeholder copy for the structural build. It no
 * longer does: the words below are Andi Muhammad Alief Fauzan's, the projects
 * are the nine real ones from PortfolioV3, and the photographs are credited in
 * public/images/photo/_credits.json.
 *
 * The module is still named `dummy` because eight route files import from it;
 * the name is a leftover, the contents are not.
 */

/* --------------------------------------------------------------------------
   Images
   -------------------------------------------------------------------------- */

/** The full-bleed plates. Monochrome architectural and infrastructure work —
 *  desaturated at source so nothing lands outside the palette. */
export const PLATES = {
  hero: '/images/photo/plate-hero.webp',
  statement: '/images/photo/plate-statement.webp',
  process: ['/images/photo/plate-process-1.webp', '/images/photo/plate-process-2.webp'],
};

/** The seventeen square tiles that ride the people band. */
export const BAND = Array.from({ length: 17 }, (_, i) => `/images/photo/band-${String(i + 1).padStart(2, '0')}.webp`);

/** Project screenshots. These stay screenshots — they belong on the work
 *  cards, where the reader is meant to read them, and nowhere else. */
export const IMAGES = [
  '/images/work/arcadeCalc.webp',
  '/images/work/grooth.webp',
  '/images/work/peduliPasal.webp',
  '/images/work/keretaxpress-web.webp',
  '/images/work/keretaxpress-mobile.webp',
  '/images/work/ytSum.webp',
  '/images/work/iot.webp',
];

/** Cycle the pool so every frame gets something. */
export const img = (i: number) => IMAGES[i % IMAGES.length];

/* --------------------------------------------------------------------------
   1 — hero
   -------------------------------------------------------------------------- */

export const HERO = {
  lines: ['Andi Muhammad Alief Fauzan', 'Backend & Cloud Engineering'],
};

/* --------------------------------------------------------------------------
   2 — statement
   -------------------------------------------------------------------------- */

export const STATEMENT = {
  heading: 'Systems that answer quickly, and fail quietly.',
  meta: ['Backend & Cloud', 'Indonesia', 'Open to work'],
};

/* --------------------------------------------------------------------------
   3 — introduction (the about slot)
   -------------------------------------------------------------------------- */

export const INTRO = {
  label: 'Introduction',
  name: 'Andi Muhammad Alief Fauzan',
  role: 'Backend Developer & Cloud Computing Specialist',
  portrait: '/images/profile/foto_alief_hitam.webp',
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

/** The /about route's opening block. */
export const ABOUT = {
  label: 'About',
  body:
    'One developer, working across backend services and the cloud they run on. I take the parts of a product that have to be correct rather than merely present — the contract, the data model, the deploy — and I leave them documented enough that somebody else can own them.',
  columns: [
    { no: '01', heading: 'Backend', items: ['REST API design', 'Go and Node.js services', 'Data modelling', 'Auth and access control'] },
    { no: '02', heading: 'Cloud', items: ['Google Cloud', 'Cloud Run and containers', 'CI/CD pipelines', 'ML model deployment'] },
  ],
};

/* --------------------------------------------------------------------------
   4 — capabilities
   -------------------------------------------------------------------------- */

export const CAPABILITIES = {
  heading: 'Capabilities',
  label: 'Services',
  items: [
    'REST API design and implementation',
    'Services in Go and Node.js',
    'Google Cloud architecture',
    'Containers and CI/CD',
    'Data modelling and migrations',
    'ML model deployment',
  ],
};

/* --------------------------------------------------------------------------
   5 — the service index (the reference's offices directory)

   A flat, scannable list of what I actually build, each row inverting on
   hover. Every entry is something in the nine shipped projects, not a wish.
   -------------------------------------------------------------------------- */

export const INDEX = {
  heading: 'API design, service implementation, container builds, cloud deployment, and the pipelines that keep them honest.',
  label: 'Services',
  rows: [
    { title: 'REST API design', stack: 'Go · Node.js', detail: 'Contract first, versioned, documented' },
    { title: 'Service implementation', stack: 'Go · TypeScript', detail: 'Concurrency where it earns its keep' },
    { title: 'Cloud Run deployment', stack: 'Google Cloud', detail: 'Scale to zero, cold start budgeted' },
    { title: 'Container builds', stack: 'Docker', detail: 'One image, local and production alike' },
    { title: 'CI/CD pipelines', stack: 'Cloud Build · Actions', detail: 'Green before merge, deployed on tag' },
    { title: 'Data modelling', stack: 'PostgreSQL · Firestore', detail: 'Schema before surface, migrations reversible' },
    { title: 'Auth and access control', stack: 'Firebase Auth · IAM', detail: 'Least privilege, checked at the edge' },
    { title: 'Observability', stack: 'Cloud Logging · Monitoring', detail: 'Logs you can query, alerts you trust' },
    { title: 'ML model serving', stack: 'Vertex AI', detail: 'Inference without owning the infrastructure' },
    { title: 'Cross-platform mobile', stack: 'Flutter', detail: 'Both stores when the budget is one developer' },
    { title: 'Front ends for back ends', stack: 'Next.js · React', detail: 'Fast on a bad connection, or it does not ship' },
    { title: 'IoT ingest pipelines', stack: 'Go · Pub/Sub', detail: 'Ordered, buffered, and never silently dropped' },
  ],
};

/* --------------------------------------------------------------------------
   6 — process, two editorial blocks
   -------------------------------------------------------------------------- */

export const PROCESS = [
  {
    heading: ['From Constraint', 'to Contract'],
    lead:
      'Every build starts with the same question: what actually breaks today, for whom, and what is the smallest thing that fixes it.',
    note: 'Approach',
    body:
      'The data model comes before the surface, and the API contract comes before either. Most of the value is in refusing to build the thing that was asked for when a smaller thing solves it.',
  },
  {
    heading: ['From Contract', 'to Production'],
    lead:
      'A service that only runs on my machine is a draft. The same image goes out locally and in production, or the environment is a lie.',
    note: 'Delivery',
    body:
      'Deployed, measured, and left in a state someone else can pick up. A feature only I can operate is not finished.',
  },
];

/* --------------------------------------------------------------------------
   7 — selected work, the nine real projects
   -------------------------------------------------------------------------- */

export const WORK = {
  heading: ['Selected', 'Work'],
  cta: 'See All',
  cards: [
    { title: 'Arcade Team Calculator', metric: 'React', image: '/images/work/arcadeCalc.webp' },
    { title: 'Grooth', metric: 'Node.js', image: '/images/work/grooth.webp' },
    { title: 'PeduliPasal', metric: 'Firebase', image: '/images/work/peduliPasal.webp' },
    { title: 'KeretaXpress Web', metric: 'Tailwind', image: '/images/work/keretaxpress-web.webp' },
    { title: 'KeretaXpress Mobile', metric: 'Supabase', image: '/images/work/keretaxpress-mobile.webp' },
    { title: 'YouTube Summarizer', metric: 'React', image: '/images/work/ytSum.webp' },
    { title: 'IoT Sensor Platform', metric: 'Golang', image: '/images/work/iot.webp' },
    { title: 'ML Cloud Deployment', metric: 'Vertex AI', image: null },
  ],
};

/* --------------------------------------------------------------------------
   8 — the radial diagram
   -------------------------------------------------------------------------- */

export const DIAGRAM = {
  headings: [
    ['Measured, Not', 'Guessed'],
    ['Simple Surfaces,', 'Strict Interiors'],
  ],
  nodes: ['01', '02', '03', '04', '05', '06', '07', '08'],
};

/* --------------------------------------------------------------------------
   9 — practice and process
   -------------------------------------------------------------------------- */

export const PEOPLE = {
  label: ['Practice &', 'Process'],
  heading: ['A practice shaped by', 'real constraints, honest', 'measurement, and code', 'somebody else can own.'],
  marqueeHeading: ['2022', 'First Deploy'],
  columns: [
    'I work in the open, in short cycles, against a target I can measure. Nothing gets called finished because it looks finished.',
    'One developer, nine shipped projects, and a standing rule: if I cannot hand it over with the runbook, it is not done.',
  ],
  stats: [
    { value: '09', label: 'Projects shipped across web, mobile, IoT and ML deployment.' },
    { value: '15', label: 'Certifications, most of them on Google Cloud.' },
    { value: '04', label: 'Years writing code, two of them against production traffic.' },
    { value: '02', label: 'Cloud platforms, one of which I would defend in a review.' },
  ],
};

/* --------------------------------------------------------------------------
   10 — the tools ring (the reference's client logo cloud)
   -------------------------------------------------------------------------- */

export const RING = {
  /** One string; it wraps into five lines at the measure the section sets,
   *  and the line reveal splits it the same way every other heading is split. */
  heading: 'The Tools I Reach For When the Constraint Is Real',
  logos: [
    { src: '/images/stack/typescript.svg', label: 'TypeScript' },
    { src: '/images/stack/go.svg', label: 'Go' },
    { src: '/images/stack/nodedotjs.svg', label: 'Node.js' },
    { src: '/images/stack/googlecloud.svg', label: 'Google Cloud' },
    { src: '/images/stack/docker.svg', label: 'Docker' },
    { src: '/images/stack/kubernetes.svg', label: 'Kubernetes' },
    { src: '/images/stack/postgresql.svg', label: 'PostgreSQL' },
    { src: '/images/stack/firebase.svg', label: 'Firebase' },
    { src: '/images/stack/nextdotjs.svg', label: 'Next.js' },
    { src: '/images/stack/react.svg', label: 'React' },
    { src: '/images/stack/flutter.svg', label: 'Flutter' },
    { src: '/images/stack/dart.svg', label: 'Dart' },
    { src: '/images/stack/javascript.svg', label: 'JavaScript' },
    { src: '/images/stack/cplusplus.svg', label: 'C++' },
    { src: '/images/stack/git.svg', label: 'Git' },
    { src: '/images/stack/github.svg', label: 'GitHub' },
    { src: '/images/stack/linux.svg', label: 'Linux' },
  ],
};

/* --------------------------------------------------------------------------
   11 — contact
   -------------------------------------------------------------------------- */

export const CONTACT = {
  label: 'Contact',
  heading: ['Start a', 'Conversation'],
  body: 'Tell me what you are building and where it hurts. I reply to everything within two working days.',
  cta: 'afindo.mi01@gmail.com',
};

/* --------------------------------------------------------------------------
   12 — footer
   -------------------------------------------------------------------------- */

export const FOOTER = {
  brand: 'ALIEF',
  columns: [
    {
      heading: 'Contact',
      links: [
        { label: 'Email', href: 'mailto:afindo.mi01@gmail.com' },
        { label: 'GitHub', href: 'https://github.com/aliefauzan' },
      ],
    },
    { heading: 'Site', links: [{ label: 'Work', href: '#work' }, { label: 'About', href: '#about' }] },
    {
      heading: 'Elsewhere',
      links: [
        { label: 'LinkedIn', href: 'https://www.linkedin.com/in/andi-muhammad-alief-fauzan' },
        { label: 'Design guide', href: '/styleguide' },
      ],
    },
  ],
  address: ['Indonesia', 'Remote friendly'],
  hours: ['Mon — Fri', '09:00 — 18:00 WIB'],
  meta: ['© 2026', 'Andi Muhammad Alief Fauzan', 'Indonesia'],
};

/* --------------------------------------------------------------------------
   Routes
   -------------------------------------------------------------------------- */

/** Slugged project records — the source for /work and /work/[slug]. */
export const PROJECT_PAGES = [
  {
    title: 'Arcade Team Calculator',
    subtitle: 'Intelligent leaderboard management',
    metric: 'React',
    image: '/images/work/arcadeCalc.webp',
    year: '2025',
    discipline: 'Web',
    summary:
      'Scoring and leaderboard tooling for the Google Cloud Arcade cohort I facilitated. It reads the programme’s badge data, resolves it per participant, and ranks a team without anyone maintaining a spreadsheet.',
  },
  {
    title: 'Grooth',
    subtitle: 'Air-quality route planner',
    metric: 'Node.js',
    image: '/images/work/grooth.webp',
    year: '2024',
    discipline: 'Web',
    summary:
      'Routes scored on air quality rather than distance. The interesting half is the backend: fetching, caching and interpolating sensor readings so a route can be scored without a request per segment.',
  },
  {
    title: 'PeduliPasal',
    subtitle: 'AI-assisted legal information',
    metric: 'Firebase',
    image: '/images/work/peduliPasal.webp',
    year: '2024',
    discipline: 'Product',
    summary:
      'Plain-language answers over Indonesian legal text, with citations back to the article they came from. Retrieval first, generation second — an answer with no source is a liability, not a feature.',
  },
  {
    title: 'KeretaXpress Web',
    subtitle: 'Train ticket booking',
    metric: 'Tailwind',
    image: '/images/work/keretaxpress-web.webp',
    year: '2024',
    discipline: 'Web',
    summary:
      'Search, seat selection and booking for rail travel. Seat inventory is the hard part: two people picking the same seat at the same moment has to resolve to exactly one booking.',
  },
  {
    title: 'KeretaXpress Mobile',
    subtitle: 'Cross-platform booking app',
    metric: 'Supabase',
    image: '/images/work/keretaxpress-mobile.webp',
    year: '2024',
    discipline: 'Mobile',
    summary:
      'The same booking flow on both stores from one Flutter codebase, against the same backend. Offline-tolerant: a ticket already issued stays readable with no connection.',
  },
  {
    title: 'YouTube Summarizer',
    subtitle: 'Video content analysis and Q&A',
    metric: 'React',
    image: '/images/work/ytSum.webp',
    year: '2024',
    discipline: 'Product',
    summary:
      'Transcript in, summary and answerable questions out. Long transcripts are chunked and cached, so a second question about the same video costs nothing.',
  },
  {
    title: 'IoT Sensor Platform',
    subtitle: 'Cloud-native ingest backend',
    metric: 'Golang',
    image: '/images/work/iot.webp',
    year: '2023',
    discipline: 'Infrastructure',
    summary:
      'Device telemetry into a queue, out to storage, with ordering and back-pressure that hold when a fleet reconnects at once. Written in Go because the concurrency story mattered more than the ecosystem.',
  },
  {
    title: 'ML Cloud Deployment',
    subtitle: 'Production model serving',
    metric: 'Vertex AI',
    image: null,
    year: '2025',
    discipline: 'Infrastructure',
    summary:
      'Bangkit capstone work: taking a trained model off a notebook and putting it behind a versioned endpoint with a rollback path, on Vertex AI and Cloud Run.',
  },
].map((p) => ({
  ...p,
  slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  facts: [
    { key: 'Year', value: p.year },
    { key: 'Scope', value: p.discipline },
    { key: 'Stack', value: p.metric },
    { key: 'Status', value: 'Shipped' },
  ],
  gallery: [p.image, PLATES.process[0], PLATES.process[1]].filter(Boolean) as string[],
  href: 'https://github.com/aliefauzan',
}));

export const LEGAL = {
  label: 'Legal',
  heading: 'Terms and privacy',
  blocks: [
    {
      title: 'This site',
      body:
        'A personal portfolio. It collects nothing: no analytics, no cookies, no forms. The only outbound links are to GitHub, LinkedIn and a mailto: address.',
    },
    {
      title: 'Design',
      body:
        'The layout, grid and motion system are a study of kononenkogroup.com, rebuilt from measurement rather than copied assets. The typeface substitution and every other deviation are documented in DEVIATIONS.md.',
    },
    {
      title: 'Photography',
      body:
        'The full-bleed photographs are Unsplash-licensed and credited in public/images/photo/_credits.json. Technology marks are from Simple Icons. Project screenshots and the portrait are my own.',
    },
  ],
};
