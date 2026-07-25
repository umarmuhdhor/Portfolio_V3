/**
 * All page content, in one place.
 *
 * Everything here comes from PortfolioV3 — the nine projects and their stacks
 * from ProjectGallery.tsx, the bio and meta from the about and experience
 * components. Nothing is invented; where a project has no screenshot the card
 * renders in the empty-frame state rather than borrowing an image.
 */

export type Project = {
  title: string;
  subtitle: string;
  /** Replaces the reference's m² metric — the primary stack for this project. */
  metric: string;
  image: string | null;
  href: string | null;
};

/** The nine projects, in the order they appear in V3. */
export const PROJECTS: Project[] = [
  {
    title: 'Arcade Team Calculator',
    subtitle: 'Intelligent Leaderboard Management System',
    metric: 'Next.js · TypeScript',
    image: '/images/work/arcadeCalc.webp',
    href: 'https://github.com/aliefauzan',
  },
  {
    title: 'Grooth',
    subtitle: 'Smart Air Quality Route Planner',
    metric: 'Next.js · Node.js',
    image: '/images/work/grooth.webp',
    href: 'https://github.com/aliefauzan',
  },
  {
    title: 'PeduliPasal',
    subtitle: 'AI-Powered Legal Information Platform',
    metric: 'Cloud Run · Vertex AI',
    image: '/images/work/peduliPasal.webp',
    href: 'https://github.com/aliefauzan',
  },
  {
    title: 'KeretaXpress Web',
    subtitle: 'Modern Train Ticket Booking Platform',
    metric: 'React · Next.js',
    image: '/images/work/keretaxpress-web.webp',
    href: 'https://github.com/aliefauzan',
  },
  {
    title: 'KeretaXpress Mobile',
    subtitle: 'Cross-Platform Mobile Booking App',
    metric: 'Flutter · Cloud Run',
    image: '/images/work/keretaxpress-mobile.webp',
    href: 'https://github.com/aliefauzan',
  },
  {
    title: 'YouTube Summarizer & QnA',
    subtitle: 'AI-Powered Video Content Analysis',
    metric: 'TypeScript · Next.js',
    image: '/images/work/ytSum.webp',
    href: 'https://github.com/aliefauzan',
  },
  {
    title: 'IoT Sensor Data Platform',
    subtitle: 'Cloud-Native IoT Backend Infrastructure',
    metric: 'Go · C++ · ESP8266',
    image: '/images/work/iot.webp',
    href: 'https://github.com/aliefauzan',
  },
  {
    title: 'ML Cloud Deployment Platform',
    subtitle: 'Production ML Infrastructure',
    metric: 'Vertex AI · TensorFlow',
    image: null,
    href: 'https://github.com/aliefauzan',
  },
  {
    title: 'Backend with Google Cloud',
    subtitle: 'Cloud-Native Backend Application',
    metric: 'Cloud Run · Node.js',
    image: null,
    href: 'https://github.com/aliefauzan',
  },
];

/** Section 2 — the two service columns. */
export const SERVICES = [
  {
    heading: 'Backend',
    items: ['REST API design', 'Node.js & Go services', 'NoSQL and relational data', 'Auth and access control', 'Testing and observability'],
  },
  {
    heading: 'Cloud & Infra',
    items: ['Google Cloud Platform', 'Cloud Run and containers', 'CI/CD pipelines', 'Infrastructure as code', 'ML model deployment'],
  },
];

/** Section 3 — the about meta block and manifesto. */
export const ABOUT = {
  meta: [
    { key: 'Based', value: 'Indonesia' },
    { key: 'Focus', value: 'Backend & Cloud' },
    { key: 'Studying', value: 'Informatics' },
    { key: 'Status', value: 'Open to work' },
  ],
  manifesto: [
    'I build the parts of a product people never see and always feel — the API that answers quickly, the pipeline that does not drop a record, the deploy that goes out without anyone holding their breath.',
    'Most of my work sits on Google Cloud. I like problems where the constraint is real: a budget, a latency target, a dataset that will not fit in memory. Those are the ones that make you choose properly instead of reaching for the default.',
  ],
};

