/**
 * Every string and every picture on the site, shaped section by section.
 *
 * The facts come from DATA-PORTO (vendored into src/data by `npm run
 * sync-data`, read through src/lib/porto.ts): the profile, the fifteen
 * projects, experience, education, awards, the publication, and the skills.
 * What is authored here is only the connective copy the data has no field for
 * — section headings and the two process blocks — and each of those restates
 * something the data already says rather than adding a claim of its own.
 *
 * The module is still named `dummy` because the route files import from it;
 * the name is a leftover, the contents are not.
 */
import {
  asset,
  awards,
  contact,
  education,
  experience,
  period,
  primaryStack,
  profile,
  projectLink,
  projects,
  publications,
  siteConfig,
  skillCategories,
  skills,
  social,
  t,
  tl,
  type Project,
} from './porto';

/* --------------------------------------------------------------------------
   Shared
   -------------------------------------------------------------------------- */

const NAME = profile.fullName;
const ROLE = t(profile.role);
const PLACE = `${profile.location.city}, ${profile.location.country}`;
const EMAIL = contact.email;
const STATUS = profile.availability.status === 'open-to-work' ? 'Open to work' : 'Not available';
const CV = asset(contact.resume.src);

const upper = (s: string) => (s === 'ai' ? 'AI' : s.charAt(0).toUpperCase() + s.slice(1));
const pad = (n: number) => String(n).padStart(2, '0');

export const SITE = {
  /** Empty until the site has a domain; metadataBase is skipped until then. */
  url: siteConfig.site.url,
  title: t(siteConfig.site.title),
  description: t(siteConfig.site.description),
  keywords: siteConfig.site.keywords.en,
  favicon: asset(siteConfig.site.favicon),
  ogImage: asset(siteConfig.site.defaultOgImage),
};

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
export const IMAGES = projects.map((p) => asset(p.media.thumbnail?.src)).filter(Boolean) as string[];

/** Cycle the pool so every frame gets something. */
export const img = (i: number) => IMAGES[i % IMAGES.length];

/* --------------------------------------------------------------------------
   1 — hero
   -------------------------------------------------------------------------- */

export const HERO = {
  lines: [NAME, ROLE],
};

/* --------------------------------------------------------------------------
   2 — statement
   -------------------------------------------------------------------------- */

/** The current programme, if one is still running. */
const studying = education.find((e) => !e.endDate || e.endDate >= new Date().toISOString().slice(0, 10));

export const STATEMENT = {
  heading: t(profile.tagline),
  /** The hero already carries the role, so the meta row does not repeat it. */
  meta: [PLACE, studying?.institution, STATUS].filter(Boolean) as string[],
};

/* --------------------------------------------------------------------------
   3 — introduction (the about slot)
   -------------------------------------------------------------------------- */

const featuredSkills = skills.filter((s) => s.featured);

export const INTRO = {
  label: 'Introduction',
  name: NAME,
  role: ROLE,
  portrait: asset(profile.avatar.src),
  body: t(profile.bioLong).split(/\n\n+/),
  meta: [
    { key: 'Based', value: PLACE },
    { key: 'Focus', value: ROLE },
    { key: 'Studying', value: studying ? studying.institution : t(education[0]?.fieldOfStudy) },
    { key: 'Status', value: STATUS },
  ],
  /** Paid work, most recent first. Organisational roles are on /about. */
  experience: experience
    .filter((e) => e.category === 'work')
    .map((e, i) => ({
      no: pad(i + 1),
      period: period(e.startDate, e.endDate, e.current),
      title: t(e.position),
      body: `${t(e.company.name)}. ${t(e.summary)}`,
    })),
  stack: featuredSkills.map((s) => s.name),
};

/** Every experience record, work and otherwise — the /about list. */
export const EXPERIENCE = experience.map((e, i) => ({
  no: pad(i + 1),
  title: t(e.position),
  company: t(e.company.name),
  period: period(e.startDate, e.endDate, e.current),
}));

/* --------------------------------------------------------------------------
   Skills, grouped
   -------------------------------------------------------------------------- */

/** Skills in one category, strongest first: featured, then level, then order. */
const skillsIn = (category: string) =>
  skills
    .filter((s) => s.category === category)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || b.level - a.level || a.order - b.order);

