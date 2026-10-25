/**
 * Alle Inhalte der Seite an einem Ort. Texte, Links und Skills werden hier gepflegt,
 * die Komponenten lesen sie nur aus.
 */

export interface SkillGroup {
  title: string;
  icon: 'languages' | 'frameworks' | 'infra' | 'tools';
  items: string[];
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
  /** Leer = GitHub wird nirgends angezeigt. Später einfach den Profil-Link eintragen. */
  github: '',
  linkedin: 'https://www.linkedin.com/in/adrian-rostin',
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

export const skills: SkillGroup[] = [
  {
    title: 'Sprachen',
    icon: 'languages',
    items: ['Java', 'Python', 'Go', 'TypeScript', 'JavaScript', 'SQL'],
  },
  {
    title: 'Frameworks',
    icon: 'frameworks',
    items: ['Spring Boot', 'Angular', 'React', 'FastAPI'],
  },
  {
    title: 'Infrastruktur & Betrieb',
    icon: 'infra',
    items: [
      'Linux',
      'Docker',
      'Docker Compose',
      'Kubernetes',
      'Rancher',
      'Proxmox',
      'Containerisierung',
      'Microservices',
      'Monitoring',
      'Uptime Kuma',
      'SNMP',
    ],
  },
  {
    title: 'Werkzeuge & CI/CD',
    icon: 'tools',
    items: [
      'Git',
      'GitLab CI',
      'GitHub',
      'Maven',
      'Vite',
      'Jira',
      'Confluence',
      'Postman',
      'IntelliJ IDEA',
    ],
  },
];

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
