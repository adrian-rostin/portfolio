import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  type ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  viewChild,
  viewChildren,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { profile } from '../../data/portfolio.data';

/**
 * „Über mich“ auf heller Fläche: Ab einem Punkt snappt die Fläche in fester Zeit nach oben über den
 * dunklen Kopfbereich, dann fliegt das Statement mittig herein, bleibt stehen und fliegt wieder hinaus.
 * Sobald die Schrift weg ist, clippt die Fläche in fester Zeit nach oben weg und gibt den Tech-Stack
 * frei, der schon darunter liegt.
 */
@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  styles: `
    /* Scrollweg der Bühne: Hereinfliegen, Stehen, Hinausfliegen, Wegclippen */
    .stage {
      height: 190svh;
    }
    /* Sprungmarke fürs Menü: so weit in der Bühne, dass der Satz schon da ist (72px = Navigation) */
    .anchor {
      position: absolute;
      left: 0;
      top: calc(-18svh + 72px);
      height: 1px;
      width: 1px;
    }
    @media (prefers-reduced-motion: reduce) {
      .anchor {
        top: 0;
      }
    }
    .word {
      will-change: transform, opacity, filter;
    }
    @media (prefers-reduced-motion: reduce) {
      .stage {
        height: auto;
      }
      .stage > div {
        position: static;
        height: auto;
        padding-block: 96px;
        clip-path: none !important;
        transform: none !important;
      }
    }
  `,
  template: `
    <!-- Statement auf heller Bühne -->
    <section #stage class="stage relative z-[2]" aria-labelledby="ueber-mich-label">
      <span id="ueber-mich" class="anchor" aria-hidden="true"></span>
      <div
        #pane
        class="sticky top-0 flex h-svh flex-col items-center justify-center bg-ink px-4 text-center text-paper will-change-transform md:px-8"
      >
        <h2 id="ueber-mich-label" class="sr-only">Über mich</h2>
        <p
          class="m-0 max-w-[16ch] font-display font-medium text-[clamp(40px,6.4vw,92px)] leading-[1.06] tracking-[-0.025em]"
        >
          @for (w of words; track $index) {
            <span
              #word
              class="word inline-block"
              [class]="w.accent ? 'italic text-accent-deep' : ''"
              >{{ w.text }}</span
            >{{ ' ' }}
          }
        </p>
      </div>
    </section>
  `,
})
export class About {
  protected readonly words = profile.statement.split(/\s+/).map((text) => ({
    text,
    accent: profile.statementAccent.some((a) => text.toLowerCase().startsWith(a.toLowerCase())),
  }));
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly pane = viewChild.required<ElementRef<HTMLElement>>('pane');
  private readonly wordEls = viewChildren<ElementRef<HTMLElement>>('word');

