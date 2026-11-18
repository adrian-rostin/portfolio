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

export const nav = [
  { label: 'Über mich', fragment: 'ueber-mich' },
  { label: 'Projekte', fragment: 'projekte' },
  { label: 'Skills', fragment: 'skills' },
];

/** Ein Bild in der Projekt-Galerie. `phone` steht für Hochformat (schmale Kachel). */
export interface ProjectImage {
  src: string;
  alt: string;
  shape?: 'wide' | 'phone';
  /** Kurzes Etikett über der Kachel im seitlichen Lauf (z. B. „3D-Körper“). */
  caption?: string;
}

/** Ein weiterführender Link zum Projekt (Live-Seite, Repository, API …). */
export interface ProjectLink {
  label: string;
  url: string;
  /** Icon: `arrow-up-right` für externe Seiten, `github` fürs Repository. */
  icon: 'arrow-up-right' | 'github';
}

/** Eine Gruppe im Tech-Stack des Projekts (z. B. „Backend“ mit mehreren Einträgen). */
export interface TechGroup {
  label: string;
  items: string[];
}

export interface Project {
  id: string;
  /** Laufende Nummer als Label über dem Titel (z. B. „01“). */
  index: string;
  name: string;
  /** Ein Satz unter dem Titel auf dem Hauptbild. */
  tagline: string;
  /** Hauptbild (groß, mit Titel) – Mittelpunkt der Projekt-Collage. */
  hero: ProjectImage;
  /** Weitere große Bilder fürs Detail-Fenster (Galerie). */
  images: ProjectImage[];
  /** Kleine Bilder, die im seitlichen Lauf um das Hauptbild gruppiert werden. */
  cluster: ProjectImage[];
  /** Ausführlicher Text im Detail-Fenster (ein Eintrag = ein Absatz). */
  summary: string[];
  /** Stichpunkte im Detail-Fenster. */
  features: string[];
  /** Tech-Stack, nach Bereichen gruppiert. */
  tech: TechGroup[];
  links: ProjectLink[];
}

/**
 * Projekte für den seitlich scrollenden Abschnitt. Bilder liegen unter
 * `public/images/projects/`. Reihenfolge der Kacheln: erst `images`, dann `hero`.
 */
