/**
 * Typed access to DATA-PORTO.
 *
 * The JSON under src/data is vendored from the DATA-PORTO repository by
 * `npm run sync-data` — edit it there, not here. This module only gives the
 * records types, resolves the bilingual fields to one locale, and turns asset
 * paths into URLs. It deliberately knows nothing about the page: shaping the
 * data into sections is src/lib/dummy.ts's job.
 */
import awardsJson from '@/data/awards.json';
import contactJson from '@/data/contact.json';
import educationJson from '@/data/education.json';
import experienceJson from '@/data/experience.json';
import profileJson from '@/data/profile.json';
import projectsJson from '@/data/projects';
import publicationsJson from '@/data/publications.json';
import siteConfigJson from '@/data/site-config.json';
import skillsJson from '@/data/skills.json';

/* --------------------------------------------------------------------------
   Locale
   -------------------------------------------------------------------------- */

export type Locale = 'en' | 'id';
export type I18n<T = string> = { en: T; id: T };

/** The site renders one locale; site-config names which. */
export const LOCALE = siteConfigJson.site.defaultLocale as Locale;

/** Read a bilingual field, falling back to English when a side is empty. */
export function t(field: I18n | null | undefined, locale: Locale = LOCALE): string {
  if (!field) return '';
  return field[locale] || field.en || '';
}

/** Same, for bilingual lists. */
export function tl(field: I18n<string[]> | null | undefined, locale: Locale = LOCALE): string[] {
  if (!field) return [];
  return field[locale]?.length ? field[locale] : field.en ?? [];
}

/** DATA-PORTO writes asset paths relative to its root (`assets/...`); the
 *  sync copies that folder under public/, so a leading slash is the URL. */
export const asset = (src: string | null | undefined) => (src ? `/${src.replace(/^\/+/, '')}` : null);

/* --------------------------------------------------------------------------
   Records
   -------------------------------------------------------------------------- */

export type Image = { src: string; width?: number; height?: number; alt: I18n; caption?: I18n | null };

export type Project = {
  id: string;
  title: I18n;
  subtitle: I18n;
  category: string;
  type: string;
  status: string;
  featured: boolean;
  order: number;
  startDate: string;
  endDate: string | null;
  summary: I18n;
  description: I18n;
  role: I18n;
  teamSize: number | null;
  stack: Record<string, string[]>;
  media: { thumbnail: Image | null; gallery: Image[] };
  links: {
    demo: string | null;
    repo: string | null;
    caseStudy: string | null;
    appStore: string | null;
    playStore: string | null;
    article: string | null;
    repoPrivate?: boolean;
  };
  private: boolean;
  privateNote: I18n | null;
};

export type Experience = {
  id: string;
  category: 'work' | 'organisational' | 'other';
  company: { name: I18n; url: string | null };
  position: I18n;
  startDate: string;
  endDate: string | null;
  current: boolean;
  location: { city: string; country: string };
  summary: I18n;
  achievements: I18n<string[]>;
  stack: string[];
  order: number;
};

export type Education = {
  id: string;
  institution: string;
  degree: I18n;
  fieldOfStudy: I18n;
  startDate: string;
  endDate: string | null;
  gpa: { value: number; scale: number } | null;
  location: { city: string };
  order: number;
};

export type Award = {
  id: string;
  title: I18n;
  issuer: string | null;
  date: string;
  rank: I18n;
  url: string | null;
  order: number;
};

export type Publication = {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  volume: string;
  issue: string;
  pages: string;
  publishedAt: string;
  url: string;
  summary: I18n;
  highlights: I18n<string[]>;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
  level: number;
  featured: boolean;
  order: number;
  note: I18n | null;
  yearsOfExperience?: number;
};

export type SkillCategory = { id: string; label: I18n; order: number };

const byOrder = <T extends { order?: number }>(a: T, b: T) => (a.order ?? 999) - (b.order ?? 999);

export const profile = profileJson;
export const contact = contactJson;
export const siteConfig = siteConfigJson;

export const projects = (projectsJson as Project[]).slice().sort(byOrder);
export const experience = (experienceJson.items as Experience[]).slice().sort(byOrder);
export const education = (educationJson.items as Education[]).slice().sort(byOrder);
export const awards = (awardsJson.items as Award[]).slice().sort(byOrder);
export const publications = publicationsJson.items as Publication[];
export const skills = (skillsJson.items as Skill[]).slice().sort(byOrder);
export const skillCategories = (skillsJson.categories as SkillCategory[]).slice().sort(byOrder);

export const socials = contact.socials.slice().sort(byOrder);
export const social = (id: string) => socials.find((s) => s.id === id) ?? null;

/* --------------------------------------------------------------------------
   Formatting
   -------------------------------------------------------------------------- */

const year = (date: string | null) => (date ? date.slice(0, 4) : null);

/** "2024", "2023 — 2024", or "2026 — now" for a record still running. */
export function period(start: string, end: string | null, current = end === null): string {
  const a = year(start);
  const b = current ? 'now' : year(end);
  return !b || a === b ? `${a}` : `${a} — ${b}`;
}

/** The project's first-listed technology, front end before back end. */
export function primaryStack(p: Project): string {
  for (const layer of ['frontend', 'backend', 'database', 'infra', 'tools']) {
    const first = p.stack[layer]?.[0];
    if (first) return first;
  }
  return '';
}

/** Where a project's card should send the reader, if it can go anywhere public. */
export function projectLink(p: Project): string | null {
  if (p.private) return null;
  const { demo, caseStudy, repo, repoPrivate } = p.links;
  return demo ?? caseStudy ?? (repo && !repoPrivate ? repo : null);
}