  constructor() {
    const doc = inject(DOCUMENT);
    const destroyRef = inject(DestroyRef);
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    afterNextRender(() => {
      const win = doc.defaultView;
      if (!win) return;
      if (win.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // Text steht einfach da

      const clamp = (v: number) => Math.max(0, Math.min(1, v));
      const ease = (t: number) => 1 - Math.pow(1 - t, 3);
      const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      // Feste „Zufalls“-Richtung je Wort fürs Auseinanderfliegen
      const dirs = this.words.map((_, i) => ({
        x: Math.sin(i * 12.9898) * 1.4,
        r: Math.cos(i * 78.233),
      }));
      const n = this.words.length;

      // Fläche snappt ab einem Punkt in fester Zeit hoch (statt mit dem Scrollen mitzuwandern)
      const SNAP_AT = 0.79; // kurz nachdem die Kachel sichtbar nach oben wegzieht → auslösen (kleiner = später)
      const SNAP_TIME = 0.45; // Sekunden
      let snap = 0;
      // Wegclippen am Ende: ebenfalls zeitbasiert, sobald die Schrift hinausgeflogen ist
      const WIPE_AT = 0.8; // Fortschritt pp
      const WIPE_TIME = 0.5; // Sekunden
      let wipe = 0;

      const render = (dt: number) => {
        const vh = win.innerHeight;
        const r = this.stage().nativeElement.getBoundingClientRect();
        const pane = this.pane().nativeElement;

        // 1. Hochsnappen: vor dem Auslösepunkt ist die Fläche komplett unter dem Bildschirm versteckt
        //    (wandert nie mit dem Scrollen herein), danach schnellt sie in fester Zeit ganz nach oben.
        const target = r.top < vh * SNAP_AT ? 1 : 0;
        snap =
          target > snap ? Math.min(1, snap + dt / SNAP_TIME) : Math.max(0, snap - dt / SNAP_TIME);
        // Bühne komplett unterhalb des Bildschirms (z. B. per Scrollbalken schnell nach oben gesprungen):
        // Fläche sofort verstecken statt sie herunterfahren zu lassen.
        if (r.top >= vh) snap = 0;
        // Bis die Bühne oben angekommen ist, liegt die Fläche fest am Bildschirm (position: fixed) statt
        // per Skript gegen das Scrollen nachgezogen zu werden – das ruckelte mit dem weichen Scrollen.
        // Danach übernimmt „sticky“ an genau derselben Stelle (oben, 0).
        const pinned = r.top <= 0;
        pane.style.position = pinned ? '' : 'fixed';
        pane.style.top = pinned ? '' : '0';
        pane.style.left = pinned ? '' : '0';
        pane.style.right = pinned ? '' : '0';
        const y = vh * (1 - easeInOut(snap)); // nur noch die zeitbasierte Snap-Bewegung
        pane.style.transform = y > 0.5 ? `translate3d(0, ${y.toFixed(1)}px, 0)` : '';
        pane.style.visibility = snap > 0 ? 'visible' : 'hidden';

        // Fortschritt ab dem Snap-Punkt bis zum Ende der Bühne
        const pp = clamp((vh * SNAP_AT - r.top) / Math.max(1, r.height - vh + vh * SNAP_AT));

        // 2. Schrift fliegt herein; 3. Stehen; 4. Hinausfliegen
        this.wordEls().forEach((ref, i) => {
          const k = n > 1 ? i / (n - 1) : 0;
          const e = ease(clamp((pp - k * 0.12) / 0.1));
          const x = ease(clamp((pp - 0.52 - k * 0.14) / 0.1));
          const s = ref.nativeElement.style;
          s.opacity = String(e * (1 - x));
          s.filter = `blur(${(1 - e + x) * 10}px)`;
          s.transform =
            `translate3d(${x * dirs[i].x * 80}px, ${(1 - e) * 90 - x * 140}px, 0) ` +
            `rotate(${(1 - e) * 10 + x * dirs[i].r * 14}deg) scale(${0.85 + 0.15 * e + x * 0.1})`;
        });

        // 5. Ist die Schrift weg, clippt die Fläche in fester Zeit nach oben weg (rückwärts beim Hochscrollen)
        const wipeTarget = pp >= WIPE_AT ? 1 : 0;
        wipe =
          wipeTarget > wipe
            ? Math.min(1, wipe + dt / WIPE_TIME)
            : Math.max(0, wipe - dt / WIPE_TIME);
        if (r.bottom <= 0) wipe = 1; // schon vorbei gescrollt
        if (r.top >= vh) wipe = 0;
        const wipeOut = easeInOut(wipe) * 100;
        pane.style.clipPath = `inset(0 0 ${wipeOut.toFixed(2)}% 0)`;
      };

      // Laufende Schleife (für die zeitbasierte Snap-Animation), nur wenn die Bühne in der Nähe ist
      let visible = false;
      const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
        rootMargin: '50% 0px',
      });
      io.observe(this.stage().nativeElement);
      const pane = this.pane().nativeElement;
      let raf = 0,
        lastT = performance.now();
      const loop = (now: number) => {
        raf = win.requestAnimationFrame(loop);
        const dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;
        // Auch außerhalb der Sichtweite einmal nachziehen, damit nie eine Fläche stehen bleibt
        if (visible || pane.style.visibility !== 'hidden') render(dt);
      };
      render(0);
      raf = win.requestAnimationFrame(loop);
      destroyRef.onDestroy(() => {
        win.cancelAnimationFrame(raf);
        io.disconnect();
      });
    });
  }
}