/** Every category that describes technical work — soft skills excluded. */
const techCategories = skillCategories.filter((c) => c.id !== 'soft');

/** The /about route's opening block. */
export const ABOUT = {
  label: 'About',
  body: t(profile.bioShort),
  columns: ['framework', 'ai'].map((id, i) => ({
    no: pad(i + 1),
    heading: t(skillCategories.find((c) => c.id === id)?.label),
    items: skillsIn(id)
      .slice(0, 5)
      .map((s) => s.name),
  })),
};

/* --------------------------------------------------------------------------
   4 — capabilities
   -------------------------------------------------------------------------- */

export const CAPABILITIES = {
  heading: 'Capabilities',
  label: 'Skills',
  items: techCategories.map(
    (c) =>
      `${t(c.label)} — ${skillsIn(c.id)
        .slice(0, 3)
        .map((s) => s.name)
        .join(', ')}`,
  ),
};

/* --------------------------------------------------------------------------
   5 — the skill index (the reference's offices directory)

   A flat, scannable list of the tools behind the projects, each row inverting
   on hover. Featured skills and every skill with a note on where it was used.
   -------------------------------------------------------------------------- */

const LEVEL = ['', 'Familiar', 'Working', 'Proficient', 'Advanced', 'Expert'];

export const INDEX = {
  heading: 'Swift and Flutter on the device, Python and Claude behind it, and the tools that carry both into production.',
  label: 'Skills',
  rows: skills
    .filter((s) => s.category !== 'soft' && (s.featured || s.note))
    .map((s) => ({
      title: s.name,
      stack: t(skillCategories.find((c) => c.id === s.category)?.label),
      detail:
        t(s.note) ||
        (s.yearsOfExperience ? `${s.yearsOfExperience} years · ${LEVEL[s.level]}` : LEVEL[s.level]),
    })),
};

/* --------------------------------------------------------------------------
   6 — process, two editorial blocks
   -------------------------------------------------------------------------- */

const shopify = experience.find((e) => e.id === 'md-fashionwear-ai-automation');

export const PROCESS = [
  {
    heading: ['From Flutter', 'to Swift'],
    lead:
      'Two years of Flutter and Dart — including ABSATA, the attendance system built for staff at Indonesia’s House of Representatives — and now building depth in Swift at the Apple Developer Academy.',
    note: 'Mobile',
    body:
      'Secure login, an informative dashboard, realtime attendance monitoring. At the academy the same care went into ARKit gaze tracking and a watchOS heart-rate companion.',
  },
  {
    heading: ['From Prompt', 'to Pipeline'],
    lead: shopify
      ? t(shopify.summary)
      : 'One supplier link in, one review-ready Shopify draft out.',
    note: 'AI Automation',
    body:
      'The model makes only four judgment calls per product; deterministic Python handles every mechanical step, and a verification gate checks ten rule groups against the real product before a run reports success.',
  },
];

/* --------------------------------------------------------------------------
   7 — selected work, the featured projects
   -------------------------------------------------------------------------- */

const card = (p: Project) => ({
  title: t(p.title),
  subtitle: t(p.subtitle),
  metric: primaryStack(p),
  image: asset(p.media.thumbnail?.src),
  href: `/work/${p.id}`,
});

export const WORK = {
  heading: ['Selected', 'Work'],
  cta: 'See All',
  cards: projects.filter((p) => p.featured).map(card),
};

/* --------------------------------------------------------------------------
   8 — the radial diagram
   -------------------------------------------------------------------------- */

export const DIAGRAM = {
  headings: [
    ['Native on', 'the Device'],
    ['Deterministic', 'Behind the Model'],
  ],
  nodes: ['01', '02', '03', '04', '05', '06', '07', '08'],
};

/* --------------------------------------------------------------------------
   9 — practice and record
   -------------------------------------------------------------------------- */

const degree = education.find((e) => e.gpa);
const paper = publications[0];
/** The headline accuracy figure, read out of the paper's own highlights. */
const paperAccuracy = tl(paper?.highlights, 'en')
  .map((h) => h.match(/(\d+(?:\.\d+)?)%/)?.[1])
  .find(Boolean);
