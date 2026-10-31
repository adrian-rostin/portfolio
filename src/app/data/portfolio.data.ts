/**
 * Alle Inhalte der Seite an einem Ort. Texte, Links und Skills werden hier gepflegt,
 * die Komponenten lesen sie nur aus.
 */

import type { TechLogo } from './tech-logos';

export interface Skill {
  name: string;
  /** Logo der Technologie; fehlt es, steht ein neutrales Monogramm in `color` (z. B. Spring, dessen Logo Broadcom vorbehalten ist). */
  logo?: TechLogo;
  /** Farbe für Monogramm und Hover-Tönung, wenn es kein Logo gibt. */
  color?: string;
}

export const site = {
  /** Öffentliche Adresse der Seite – wichtig für Vorschaubilder auf LinkedIn & Co. (ohne / am Ende). */
  url: 'https://adrianrostin.de',
  title: 'Adrian Rostin',
  description:
    'Backend-Entwickler aus Wiesbaden: Java, Spring Boot, REST-APIs und Deployment mit Kubernetes. Drei Jahre Praxis bei der Deutschen Telekom.',
  ogImage: '/images/og-image.png',
  locale: 'de_DE',
};

export const profile = {
  firstName: 'Adrian',
  lastName: 'Rostin',
  initials: 'A. Rostin',
  role: 'Software Engineer',
  location: 'Wiesbaden, Deutschland',
  email: 'mail@adrianrostin.de',
  /** Profil-Links; ein leerer Eintrag blendet den Knopf überall aus. */
  github: 'https://github.com/adrian-rostin',
  linkedin: 'https://www.linkedin.com/in/adrian-rostin',
  xing: 'https://www.xing.com/profile/Adrian_Rostin',
  /** Freigestelltes Porträt (transparenter Hintergrund). */
  portrait: '/images/portrait.webp',
  /**
   * Tiefenkarte zum Porträt (hell = nah), lokal mit der KI Depth Anything V2 berechnet.
   * Daraus wird im Hero der 3D-Kopf geformt. Bei neuem Foto neu erzeugen (siehe README).
   */
  portraitDepth: '/images/portrait-depth.png',
  /** Kurzvorstellung im Hero; `strong` wird hervorgehoben. */
  intro: [
    { text: 'Backend-Entwickler mit Schwerpunkt auf ' },
    { text: 'Java', strong: true },
    { text: ' und ' },
    { text: 'Spring Boot', strong: true },
    { text: '. Ich kümmere mich auch um alles, was danach kommt, und bringe meine Services mit ' },
    { text: 'Docker', strong: true },
    { text: ' und ' },
    { text: 'Kubernetes', strong: true },
    { text: ' in Produktion.' },
  ],
  statement:
    'Ich entwickle Backend-Services und APIs, die zuverlässig laufen. Vom ersten Commit bis zum Deployment in Kubernetes.',
  statementAccent: ['zuverlässig', 'Kubernetes.'],
};

/** Profil-Knöpfe (Hero, Kontakt, Fußzeile) mit dem Logo des jeweiligen Dienstes; leere Links fallen weg. */
export const profileLinks = [
  { label: 'LinkedIn', icon: 'linkedin', url: profile.linkedin },
  { label: 'GitHub', icon: 'github', url: profile.github },
  { label: 'Xing', icon: 'xing', url: profile.xing },
].filter((p) => p.url);

/** Tech-Stack: erst der Schwerpunkt, dann der Rest. Logos siehe tech-logos.ts. */
export const skills: { focus: Skill[]; more: Skill[] } = {
  focus: [
    { name: 'Java', logo: 'java' },
    { name: 'Spring Boot', color: '#6DB33F' },
    { name: 'Docker', logo: 'docker' },
    { name: 'Kubernetes', logo: 'kubernetes' },
  ],
  more: [
    { name: 'Python', logo: 'python' },
    { name: 'Go', logo: 'go' },
    { name: 'TypeScript', logo: 'typescript' },
    { name: 'JavaScript', logo: 'javascript' },
    { name: 'Angular', logo: 'angular' },
    { name: 'React', logo: 'react' },
    { name: 'FastAPI', logo: 'fastapi' },
    { name: 'Git', logo: 'git' },
  ],
};

/** Angaben für Impressum und Datenschutzerklärung. */
export const legal = {
  name: 'Adrian Rostin',
  street: 'Klosterbergweg 8',
  city: '65399 Kiedrich',
  country: 'Deutschland',
  email: 'mail@adrianrostin.de',
  /** Zuständige Datenschutz-Aufsichtsbehörde (Wohnsitz in Hessen). */
  authority: {
    name: 'Der Hessische Beauftragte für Datenschutz und Informationsfreiheit',
    url: 'https://datenschutz.hessen.de',
  },
  updated: 'Oktober 2026',
};

export const nav = [
  { label: 'Über mich', fragment: 'ueber-mich' },
  { label: 'Skills', fragment: 'skills' },
  { label: 'Kontakt', fragment: 'kontakt' },
];
