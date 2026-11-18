import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  type ElementRef,
  HostListener,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { type Project, type ProjectImage, projects } from '../../data/portfolio.data';
import { SmoothScroll } from '../../core/smooth-scroll';
import { Icon } from '../../shared/ui/icon';

/** Eine Kachel in der Collage mit ihren Parallax-Werten. */
interface Piece {
  el: HTMLElement;
  /** Wie stark die Kachel seitlich voreilt/nachzieht (klein = ruhig, groß = fliegt weit). */
  fx: number;
  /** Leichter vertikaler Versatz. */
  fy: number;
  /** Grund-Deckkraft (Hauptbild 1, kleine Bilder etwas gedämpft). */
  base: number;
}

interface Scene {
  el: HTMLElement;
  left: number;
  width: number;
  pieces: Piece[];
}

/**
 * „Projekte“: pro Projekt eine Collage – ein großes Hauptbild in der Mitte, drumherum mehrere kleine,
 * bewusst zweitrangige Bilder mit kurzer Beschriftung (Vorbild: landonorris.com). Beim Scrollen bleibt
 * der Abschnitt stehen, die Collagen laufen seitwärts, und die kleinen Bilder fliegen dabei von rechts
 * herein (Parallax). Der Hintergrund blendet von Creme (erstes Projekt noch auf Weiß) bis ins Dunkle
 * über, wo direkt der Tech-Stack anschließt. Ohne JavaScript oder bei „Bewegung reduzieren“ läuft es als
 * normale horizontale Scrollleiste (Wischen) auf dunklem Grund. Klick auf ein Bild öffnet die Details.
 */