const firstAward = awards.map((a) => a.date).sort()[0];

export const PEOPLE = {
  label: ['Practice &', 'Record'],
  heading: [
    'A practice built on',
    `${awards.length} competition awards,`,
    `a ${degree?.gpa?.value.toFixed(2)} GPA, and a thesis`,
    'published as first author.',
  ],
  marqueeHeading: [firstAward, 'First Medal'],
  columns: [
    'Teaching runs alongside the engineering: assistant lecturer for three classes of 30+ students, and a mathematics YouTube channel past 5,000 subscribers.',
    'An online mathematics competition organised single-handed for more than 1,500 participants, with 100+ questions written and a certificate made for every one of them.',
  ],
  stats: [
    {
      value: pad(projects.length),
      label: 'Projects across iOS, Flutter, the web and AI automation.',
    },
    {
      value: pad(awards.length),
      label: 'National and regional awards in mathematics and programming.',
    },
    {
      value: degree?.gpa ? degree.gpa.value.toFixed(2) : '',
      label: degree ? `GPA, ${t(degree.degree)} in ${t(degree.fieldOfStudy)}, ${degree.institution}.` : '',
    },
    {
      value: paperAccuracy ? `${Math.floor(Number(paperAccuracy))}%` : '',
      label: 'Weighted accuracy classifying Yogyakarta batik motifs, in a first-author journal paper.',
    },
  ].filter((s) => s.value),
};

/* --------------------------------------------------------------------------
   Education, awards, publication — the /about record
   -------------------------------------------------------------------------- */

export const EDUCATION = education.map((e, i) => ({
  no: pad(i + 1),
  title: e.institution,
  detail: [t(e.degree), t(e.fieldOfStudy), e.gpa ? `GPA ${e.gpa.value.toFixed(2)}/${e.gpa.scale.toFixed(2)}` : null]
    .filter(Boolean)
    .join(' · '),
  period: period(e.startDate, e.endDate, false),
}));

export const AWARDS = awards.map((a, i) => ({
  no: pad(i + 1),
  title: t(a.title),
  detail: [a.issuer, a.date].filter(Boolean).join(' · '),
  href: a.url,
}));

export const PUBLICATION = paper
  ? {
      title: paper.title,
      venue: `${paper.venue}, Vol. ${paper.volume} No. ${paper.issue}, pp. ${paper.pages}`,
      authors: paper.authors.join(', '),
      year: paper.publishedAt.slice(0, 4),
      summary: t(paper.summary),
      href: paper.url,
    }
  : null;

/* --------------------------------------------------------------------------
   10 — the tools ring (the reference's client logo cloud)
   -------------------------------------------------------------------------- */

export const RING = {
  /** One string; it wraps into five lines at the measure the section sets,
   *  and the line reveal splits it the same way every other heading is split. */
  heading: 'The Tools Behind Every App, Agent and Pipeline',
  logos: [
    { src: '/images/stack/swift.svg', label: 'Swift' },
    { src: '/images/stack/xcode.svg', label: 'Xcode' },
    { src: '/images/stack/flutter.svg', label: 'Flutter' },
    { src: '/images/stack/dart.svg', label: 'Dart' },
    { src: '/images/stack/python.svg', label: 'Python' },
    { src: '/images/stack/claude.svg', label: 'Claude' },
    { src: '/images/stack/n8n.svg', label: 'n8n' },
    { src: '/images/stack/tensorflow.svg', label: 'TensorFlow' },
    { src: '/images/stack/laravel.svg', label: 'Laravel' },
    { src: '/images/stack/php.svg', label: 'PHP' },
    { src: '/images/stack/react.svg', label: 'React' },
    { src: '/images/stack/firebase.svg', label: 'Firebase' },
    { src: '/images/stack/supabase.svg', label: 'Supabase' },
    { src: '/images/stack/mysql.svg', label: 'MySQL' },
    { src: '/images/stack/figma.svg', label: 'Figma' },
    { src: '/images/stack/git.svg', label: 'Git' },
    { src: '/images/stack/github.svg', label: 'GitHub' },
  ],
};

