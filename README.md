# Portfolio · Adrian Rostin

[![CI/CD](https://github.com/adrian-rostin/portfolio/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/adrian-rostin/portfolio/actions/workflows/ci-cd.yml)

Persönliche Website unter **[adrianrostin.de](https://adrianrostin.de)**. Eine One-Page-App mit
scrollgesteuerten Animationen und einem 3D-Kopf im Hero, gebaut mit Angular und Tailwind CSS,
statisch vorgerendert und auf einem eigenen Kubernetes-Cluster betrieben.

## Tech-Stack

| Bereich      | Technik                                                                     |
| ------------ | --------------------------------------------------------------------------- |
| Frontend     | Angular 21 (Standalone Components, Signals, OnPush), TypeScript (strict)    |
| Styling      | Tailwind CSS 4, Design-Tokens als CSS-Variablen, selbst gehostete Schriften |
| Rendering    | Static Site Generation (Prerendering) für SEO und Open-Graph-Vorschauen     |
| 3D & Motion  | Three.js mit eigenem Shader, Lenis für weiches Scrollen                     |
| Qualität     | ESLint (typescript-eslint strict, angular-eslint inkl. A11y), Prettier      |
| Auslieferung | nginx (unprivileged, ohne Access-Logs) im Docker-Image                      |
| Betrieb      | Kubernetes (k3s), Traefik Ingress, cert-manager, GitHub Actions, GHCR       |

## Projektstruktur

```
src/app/
├── core/            App-weite Services: SEO-Tags, Smooth Scrolling
├── data/            Alle Inhalte (Texte, Links, Skills) an einem Ort
├── layout/          Navigation
├── pages/           Routen: Startseite und rechtliche Seiten
│   └── legal/       Impressum, Datenschutz, gemeinsames Layout
├── sections/        Abschnitte der Startseite
│   ├── hero/        Hero mit 3D-Porträt (Three.js)
│   ├── about/       Über mich
│   ├── skills/      Tech-Stack
│   └── contact/     Kontakt und Footer
└── shared/ui/       Wiederverwendbare UI-Bausteine (Icons)

scripts/             Generatoren für Vorschaubild und Tiefenkarte
nginx/               Webserver-Konfiguration
k8s/                 Kubernetes-Manifeste (Kustomize)
.github/workflows/   CI/CD-Pipeline
```

Inhalte werden ausschließlich in [`src/app/data/portfolio.data.ts`](src/app/data/portfolio.data.ts)
gepflegt; die Komponenten lesen sie nur aus.

## Entwicklung

Voraussetzung: Node.js 22.12 oder neuer.

```bash
npm install
npm start            # Dev-Server auf http://localhost:4200
```

| Befehl                 | Zweck                                         |
| ---------------------- | --------------------------------------------- |
| `npm run build`        | Produktions-Build nach `dist/portfolio/`      |
| `npm run lint`         | ESLint prüfen (`lint:fix` behebt automatisch) |
| `npm run format`       | Code mit Prettier formatieren                 |
| `npm run format:check` | Formatierung prüfen (wie in der Pipeline)     |

## CI/CD

Jeder Push und jeder Pull Request durchläuft die Pipeline
[`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml):

1. **Format & Lint**: Prettier und ESLint
2. **Build**: Angular-Produktions-Build mit Prerendering
3. **Docker image**: Multi-Stage-Build, auf `main` Push nach `ghcr.io/adrian-rostin/portfolio`
4. **Deploy** (nur `main`): `kubectl apply -k k8s` mit dem Commit-Tag des Images, danach wird auf
   den erfolgreichen Rollout gewartet

Für das Deployment braucht das Repository das Secret `KUBECONFIG` (Klartext oder base64).

## Deployment

Das Image enthält nur die statischen Dateien und einen nginx, der ohne Root-Rechte läuft. Im Cluster
läuft es im Namespace `portfolio` mit zwei Replikas, schreibgeschütztem Dateisystem, ohne zusätzliche
Linux-Capabilities und mit Health-Checks. TLS-Zertifikate stellt cert-manager über Let's Encrypt aus.

```bash
kubectl apply -k k8s
kubectl -n portfolio rollout status deployment/portfolio
```

## Datenschutz

Die Seite setzt keine Cookies, nutzt kein Tracking und lädt keine Ressourcen von Drittanbietern.
Schriften sind über [Fontsource](https://fontsource.org) gebündelt, nginx schreibt keine Access-Logs.
Die Domain läuft über den Cloudflare-Proxy; das ist in der Datenschutzerklärung beschrieben.

## Assets neu erzeugen

**Vorschaubild** für LinkedIn & Co. (`public/images/og-image.png`):

```bash
npm run og-image -- "Adrian" "Rostin" "SOFTWARE ENGINEER · PORTFOLIO"
```

**Tiefenkarte** für den 3D-Kopf (`public/images/portrait-depth.png`). Sie wird lokal mit dem Modell
_Depth Anything V2_ berechnet, das Foto verlässt dabei den Rechner nicht:

```bash
npm install --no-save @huggingface/transformers@4.3.1
npm run portrait-depth
```

## Lizenz

Der Quellcode steht zur Ansicht bereit. Texte, Fotos und das Porträt sind urheberrechtlich geschützt
und dürfen nicht weiterverwendet werden. Schriften: SIL Open Font License 1.1.
