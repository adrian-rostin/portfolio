import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  type ElementRef,
  PLATFORM_ID,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { nav, profile } from '../data/portfolio.data';
import { createDisplacementMap, supportsRefraction } from '../shared/ui/liquid-glass';

interface LinkBox {
  left: number;
  width: number;
}

/**
 * Minimale Kopfzeile: Name links, mittig eine Glas-Pille mit den Sprungmarken.
 * Ein „Linsen“-Highlight gleitet zum aktiven bzw. überfahrenen Menüpunkt.
 */
@Component({
  selector: 'app-site-nav',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    /* --fg: Schriftfarbe, --tint: Glasfärbung; beides kippt über hellen Flächen */
    .glass {
      --fg: 241 235 226;
      --tint: 23 21 18;
      --tint-a: 0.42;
      background: rgb(var(--tint) / var(--tint-a));
      transition: background-color 0.35s ease;
      -webkit-backdrop-filter: blur(14px) saturate(1.7);
      backdrop-filter: blur(14px) saturate(1.7);
      box-shadow:
        inset 0 1px 0 rgb(255 255 255 / 0.22),
        inset 0 -1px 1px rgb(255 255 255 / 0.06),
        0 12px 32px -12px rgb(0 0 0 / 0.55);
    }
    /* Echte Lichtbrechung an der Kante (nur Chromium) */
    .glass.refract {
      --tint-a: 0.32;
      backdrop-filter: url(#nav-glass) blur(1.5px) saturate(1.8) brightness(1.04);
    }
    /* Glanzkante: oben links hell, unten rechts schwächer */
    .glass::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      padding: 1px;
      background: linear-gradient(
        140deg,
        rgb(255 255 255 / 0.5),
        rgb(255 255 255 / 0.08) 35%,
        rgb(255 255 255 / 0.04) 65%,
        rgb(255 255 255 / 0.3)
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
    .glass.light {
      --fg: 23 21 18;
      --tint: 255 255 255;
      --tint-a: 0.4;
    }
    .glass.light.refract {
      --tint-a: 0.28;
    }
    .link {
      color: rgb(var(--fg) / 0.68);
      transition: color 0.3s ease;
    }
    .link:hover,
    .link.on {
      color: rgb(var(--fg));
    }
    .lens {
      position: absolute;
      top: 4px;
      bottom: 4px;
      left: 0;
      border-radius: 9999px;
      background: rgb(var(--fg) / 0.12);
      box-shadow:
        inset 0 1px 0 rgb(255 255 255 / 0.3),
        inset 0 0 0 1px rgb(255 255 255 / 0.06);
      transition:
        transform 0.5s cubic-bezier(0.3, 1.35, 0.5, 1),
        width 0.5s cubic-bezier(0.3, 1.35, 0.5, 1),
        opacity 0.25s ease;
    }
    @media (prefers-reduced-motion: reduce) {
      .lens {
        transition: opacity 0.2s ease;
      }
    }
  `,
  template: `
    <!-- Name: Differenz-Mischung, damit er auf dunklen und hellen Flächen lesbar bleibt -->
    <div
      class="pointer-events-none fixed inset-x-0 top-0 z-50 hidden mix-blend-difference sm:block"
    >
      <div class="mx-auto flex h-[72px] max-w-[1240px] items-center px-4 md:px-8">
        <a
          routerLink="/"
          fragment="top"
          class="pointer-events-auto font-display text-lg leading-none tracking-tight text-[#f1ebe2]"
          >{{ profile.firstName }} {{ profile.lastName }}</a
        >
      </div>
    </div>

    <nav
      class="pointer-events-none fixed inset-x-0 top-0 z-50 flex h-[72px] items-center justify-center"
      aria-label="Hauptnavigation"
    >
      <div
        #pill
        class="glass pointer-events-auto relative flex items-center rounded-full p-1"
        [class.refract]="refract()"
        [class.light]="onLight()"
        (mouseleave)="hovered.set(-1)"
      >
        <span
          class="lens"
          aria-hidden="true"
          [class.opacity-0]="!lens()"
          [style.width.px]="lens()?.width ?? 0"
          [style.transform]="'translateX(' + (lens()?.left ?? 0) + 'px)'"
        ></span>
        @for (item of nav; track item.fragment) {
          <a
            #link
            routerLink="/"
            [fragment]="item.fragment"
            class="link relative rounded-full px-3 py-2 text-[13px] font-medium tracking-[0.01em] sm:px-4 sm:text-sm"
            [class.on]="$index === highlighted()"
            [attr.aria-current]="$index === active() ? 'location' : null"
            (mouseenter)="hovered.set($index)"
            (focus)="hovered.set($index)"
            (blur)="hovered.set(-1)"
            >{{ item.label }}</a
          >
        }
      </div>
    </nav>

    @if (refract()) {
      <svg class="absolute size-0" aria-hidden="true">
        <filter
          id="nav-glass"
          x="0"
          y="0"
          [attr.width]="size().w"
          [attr.height]="size().h"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feImage
            [attr.href]="map()"
            x="0"
            y="0"
            [attr.width]="size().w"
            [attr.height]="size().h"
            preserveAspectRatio="none"
            result="map"
          />
          <!-- Rot, Grün und Blau leicht unterschiedlich stark brechen → feiner Farbsaum am Rand -->
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale="26"
            xChannelSelector="R"
            yChannelSelector="G"
            result="dr"
          />
          <feColorMatrix in="dr" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale="29"
            xChannelSelector="R"
            yChannelSelector="G"
            result="dg"
          />
          <feColorMatrix in="dg" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            scale="32"
            xChannelSelector="R"
            yChannelSelector="G"
            result="db"
          />
          <feColorMatrix in="db" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
          <feBlend in="r" in2="g" mode="screen" result="rg" />
          <feBlend in="rg" in2="b" mode="screen" />
        </filter>
      </svg>
    }
  `,
})
export class SiteNav {
  protected readonly nav = nav;
  protected readonly profile = profile;
  protected readonly refract = signal(false);
  protected readonly size = signal({ w: 1, h: 1 });
  protected readonly map = signal('');
  protected readonly hovered = signal(-1);
  protected readonly active = signal(-1);
  protected readonly onLight = signal(false);
  protected readonly highlighted = computed(() =>
    this.hovered() >= 0 ? this.hovered() : this.active(),
  );

  protected readonly lens = computed<LinkBox | undefined>(() => this.boxes()[this.highlighted()]);

  private readonly boxes = signal<LinkBox[]>([]);
  private readonly pill = viewChild.required<ElementRef<HTMLElement>>('pill');
  private readonly links = viewChildren<ElementRef<HTMLElement>>('link');

  constructor() {
    const doc = inject(DOCUMENT);
    const destroyRef = inject(DestroyRef);
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    afterNextRender(() => {
      const win = doc.defaultView;
      if (!win) return;
      const pill = this.pill().nativeElement;
      const useRefraction = supportsRefraction(win);

      // Pillengröße und Position der Menüpunkte messen, Brechungskarte passend erzeugen
      const measure = () => {
        this.boxes.set(
          this.links().map(({ nativeElement: a }) => ({
            left: a.offsetLeft,
            width: a.offsetWidth,
          })),
        );
        if (!useRefraction) return;
        const w = pill.offsetWidth;
        const h = pill.offsetHeight;
        this.size.set({ w, h });
        this.map.set(createDisplacementMap(doc, w, h, h / 2, Math.min(18, h / 2)));
        this.refract.set(true);
      };

      // Liegt unter der Pille gerade eine helle Fläche? (Hintergrund der obersten Ebene an dieser Stelle)
      const host = pill.closest('app-site-nav');
      const isLightBehindPill = () => {
        const r = pill.getBoundingClientRect();
        const layers = doc.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        for (const layer of layers) {
          if (host?.contains(layer)) continue;
          for (let el: Element | null = layer; el; el = el.parentElement) {
            // "rgb(r, g, b)" oder "rgba(r, g, b, a)" → Zahlen
            const c = (win.getComputedStyle(el).backgroundColor.match(/[\d.]+/g) ?? []).map(Number);
            const opaque = c.length === 3 || (c.length === 4 && c[3] > 0.5);
            if (opaque) return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] > 140;
          }
        }
        return false;
      };

      // Aktiver Abschnitt: der letzte, dessen Anfang das obere Drittel erreicht hat
      const targets = nav.map((item) => doc.getElementById(item.fragment));
      let frame = 0;
      let checkUntil = 0;
      const update = (now: number) => {
        frame = 0;
        this.onLight.set(isLightBehindPill());
        // Flächen animieren nach dem Scrollen noch kurz weiter (zeitbasierter Snap) → nachprüfen
        if (now < checkUntil) frame = win.requestAnimationFrame(update);
        const line = win.innerHeight * 0.35;
        let current = -1;
        targets.forEach((el, i) => {
          if (el && el.getBoundingClientRect().top <= line) current = i;
        });
        const atBottom = win.innerHeight + win.scrollY >= doc.documentElement.scrollHeight - 4;
        this.active.set(atBottom ? nav.length - 1 : current);
      };
      const onScroll = () => {
        checkUntil = win.performance.now() + 900;
        frame ||= win.requestAnimationFrame(update);
      };

      const ro = new ResizeObserver(measure);
      ro.observe(pill);
      win.addEventListener('scroll', onScroll, { passive: true });
      void doc.fonts.ready.then(measure);
      measure();
      update(0);

      destroyRef.onDestroy(() => {
        ro.disconnect();
        win.removeEventListener('scroll', onScroll);
        win.cancelAnimationFrame(frame);
      });
    });
  }
}