/* --------------------------------------------------------------------------
   11 — contact
   -------------------------------------------------------------------------- */

export const CONTACT = {
  label: 'Contact',
  heading: ['Start a', 'Conversation'],
  body: `${t(profile.availability.note)} Tell me what you are building — email is the fastest way to reach me.`,
  cta: EMAIL,
};

/* --------------------------------------------------------------------------
   12 — footer
   -------------------------------------------------------------------------- */

const link = (id: string) => {
  const s = social(id);
  return s ? { label: t(s.label), href: s.url } : null;
};

export const FOOTER = {
  brand: profile.displayName.split(' ')[0].toUpperCase(),
  columns: [
    {
      heading: 'Contact',
      links: [{ label: 'Email', href: `mailto:${EMAIL}` }, link('linkedin'), link('github')].filter(Boolean) as {
        label: string;
        href: string;
      }[],
    },
    {
      heading: 'Site',
      links: [
        { label: 'Work', href: '/work' },
        { label: 'About', href: '/about' },
        { label: 'Design guide', href: '/styleguide' },
      ],
    },
    {
      heading: 'Elsewhere',
      links: [link('youtube'), link('instagram'), CV ? { label: 'CV', href: CV } : null].filter(Boolean) as {
        label: string;
        href: string;
      }[],
    },
  ],
  address: [profile.location.city, profile.location.country],
  /** No office hours in the data — the timezone is what a reader needs. */
  hours: [profile.location.timezone, 'WITA · UTC+8'],
  meta: [`© ${new Date().getFullYear()}`, NAME, PLACE],
};

/* --------------------------------------------------------------------------
   Routes
   -------------------------------------------------------------------------- */

const STATUS_LABEL: Record<string, string> = { completed: 'Completed', ongoing: 'Ongoing' };

/** Slugged project records — the source for /work and /work/[slug]. */
export const PROJECT_PAGES = projects.map((p) => {
  const images = [p.media.thumbnail, ...p.media.gallery].filter(Boolean) as NonNullable<
    Project['media']['thumbnail']
  >[];
  const stack = Object.values(p.stack).flat();
  return {
    slug: p.id,
    title: t(p.title),
    subtitle: t(p.subtitle),
    metric: primaryStack(p),
    image: asset(p.media.thumbnail?.src),
    year: p.startDate.slice(0, 4),
    discipline: upper(p.category),
    summary: t(p.summary),
    description: t(p.description).split(/\n\n+/).filter(Boolean),
    privateNote: p.private ? t(p.privateNote) : null,
    facts: [
      { key: 'Year', value: period(p.startDate, p.endDate, p.status === 'ongoing' && !p.endDate) },
      { key: 'Scope', value: `${upper(p.category)} · ${upper(p.type)}` },
      { key: 'Role', value: t(p.role) },
      p.teamSize ? { key: 'Team', value: p.teamSize === 1 ? 'Solo' : `Team of ${p.teamSize}` } : null,
      { key: 'Stack', value: stack.slice(0, 4).join(', ') },
      { key: 'Status', value: STATUS_LABEL[p.status] ?? upper(p.status) },
    ].filter(Boolean) as { key: string; value: string }[],
    gallery: images.map((m) => ({
      src: asset(m.src) as string,
      alt: t(m.alt),
      portrait: !!m.width && !!m.height && m.height > m.width,
    })),
    href: projectLink(p),
  };
});

export const LEGAL = {
  label: 'Legal',
  heading: 'Terms and privacy',
  blocks: [
    {
      title: 'This site',
      body:
        'A personal portfolio. It collects nothing: no analytics, no cookies, no forms. The only outbound links are to project demos, GitHub, LinkedIn, YouTube, Instagram and a mailto: address.',
    },
    {
      title: 'Design',
      body:
        'The layout, grid and motion system are a study of kononenkogroup.com, rebuilt from measurement rather than copied assets. The typeface substitution and every other deviation are documented in DEVIATIONS.md.',
    },
    {
      title: 'Photography',
      body:
        'The full-bleed photographs are Unsplash-licensed and credited in CREDITS.md. Technology marks are from Simple Icons. Project screenshots and the portrait are my own.',
    },
  ],
};