/** Section 4 — capabilities, and the meta column beside them. */
export const CAPABILITIES = {
  groups: [
    { heading: 'Languages', items: ['TypeScript', 'Go', 'JavaScript', 'Dart', 'C++', 'SQL'] },
    { heading: 'Platform', items: ['Google Cloud', 'Cloud Run', 'Firebase', 'Docker', 'Vertex AI'] },
  ],
  meta: [
    { key: 'Education', value: 'Informatics undergraduate' },
    { key: 'Programme', value: 'Bangkit Academy — Cloud Computing' },
    { key: 'Location', value: 'Indonesia · remote friendly' },
    { key: 'Availability', value: 'Open to internships and freelance' },
  ],
};

/** Section 5 — the process spread. */
export const PROCESS = {
  heading: 'How the work goes',
  steps: [
    {
      no: '01',
      title: 'Problem',
      body: 'Before any code, what actually breaks today and for whom. Most of the value is in refusing to build the thing that was asked for when a smaller thing solves it.',
    },
    {
      no: '02',
      title: 'Design',
      body: 'Data model first, then the surface. Boundaries drawn where they will need to move later, not where they are convenient now.',
    },
    {
      no: '03',
      title: 'Ship',
      body: 'Deployed, measured, and left in a state someone else can pick up. A feature that only I can operate is not finished.',
    },
  ],
};

/** Section 7 — the numbered principles list, 01 through 08. */
export const PRINCIPLES = [
  { no: '01', title: 'TypeScript', body: 'Types as the first test. Most bugs never reach a runtime.' },
  { no: '02', title: 'Go', body: 'For services where the concurrency story matters more than the ecosystem.' },
  { no: '03', title: 'Google Cloud', body: 'Cloud Run, Cloud Functions, Firestore. Managed until managed stops paying.' },
  { no: '04', title: 'Docker', body: 'The same image locally and in production, or the environment is a lie.' },
  { no: '05', title: 'Next.js', body: 'Where a backend needs a front, and the front needs to be fast on a bad connection.' },
  { no: '06', title: 'Flutter', body: 'One codebase to both stores when the budget is one developer.' },
  { no: '07', title: 'Vertex AI', body: 'Model serving without owning the serving infrastructure.' },
  { no: '08', title: 'Git', body: 'History as documentation. A commit that needs explaining was written badly.' },
];

/** Section 8 — headline stats. */
export const STATS = [
  { value: '9', label: 'Projects shipped' },
  { value: '15+', label: 'Certifications' },
  { value: '4', label: 'Years writing code' },
  { value: '2', label: 'Cloud platforms' },
];

/** Section 9 — the logo wall. */
export const LOGOS = [
  { src: '/images/logos/gcp-foundations.webp', alt: 'Google Cloud Computing Foundations' },
  { src: '/images/logos/bangkit-linkedin.webp', alt: 'Bangkit Academy' },
  { src: '/images/logos/arcade-linkedin.webp', alt: 'Google Cloud Arcade' },
  { src: '/images/logos/telkom-linkedin.webp', alt: 'Telkom Indonesia' },
];

/** Section 10 — footer. */
export const FOOTER = {
  columns: [
    {
      heading: 'Elsewhere',
      links: [
        { label: 'GitHub', href: 'https://github.com/aliefauzan' },
        { label: 'LinkedIn', href: 'https://www.linkedin.com/in/andi-muhammad-alief-fauzan' },
        { label: 'Email', href: 'mailto:afindo.mi01@gmail.com' },
      ],
    },
    {
      heading: 'Site',
      links: [
        { label: 'Work', href: '#work' },
        { label: 'About', href: '#about' },
        { label: 'Design system', href: '/styleguide' },
      ],
    },
  ],
  address: ['Indonesia', 'Remote friendly'],
  hours: ['Mon — Fri', '09:00 — 18:00 WIB'],
};

export const NAME = 'Andi Muhammad Alief Fauzan';
export const TAGLINE = 'Backend Developer & Cloud Computing Specialist';