export const projects: Project[] = [
  {
    id: 'altsetter',
    index: '01',
    name: 'Altsetter',
    tagline: 'Übungsfinder fürs Gym: Muskel am 3D-Körper antippen, passende Übung finden.',
    hero: {
      src: '/images/projects/altsetter-hero.webp',
      alt: 'Altsetter: der anatomische 3D-Körper in der Dreiviertel-Ansicht.',
    },
    images: [
      {
        src: '/images/projects/altsetter-3d.webp',
        alt: 'Altsetter: anatomischer 3D-Körper mit allen Muskeln, frei drehbar.',
      },
      {
        src: '/images/projects/altsetter-desktop.webp',
        alt: 'Altsetter am Desktop: ausgewählter Muskel und Übung mit Tipps und häufigen Fehlern.',
      },
      {
        src: '/images/projects/altsetter-exercises.webp',
        alt: 'Altsetter: Brust ausgewählt, daneben die Übungsliste mit Tipps und Fehlern.',
      },
      {
        src: '/images/projects/altsetter-mobile.webp',
        alt: 'Altsetter am Handy: ausgewählte Schulter mit der Übungsliste als Panel.',
        shape: 'phone',
      },
    ],
    cluster: [
      {
        src: '/images/projects/altsetter-3d.webp',
        alt: 'Anatomischer 3D-Körper mit allen Muskeln.',
        caption: '3D-Körper',
      },
      {
        src: '/images/projects/altsetter-mobile.webp',
        alt: 'Altsetter am Handy mit ausgewähltem Muskel.',
        shape: 'phone',
        caption: 'Mobile Ansicht',
      },
      {
        src: '/images/projects/altsetter-desktop.webp',
        alt: 'Altsetter am Desktop.',
        caption: 'Am Desktop',
      },
      {
        src: '/images/projects/alt-card.webp',
        alt: 'Übungskarte „Cable Flys auf der Schrägbank“ mit Tipps.',
        caption: 'Übungskarte',
      },
    ],
    summary: [
      'Das Gerät ist besetzt oder jemand in der Gruppe mag eine Übung nicht. Dann braucht man schnell eine Alternative für denselben Muskel. Genau dafür ist Altsetter da. Man tippt am 3D-Körper einfach den Muskel an und bekommt sofort passende Übungen, jede mit Schwierigkeit, Equipment, Tipps und den häufigsten Fehlern.',
      'Der 3D-Körper läuft direkt im Browser und hat 86 Muskeln, die man drehen und heranzoomen kann. Die Übungen liefert eine eigene API, die sie aus einer Datenbank liest. Alles läuft containerisiert auf meinem Cluster.',
    ],
    features: [
      '3D-Körper mit 86 Muskeln, die Kamera fährt automatisch zum gewählten Muskel',
      '142 Übungen mit Schwierigkeit, Equipment, Tipps und häufigen Fehlern',
      'Eigene API liefert die Übungen aus einer Datenbank',
      'Zweisprachig Deutsch und Englisch',
      'Läuft containerisiert auf einem Kubernetes-Cluster',
    ],
    tech: [
      { label: 'Frontend', items: ['Angular', 'Three.js', 'TypeScript', 'Tailwind'] },
      { label: 'API', items: ['Java', 'Spring Boot', 'OpenAPI'] },
      { label: 'Datenbank', items: ['PostgreSQL'] },
      { label: 'Betrieb', items: ['Docker', 'Kubernetes', 'GitHub Actions'] },
    ],
    links: [
      { label: 'Live ansehen', url: 'https://altsetter.adrianrostin.de', icon: 'arrow-up-right' },
      { label: 'Frontend', url: 'https://github.com/adrian-rostin/altsetter', icon: 'github' },
      { label: 'API', url: 'https://github.com/adrian-rostin/altsetter-api', icon: 'github' },
    ],
  },
  {
    id: 'monitoring',
    index: '02',
    name: 'Cluster-Monitoring',
    tagline:
      'Monitoring für meinen Cluster: Metriken, Logs, Dashboards und Alerts, alles als Code.',
    hero: {
      src: '/images/projects/monitoring-overview.webp',
      alt: 'Grafana-Dashboard der Altsetter-API: Verfügbarkeit, Requests/s, Latenz und Status.',
    },
    images: [
      {
        src: '/images/projects/monitoring-jvm.webp',
        alt: 'Grafana: JVM-Heap, Threads, DB-Connection-Pool (HikariCP) und Pod-Restarts.',
      },
    ],
    cluster: [
      {
        src: '/images/projects/mon-up.webp',
        alt: 'Verfügbarkeit: beide Altsetter-API-Pods sind UP.',
        caption: 'Verfügbarkeit',
      },
      {
        src: '/images/projects/mon-uri.webp',
        alt: 'Requests pro Sekunde nach URI.',
        caption: 'Requests/s',
      },
      {
        src: '/images/projects/mon-status.webp',
        alt: 'Requests pro Sekunde nach HTTP-Status.',
        caption: 'Nach Status',
      },
      {
        src: '/images/projects/mon-threads.webp',
        alt: 'JVM-Threads der Altsetter-API.',
        caption: 'JVM-Threads',
      },
      {
        src: '/images/projects/mon-hikari.webp',
        alt: 'DB-Connection-Pool (HikariCP).',
        caption: 'DB-Pool',
      },
    ],
    summary: [
      'Ein eigener Monitoring-Stack für meinen Server. Prometheus sammelt laufend Messwerte, zum Beispiel wie schnell die Altsetter-API antwortet und wie oft Fehler auftreten. Loki sammelt die Logs ein. In Grafana sehe ich alles auf einen Blick in Dashboards, und wenn etwas aus dem Ruder läuft, meldet sich Alertmanager.',
      'Alles ist als Code beschrieben und versioniert, also jederzeit nachvollziehbar und reproduzierbar. Datenschutz ist eingebaut: Zugriffslogs werden gar nicht erst gespeichert, und aus den übrigen Logs werden vorher IP-Adressen und Suchbegriffe entfernt.',
    ],
    features: [
      'Prometheus für Metriken, Loki für Logs, Grafana für die Dashboards',
      'Alertmanager meldet sich, wenn ein Wert aus dem Rahmen fällt',
      'Eigenes Dashboard für die Altsetter-API: Antwortzeiten, Fehler und Auslastung',
      'Alles als Code beschrieben und versioniert',
      'Datensparsam: keine IP-Adressen und keine Suchbegriffe in den Logs',
    ],
    tech: [
      { label: 'Metriken', items: ['Prometheus'] },
      { label: 'Logs', items: ['Loki', 'Alloy'] },
      { label: 'Visualisierung', items: ['Grafana', 'Alertmanager'] },
      { label: 'Betrieb', items: ['Kubernetes'] },
    ],
    links: [
      {
        label: 'Repository',
        url: 'https://github.com/adrian-rostin/cluster-monitoring',
        icon: 'github',
      },
    ],
  },
];