@Component({
  selector: 'app-projects',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', '[class.pinned]': 'pinned()', '[style.--proj-fg]': 'projFg()' },
  styles: `
    :host {
      display: block;
      --scene-w: min(1180px, 88vw);
      /* Schriftfarbe der Beschriftungen; kippt mit dem Hintergrund (Skript setzt den Wert) */
      --proj-fg: var(--pf-ink);
    }

    /* Ohne JS: native horizontale Scrollleiste (unsichtbar), mit Wischen bedienbar */
    .viewport {
      overflow-x: auto;
      overflow-y: hidden;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      scroll-snap-type: x proximity;
    }
    .viewport::-webkit-scrollbar {
      display: none;
    }
    .track {
      position: relative;
      display: flex;
      align-items: center;
      /* Zwischenraum zwischen den Projekten – sehr knapp, damit sie dicht beieinander stehen */
      gap: clamp(6px, 0.8vw, 20px);
      /* seitliche Polster so, dass die erste und letzte Collage mittig stehen */
      padding-inline: calc((100vw - var(--scene-w)) / 2);
      width: max-content;
      min-height: 100svh;
    }
    /* Mit JS (ohne „Bewegung reduzieren“): Abschnitt bleibt stehen, Collagen wandern per transform */
    :host(.pinned) .viewport {
      position: sticky;
      top: 0;
      height: 100svh;
      overflow: hidden;
      display: flex;
      align-items: center;
      scroll-snap-type: none;
    }
    :host(.pinned) .track {
      flex: 0 0 auto;
      min-height: 0;
      will-change: transform;
    }

    .scene {
      position: relative;
      flex: 0 0 auto;
      width: var(--scene-w);
      height: min(88svh, 760px);
      scroll-snap-align: center;
    }

    .piece {
      position: absolute;
      display: flex;
      flex-direction: column;
      gap: 7px;
      padding: 0;
      border: 0;
      background: none;
      cursor: pointer;
      color: inherit;
      will-change: transform, opacity;
    }
    .piece.small {
      opacity: 0.9;
    }
    .cap {
      font-family: var(--font-mono);
      font-size: clamp(10px, 0.8vw, 12px);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--proj-fg);
      opacity: 0.66;
      transition: color 0.4s ease;
      white-space: nowrap;
    }
    .frame {
      flex: 1;
      overflow: hidden;
      border-radius: 12px;
      /* Das Elternteil .piece ist per will-change eine eigene Compositing-Ebene; dann versagt in
         Chrome das Runden über overflow+border-radius (untere Ecken bleiben eckig). clip-path klippt
         zuverlässig – auch auf einer Compositing-Ebene. */
      clip-path: inset(0 round 12px);
      background: var(--pf-paper-raised);
      border: 1px solid rgb(255 255 255 / 0.07);
      box-shadow: 0 16px 40px -22px rgb(0 0 0 / 0.45);
      transition:
        transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1),
        box-shadow 0.5s ease;
    }
    .piece img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
      display: block;
      user-select: none;
    }
    .piece.phone img {
      object-fit: contain;
      background: #0e0d0b;
    }
    .piece.main {
      z-index: 3;
    }
    .piece.small {
      z-index: 1;
    }
    @media (hover: hover) {
      .piece:hover {
        z-index: 6;
      }
      .piece:hover .frame {
        transform: scale(1.035);
        box-shadow: 0 28px 56px -22px rgb(0 0 0 / 0.6);
      }
      .piece.small:hover {
        opacity: 1 !important;
      }
    }
    .piece:focus-visible {
      outline: 2px solid var(--pf-accent);
      outline-offset: 4px;
      z-index: 7;
    }

    /* Hauptbild: Verlauf + Titel */
    .main .scrim {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to top,
        rgb(10 9 8 / 0.92) 0%,
        rgb(10 9 8 / 0.58) 34%,
        rgb(10 9 8 / 0.04) 70%
      );
    }
    .m-content {
      position: absolute;
      inset: auto 0 0 0;
      padding: clamp(16px, 2vw, 30px);
      display: flex;
      flex-direction: column;
      gap: 7px;
    }
    .m-index {
      color: var(--pf-accent);
    }
    .m-title {
      font-family: var(--font-display);
      font-weight: 600;
      line-height: 0.96;
      letter-spacing: -0.03em;
      font-size: clamp(28px, 3vw, 52px);
      color: #fff;
    }
    .m-tag {
      max-width: 34ch;
      font-size: clamp(13px, 1vw, 16px);
      line-height: 1.4;
      color: rgb(255 255 255 / 0.85);
    }
    .cta {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
      font-weight: 600;
      color: var(--pf-accent);
      transition: gap 0.3s ease;
    }
    .main:hover .cta {
      gap: 12px;
    }

    /* ---------- Platzierungen (Desktop): Hauptbild mittig, kleine Bilder außen herum ---------- */
    .scene .main {
      left: 31%;
      top: 17%;
      width: 38%;
      height: 59%;
    }

    .scene.altsetter .s0 {
      left: 3%;
      top: 13%;
      width: 15%;
      height: 50%;
    }
    .scene.altsetter .s1 {
      left: 83%;
      top: 11%;
      width: 12%;
      height: 48%;
    }
    .scene.altsetter .s2 {
      left: 70%;
      top: 65%;
      width: 24%;
      height: 22%;
    }
    .scene.altsetter .s3 {
      left: 6%;
      top: 70%;
      width: 23%;
      height: 15%;
    }

    .scene.monitoring .s0 {
      left: 5%;
      top: 15%;
      width: 19%;
      height: 13%;
    }
    .scene.monitoring .s1 {
      left: 73%;
      top: 11%;
      width: 23%;
      height: 20%;
    }
    .scene.monitoring .s2 {
      left: 74%;
      top: 61%;
      width: 23%;
      height: 20%;
    }
    .scene.monitoring .s3 {
      left: 4%;
      top: 63%;
      width: 23%;
      height: 18%;
    }
    .scene.monitoring .s4 {
      left: 31%;
      top: 83%;
      width: 28%;
      height: 14%;
    }

    /* ---------- Platzierungen (schmal / Handy) ---------- */
    @media (max-width: 820px) {
      :host {
        --scene-w: 92vw;
      }
      .scene {
        height: min(82svh, 700px);
      }
      .m-title {
        font-size: clamp(24px, 7vw, 38px);
      }
      .cap {
        font-size: 10px;
      }

      .scene .main {
        left: 21%;
        top: 11%;
        width: 58%;
        height: 40%;
      }

      .scene.altsetter .s0 {
        left: 0;
        top: 8%;
        width: 19%;
        height: 30%;
      }
      .scene.altsetter .s1 {
        left: 81%;
        top: 17%;
        width: 18%;
        height: 34%;
      }
      .scene.altsetter .s2 {
        left: 6%;
        top: 58%;
        width: 46%;
        height: 20%;
      }
      .scene.altsetter .s3 {
        left: 56%;
        top: 60%;
        width: 40%;
        height: 13%;
      }

      .scene.monitoring .main {
        left: 15%;
        top: 9%;
        width: 70%;
        height: 38%;
      }
      .scene.monitoring .s0 {
        left: 2%;
        top: 52%;
        width: 30%;
        height: 11%;
      }
      .scene.monitoring .s1 {
        left: 35%;
        top: 52%;
        width: 30%;
        height: 15%;
      }
      .scene.monitoring .s2 {
        left: 69%;
        top: 52%;
        width: 29%;
        height: 15%;
      }
      .scene.monitoring .s3 {
        left: 6%;
        top: 72%;
        width: 42%;
        height: 15%;
      }
      .scene.monitoring .s4 {
        left: 52%;
        top: 74%;
        width: 44%;
        height: 14%;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .frame {
        transition: none;
      }
    }

    /* ---- Detail-Fenster ---- */
    .overlay {
      position: fixed;
      inset: 0;
      z-index: 80;
      display: flex;
      justify-content: center;
      align-items: flex-end;
    }
    @media (min-width: 768px) {
      .overlay {
        align-items: center;
        padding: 24px;
      }
    }
    .backdrop {
      position: absolute;
      inset: 0;
      appearance: none;
      border: 0;
      padding: 0;
      cursor: default;
      background: rgb(6 5 4 / 0.74);
      -webkit-backdrop-filter: blur(7px);
      backdrop-filter: blur(7px);
      animation: fade 0.4s ease;
    }
    /* Deutlich größeres Fenster; das Hauptbild wächst beim Öffnen dazu (Animation in open()). */
    .sheet {
      position: relative;
      width: min(1040px, 100%);
      max-height: 94svh;
      display: flex;
      flex-direction: column;
      background: var(--pf-paper);
      border: 1px solid rgb(255 255 255 / 0.1);
      border-radius: 22px 22px 0 0;
      overflow: hidden;
      box-shadow: 0 -24px 70px -24px rgb(0 0 0 / 0.72);
    }
    @media (min-width: 768px) {
      .sheet {
        border-radius: 22px;
        box-shadow: 0 44px 100px -28px rgb(0 0 0 / 0.75);
      }
    }
    .sheet-scroll {
      overflow-y: auto;
      overscroll-behavior: contain;
    }
    /* Liquid-Glass-Knopf (wie die Navigations-Pille): Blur, Sättigung, Glanzkante */
    .close {
      position: absolute;
      top: 16px;
      right: 16px;
      z-index: 3;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      border-radius: 9999px;
      cursor: pointer;
      color: #fff;
      border: 0;
      isolation: isolate;
      background: rgb(23 21 18 / 0.3);
      -webkit-backdrop-filter: blur(14px) saturate(1.7);
      backdrop-filter: blur(14px) saturate(1.7);
      box-shadow:
        inset 0 1px 0 rgb(255 255 255 / 0.25),
        inset 0 -1px 1px rgb(255 255 255 / 0.06),
        0 10px 26px -12px rgb(0 0 0 / 0.55);
      transition:
        background-color 0.3s ease,
        transform 0.3s ease;
    }
    /* Glanzkante: oben links hell, unten rechts schwächer */
    .close::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(
        140deg,
        rgb(255 255 255 / 0.55),
        rgb(255 255 255 / 0.1) 35%,
        rgb(255 255 255 / 0.05) 65%,
        rgb(255 255 255 / 0.35)
      );
      -webkit-mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);
      -webkit-mask-composite: xor;
      mask:
        linear-gradient(#000 0 0) content-box exclude,
        linear-gradient(#000 0 0);
      pointer-events: none;
    }
    .close:hover {
      background: rgb(23 21 18 / 0.5);
    }
    @media (hover: hover) {
      .close:hover {
        transform: scale(1.06);
      }
    }
    /* Banner oben: das Hauptbild, mit der Überschrift darin */
    .banner {
      position: relative;
      flex: none;
      height: clamp(210px, 36svh, 380px);
      background: var(--pf-paper-raised);
    }
    .banner img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 32%;
      display: block;
    }
    .banner-scrim {
      position: absolute;
      inset: 0;
      background: linear-gradient(
        to top,
        rgb(10 9 8 / 0.9) 0%,
        rgb(10 9 8 / 0.5) 36%,
        rgb(10 9 8 / 0.06) 74%
      );
    }
    .banner-title {
      position: absolute;
      inset: auto 0 0 0;
      margin: 0;
      padding: clamp(20px, 3vw, 44px) clamp(22px, 4vw, 48px);
      font-family: var(--font-display);
      font-weight: 600;
      line-height: 0.95;
      letter-spacing: -0.03em;
      font-size: clamp(38px, 6vw, 72px);
      color: #fff;
    }
    .sheet-body {
      padding: clamp(22px, 4vw, 48px);
    }
    .links-row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .gallery {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-top: 22px;
    }
    .gallery img {
      width: 100%;
      border-radius: 8px;
      border: 1px solid rgb(255 255 255 / 0.08);
      display: block;
    }
    .gallery img.span {
      grid-column: 1 / -1;
    }
    @media (prefers-reduced-motion: reduce) {
      .backdrop {
        animation: none;
      }
    }
    @keyframes fade {
      from {
        opacity: 0;
      }
    }
  `,
  template: `
    <section
      #scroller
      id="projekte"
      class="scroller relative"
      [style.height.px]="pinned() ? trackH() : null"
    >
      <div #viewport class="viewport">
        <div #track class="track">
          @for (p of projects; track p.id) {
            <div [class]="'scene ' + p.id">
              @for (img of p.cluster; track img.src; let i = $index) {
                <button
                  type="button"
                  [class]="'piece small s' + i + (img.shape === 'phone' ? ' phone' : '')"
                  (click)="open(p, $event)"
                  [attr.aria-label]="'Details zu ' + p.name"
                >
                  @if (img.caption) {
                    <span class="cap">{{ img.caption }}</span>
                  }
                  <span class="frame">
                    <img
                      [src]="img.src"
                      [alt]="img.alt"
                      loading="lazy"
                      decoding="async"
                      draggable="false"
                    />
                  </span>
                </button>
              }
              <button
                type="button"
                class="piece main"
                (click)="open(p, $event)"
                [attr.aria-label]="'Details zu ' + p.name"
              >
                <span class="frame">
                  <img
                    [src]="p.hero.src"
                    [alt]="p.hero.alt"
                    loading="lazy"
                    decoding="async"
                    draggable="false"
                  />
                  <span class="scrim" aria-hidden="true"></span>
                  <span class="m-content">
                    <span class="m-title">{{ p.name }}</span>
                    <span class="m-tag">{{ p.tagline }}</span>
                    <span class="cta"
                      >Mehr erfahren <app-icon name="arrow-up-right" class="size-[18px]"
                    /></span>
                  </span>
                </span>
              </button>
            </div>
          }
        </div>
      </div>
    </section>

    @if (active(); as p) {
      <div class="overlay" role="dialog" aria-modal="true" [attr.aria-label]="p.name">
        <button type="button" class="backdrop" aria-label="Schließen" (click)="close()"></button>
        <div #sheet class="sheet">
          <button #closeBtn type="button" class="close" (click)="close()" aria-label="Schließen">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              class="size-5"
            >
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
          <div class="sheet-scroll" data-lenis-prevent>
            <!-- Banner: das Hauptbild mit der Überschrift darin -->
            <div class="banner">
              <img [src]="p.hero.src" [alt]="p.hero.alt" decoding="async" draggable="false" />
              <span class="banner-scrim" aria-hidden="true"></span>
              <h3 class="banner-title">{{ p.name }}</h3>
            </div>

            <div class="sheet-body">
              <!-- Repo / Live Demo -->
              <div class="links-row">
                @for (link of p.links; track link.url) {
                  <a
                    class="btn h-11"
                    [class.btn-primary]="link.icon === 'arrow-up-right' && $first"
                    [href]="link.url"
                    target="_blank"
                    rel="noopener"
                  >
                    <app-icon [name]="link.icon" class="size-[18px]" />{{ link.label }}
                  </a>
                }
              </div>

              <!-- Tech-Stack -->
              <h4 class="label mt-8 mb-3 text-ink-muted">Tech-Stack</h4>
              <div class="grid gap-4 sm:grid-cols-2">
                @for (group of p.tech; track group.label) {
                  <div>
                    <span class="mb-2 block text-[13px] font-medium text-ink-muted">{{
                      group.label
                    }}</span>
                    <div class="flex flex-wrap gap-2">
                      @for (item of group.items; track item) {
                        <span class="chip">{{ item }}</span>
                      }
                    </div>
                  </div>
                }
              </div>

              <!-- Beschreibung -->
              <h4 class="label mt-8 mb-3 text-ink-muted">Über das Projekt</h4>
              @for (para of p.summary; track $index) {
                <p class="mt-0 mb-4 max-w-[64ch] leading-relaxed">{{ para }}</p>
              }

              <!-- Highlights -->
              <h4 class="label mt-6 mb-3 text-ink-muted">Highlights</h4>
              <ul class="m-0 grid list-none gap-2 p-0">
                @for (f of p.features; track $index) {
                  <li class="flex gap-3 leading-relaxed">
                    <span class="mt-[9px] size-1.5 shrink-0 rounded-full bg-accent"></span>{{ f }}
                  </li>
                }
              </ul>

              <!-- Eindrücke -->
              <h4 class="label mt-8 mb-3 text-ink-muted">Eindrücke</h4>
              <div class="gallery">
                @for (img of gallery(p); track img.src) {
                  <img
                    [src]="img.src"
                    [alt]="img.alt"
                    [class.span]="img.shape !== 'phone'"
                    loading="lazy"
                    decoding="async"
                  />
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class Projects {
  protected readonly projects = projects;
  protected readonly active = signal<Project | null>(null);
  protected readonly pinned = signal(false);
  /** Höhe des festgehaltenen Bereichs (Bildschirm + horizontaler Weg); per Binding, überlebt Re-Render. */
  protected readonly trackH = signal(0);
  /** Schriftfarbe der Beschriftungen (kippt mit dem Hintergrund); per Host-Binding. */
  protected readonly projFg = signal<string | null>(null);

  private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');
  private readonly viewport = viewChild.required<ElementRef<HTMLElement>>('viewport');
  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly closeBtn = viewChild<ElementRef<HTMLButtonElement>>('closeBtn');

  private readonly smooth = inject(SmoothScroll);
  private readonly doc = inject(DOCUMENT);
  private trigger: HTMLElement | null = null;
  /** Rechteck des angeklickten Bildes – das Fenster wächst beim Öffnen daraus hervor. */
  private originRect: DOMRect | null = null;

  constructor() {
    const destroyRef = inject(DestroyRef);
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    afterNextRender(() => {
      const win = this.doc.defaultView;
      if (!win) return;
      // Bei „Bewegung reduzieren“ bleibt die native seitliche Scrollleiste; der Grund bleibt dunkel.
      if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const root = this.doc.documentElement;
      const CREAM = [241, 235, 226]; // --pf-ink (helle Fläche)
      const DARK = [23, 21, 18]; // --pf-paper (dunkle Fläche)
      const INK = '#171512'; // dunkle Schrift auf hellem Grund
      const PAPER = '#f1ebe2'; // helle Schrift auf dunklem Grund
      const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
      const smoothstep = (t: number) => t * t * (3 - 2 * t);
      const mix = (a: number[], b: number[], k: number) =>
        `rgb(${a.map((c, i) => Math.round(c + (b[i] - c) * k)).join(' ')})`;

      // Kacheln je Szene einsammeln und ihre Parallax-Stärke festlegen. Wird neu eingesammelt, falls
      // Angular die Elemente beim Hydrieren austauscht (sonst zeigen die Refs ins Leere).
      const collect = (): Scene[] =>
        Array.from(this.track().nativeElement.querySelectorAll<HTMLElement>('.scene')).map((el) => {
          let s = 0;
          const pieces: Piece[] = Array.from(el.querySelectorAll<HTMLElement>('.piece')).map(
            (pe) => {
              if (pe.classList.contains('main')) {
                return { el: pe, fx: 0.05, fy: 0, base: 1 };
              }
              // kleine Bilder fliegen unterschiedlich weit → lebendige Staffelung
              const fx = 0.12 + (s % 3) * 0.05;
              const fy = (s % 2 === 0 ? -1 : 1) * 0.015;
              s += 1;
              return { el: pe, fx, fy, base: 0.9 };
            },
          );
          return { el, left: el.offsetLeft, width: el.offsetWidth, pieces };
        });

      let scenes: Scene[] = [];
      let maxX = 0;
      const measure = () => {
        maxX = Math.max(0, this.track().nativeElement.scrollWidth - win.innerWidth);
        // Höhe als Signal → Angular setzt sie auch nach einem Re-Render wieder aufs echte Element.
        this.trackH.set(Math.round(win.innerHeight + maxX));
        scenes = collect();
      };

      this.pinned.set(true);

      let raf = 0;
      let lastFg = '';
      const render = () => {
        raf = 0;
        const scroller = this.scroller().nativeElement;
        const track = this.track().nativeElement;
        const rect = scroller.getBoundingClientRect();
        const total = scroller.offsetHeight - win.innerHeight;
        if (total <= 0) return;
        const p = clamp(-rect.top / total, 0, 1); // 0..1 nur für Hintergrund/Beschriftung
        // Eine einzige, durchgehende lineare Bewegung: der Abschnitt kommt von rechts herein
        // (rect.top > 0), läuft mittig durch (rect.top = 0 → erstes Projekt zentriert, = -maxX →
        // zweites zentriert) und zieht nach links wieder hinaus (rect.top < -maxX). Überall dieselbe
        // Geschwindigkeit → kein Ruckler; Ein- und Ausgang ergeben sich von selbst.
        const translateX = rect.top;
        const near = rect.bottom > 0 && rect.top < win.innerHeight;
        if (near) {
          track.style.transform = `translate3d(${translateX.toFixed(2)}px, 0, 0)`;
          // Nach einem Element-Tausch (Hydration) die Kachel-Refs neu holen.
          if (!scenes.length || !scenes[0].el.isConnected) scenes = collect();
          // Parallax: kleine Bilder eilen voraus / ziehen nach → sie fliegen von rechts herein.
          const vw = win.innerWidth;
          const vwCenter = vw / 2;
          for (const sc of scenes) {
            const d = (translateX + sc.left + sc.width / 2 - vwCenter) / vw;
            const fade = clamp(1 - Math.abs(d) * 0.5, 0, 1);
            for (const pc of sc.pieces) {
              const tx = d * pc.fx * vw;
              const ty = d * pc.fy * vw;
              pc.el.style.transform = `translate3d(${tx.toFixed(1)}px, ${ty.toFixed(1)}px, 0)`;
              pc.el.style.opacity = (pc.base * (0.45 + 0.55 * fade)).toFixed(3);
            }
          }
        }
        // Hintergrund von Creme nach Dunkel über den ganzen Lauf – etwas später starten, damit das
        // erste Projekt noch deutlich auf Weiß steht.
        const k = smoothstep(clamp((p - 0.06) / 0.9, 0, 1));
        root.style.setProperty('--after-about-bg', mix(CREAM, DARK, k));
        // Beschriftungen kippen mittig von dunkler auf helle Schrift (per Signal → Host-Binding)
        const fg = k >= 0.5 ? PAPER : INK;
        if (fg !== lastFg) {
          this.projFg.set(fg);
          lastFg = fg;
        }
      };
      const onScroll = () => {
        raf ||= win.requestAnimationFrame(render);
      };

      // Mehrfach messen (über ein paar Frames), damit ein Hydration-Tausch der Elemente aufgeholt wird.
      let tries = 0;
      const initMeasure = () => {
        measure();
        render();
        if (++tries < 6) win.requestAnimationFrame(initMeasure);
      };
      win.requestAnimationFrame(initMeasure);
      win.addEventListener('scroll', onScroll, { passive: true });
      win.addEventListener('resize', measure);
      const ro = new ResizeObserver(() => {
        measure();
        render();
      });
      ro.observe(this.viewport().nativeElement);

      destroyRef.onDestroy(() => {
        win.removeEventListener('scroll', onScroll);
        win.removeEventListener('resize', measure);
        win.cancelAnimationFrame(raf);
        ro.disconnect();
        root.style.removeProperty('--after-about-bg');
        this.smooth.resume();
      });
    });
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close();
  }

  open(project: Project, ev?: Event): void {
    const t = ev?.currentTarget;
    this.trigger = t instanceof HTMLElement ? t : null;
    // Rechteck des angeklickten Bildes merken – daraus wächst das Fenster hervor.
    const frame = this.trigger?.querySelector('.frame') ?? this.trigger;
    this.originRect = frame?.getBoundingClientRect() ?? null;
    this.active.set(project);
    this.smooth.stop();
    // Nach dem Rendern den Schließen-Knopf fokussieren (Tastatur/Screenreader)
    queueMicrotask(() => this.closeBtn()?.nativeElement.focus());
    this.animateOpen();
  }

  close(): void {
    if (!this.active()) return;
    const win = this.doc.defaultView;
    const sheet = this.doc.querySelector<HTMLElement>('.sheet');
    const backdrop = this.doc.querySelector<HTMLElement>('.backdrop');
    const origin = this.originRect;
    let done = false;
    const finish = (): void => {
      if (done) return;
      done = true;
      this.active.set(null);
      this.smooth.resume();
      this.trigger?.focus();
      this.trigger = null;
      this.originRect = null;
    };
    if (!win || !sheet || !origin || win.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }
    // Umgekehrt zum Öffnen: Das Fenster schrumpft zurück in Lage und Größe des angeklickten Bildes.
    const last = sheet.getBoundingClientRect();
    const scale = Math.min(origin.width / last.width, origin.height / last.height);
    const dx = origin.left + origin.width / 2 - (last.left + last.width / 2);
    const dy = origin.top + origin.height / 2 - (last.top + last.height / 2);
    const anim = sheet.animate(
      [
        { transform: 'none', opacity: 1, offset: 0 },
        { opacity: 1, offset: 0.45 },
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0, offset: 1 },
      ],
      { duration: 360, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' },
    );
    backdrop?.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 360,
      easing: 'ease',
      fill: 'forwards',
    });
    anim.onfinish = finish;
    anim.oncancel = finish;
    win.setTimeout(finish, 460); // Sicherheitsnetz, falls das Ende nicht meldet
  }

  protected gallery(p: Project): ProjectImage[] {
    return [p.hero, ...p.images];
  }

  /** Öffnen: Das Fenster startet in Größe und Lage des angeklickten Bildes und wächst von dort auf. */
  private animateOpen(): void {
    const win = this.doc.defaultView;
    const origin = this.originRect;
    if (!win || !origin) return;
    if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let tries = 0;
    const run = (): void => {
      const sheet = this.doc.querySelector<HTMLElement>('.sheet');
      const last = sheet?.getBoundingClientRect();
      if (!sheet || !last?.width) {
        // Fenster noch nicht gerendert → kurz später erneut versuchen.
        if (++tries < 12) win.setTimeout(run, 16);
        return;
      }
      const scale = Math.min(origin.width / last.width, origin.height / last.height);
      const dx = origin.left + origin.width / 2 - (last.left + last.width / 2);
      const dy = origin.top + origin.height / 2 - (last.top + last.height / 2);
      sheet.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(${scale})`, opacity: 0, offset: 0 },
          { opacity: 1, offset: 0.4 },
          { transform: 'none', opacity: 1, offset: 1 },
        ],
        { duration: 480, easing: 'cubic-bezier(0.22, 0.8, 0.26, 1)' },
      );
    };
    // Microtask: läuft nach Angulars Change Detection, aber noch vor dem Paint → kein Aufblitzen.
    queueMicrotask(run);
  }
}
