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
 * dunklen Kopfbereich, dann fliegt das Statement mittig herein und bleibt kurz stehen. Danach scrollt
 * die Fläche ganz normal mit (nichts bleibt kleben), während der Hintergrund langsam von hell ins Dunkle
 * zum Tech-Stack wechselt.
 */
@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  styles: `
    /* Platzhalter im Seitenfluss. Die Fläche selbst liegt (per Skript) fest über der Seite und
       scrollt ab dem Lösepunkt 1:1 mit. Höhe = Bildschirm minus Lösepunkt (siehe about.ts),
       dann schließt der Bereich darunter genau an die Unterkante der Fläche an. */
    .stage {
      height: 60svh;
    }
    /* Sprungmarke fürs Menü: kurz vor dem Lösepunkt, der Satz ist dann schon da (72px = Navigation) */
    .anchor {
      position: absolute;
      left: 0;
      top: calc(-42svh + 72px);
      height: 1px;
      width: 1px;
    }
    .word {
      will-change: transform, opacity, filter;
    }
    /* Schriftfarben folgen dem Hintergrundwechsel (Werte setzt das Skript) */
    .pane {
      color: var(--about-fg, var(--pf-paper));
      transition: color 0.35s ease;
    }
    .accent-word {
      color: var(--about-accent, var(--pf-accent-deep));
      transition: color 0.35s ease;
    }
    @media (prefers-reduced-motion: reduce) {
      .anchor {
        top: 0;
      }
      .stage {
        height: auto;
      }
      .stage > div {
        position: static;
        height: auto;
        padding-block: 96px;
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
        class="relative flex h-[calc(100svh+2px)] flex-col items-center justify-center pane bg-ink px-4 text-center will-change-transform md:px-8"
      >
        <h2 id="ueber-mich-label" class="sr-only">Über mich</h2>
        <p
          class="m-0 max-w-[16ch] font-display font-medium text-[clamp(40px,6.4vw,92px)] leading-[1.06] tracking-[-0.025em]"
        >
          @for (w of words; track $index) {
            <span #word class="word inline-block" [class]="w.accent ? 'italic accent-word' : ''">{{
              w.text
            }}</span
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
      const n = this.words.length;

      // Fläche snappt ab einem Punkt in fester Zeit hoch (statt mit dem Scrollen mitzuwandern)
      const SNAP_AT = 0.79; // kurz nachdem die Kachel sichtbar nach oben wegzieht → auslösen (kleiner = später)
      const SNAP_TIME = 0.45; // Sekunden
      let snap = 0;

      const stage = this.stage().nativeElement;
      const pane = this.pane().nativeElement;
      // Lösepunkt: Bühnenoberkante, ab der die Fläche mitscrollt (= Bildschirm minus Bühnenhöhe)
      const releaseAt = (vh: number) => vh - stage.offsetHeight;
      pane.style.left = '0';
      pane.style.right = '0';

      // Hintergrund wechselt beim Weiterscrollen langsam von hell (Über mich) zu dunkel (Tech-Stack).
      // Fläche und der Bereich darunter (--after-about-bg, siehe styles.css) bekommen dieselbe Farbe,
      // so gibt es keine sichtbare Kante, wenn die Fläche wegscrollt.
      // Die Schrift wechselt mit: dunkel auf hell, hell auf dunkel – Akzent vom dunklen Orange (für
      // helle Flächen) zum Orange des Tech-Stacks, damit zwischen den Abschnitten nur ein Orange zu sehen ist.
      const LIGHT = [241, 235, 226]; // --pf-ink
      const DARK = [23, 21, 18]; // --pf-paper
      const ACCENT_ON_LIGHT = [180, 70, 42]; // --pf-accent-deep
      const ACCENT_ON_DARK = [239, 138, 106]; // --pf-accent
      // Start, während der Satz noch steht; Wechsel der Schrift ist fertig, bevor der Tech-Stack auftaucht
      const BG_FROM = -0.1; // Bildschirmhöhen relativ zum Lösepunkt (kurz davor, während der Pause)
      const BG_SPAN = 0.6; // über so viele Bildschirmhöhen Scrollweg
      // Verlauf: an beiden Enden langsam, durch die Mitte zügiger – dort, wo Schrift und Grund gleich
      // hell wären, soll man sich nur kurz aufhalten.
      const STEEP = 5;
      const curve = (t: number) =>
        0.5 + (0.5 * Math.tanh((t - 0.5) * STEEP)) / Math.tanh(0.5 * STEEP);
      const mix = (a: number[], b: number[], k: number) =>
        `rgb(${a.map((c, i) => Math.round(c + (b[i] - c) * k)).join(' ')})`;
      const root = doc.documentElement;
      let lastBg = '';
      const updateBackground = (rTop: number, vh: number) => {
        const scrolled = (releaseAt(vh) - rTop) / vh; // Scrollweg seit dem Lösepunkt
        const k = curve(clamp((scrolled - BG_FROM) / BG_SPAN));
        const bg = mix(LIGHT, DARK, k);
        if (bg === lastBg) return;
        lastBg = bg;
        // Schrift springt an der Mitte um (mit kurzer CSS-Überblendung) statt stufenlos mitzulaufen –
        // so gibt es keine Scrollposition, an der Schrift und Grund gleich hell sind
        const f = k >= 0.5 ? 1 : 0;
        pane.style.backgroundColor = bg;
        pane.style.setProperty('--about-fg', mix(DARK, LIGHT, f));
        pane.style.setProperty('--about-accent', mix(ACCENT_ON_LIGHT, ACCENT_ON_DARK, f));
        root.style.setProperty('--after-about-bg', bg);
      };

      const render = (dt: number) => {
        const vh = win.innerHeight;
        const r = stage.getBoundingClientRect();

        // 1. Hochsnappen: vor dem Auslösepunkt ist die Fläche komplett unter dem Bildschirm versteckt
        //    (wandert nie mit dem Scrollen herein), danach schnellt sie in fester Zeit ganz nach oben.
        const target = r.top < vh * SNAP_AT ? 1 : 0;
        snap =
          target > snap ? Math.min(1, snap + dt / SNAP_TIME) : Math.max(0, snap - dt / SNAP_TIME);
        // Bühne komplett unterhalb des Bildschirms (z. B. per Scrollbalken schnell nach oben gesprungen):
        // Fläche sofort verstecken statt sie herunterfahren zu lassen.
        if (r.top >= vh) snap = 0;
        // Bis zum Lösepunkt liegt die Fläche fest am Bildschirm (kein Nachziehen gegen das Scrollen –
        // das ruckelte mit dem weichen Scrollen). Ab dem Lösepunkt hängt sie absolut in der Bühne und
        // scrollt nativ mit der Seite – exakt im Gleichschritt mit dem Bereich darunter, sonst blitzte
        // beim schnellen Scrollen eine feine Linie zwischen den Abschnitten auf.
        const release = releaseAt(vh);
        const released = r.top <= release;
        const pos = released ? 'absolute' : 'fixed';
        const top = released ? `${-Math.round(release)}px` : '0px';
        if (pane.style.position !== pos) pane.style.position = pos;
        if (pane.style.top !== top) pane.style.top = top;
        const y = Math.round(vh * (1 - easeInOut(snap))); // nur noch die zeitbasierte Snap-Bewegung
        pane.style.transform = y !== 0 ? `translate3d(0, ${y}px, 0)` : '';
        pane.style.visibility = snap > 0 ? 'visible' : 'hidden';

        // 2. Schrift fliegt herein (vom Snap-Punkt bis kurz vor dem Lösepunkt) und bleibt dann stehen
        const pp = clamp((vh * SNAP_AT - r.top) / Math.max(1, vh * SNAP_AT - release));
        this.wordEls().forEach((ref, i) => {
          const k = n > 1 ? i / (n - 1) : 0;
          const e = ease(clamp((pp - k * 0.4) / 0.3)); // fertig bei 70 %, der Rest ist die kurze Pause
          const s = ref.nativeElement.style;
          s.opacity = String(e);
          s.filter = e < 1 ? `blur(${((1 - e) * 10).toFixed(2)}px)` : '';
          s.transform =
            e < 1
              ? `translate3d(0, ${((1 - e) * 90).toFixed(1)}px, 0) rotate(${((1 - e) * 10).toFixed(2)}deg) scale(${(0.85 + 0.15 * e).toFixed(4)})`
              : '';
        });
      };

      // Laufende Schleife (für das zeitbasierte Hochsnappen), nur wenn die Bühne in der Nähe ist.
      // Nähe wird pro Frame direkt gemessen: Ein IntersectionObserver meldet bei schnellen Sprüngen
      // (Scrollbalken) gebündelt und verspätet, dann blieb die Fläche stehen.
      let raf = 0,
        lastT = performance.now();
      const loop = (now: number) => {
        raf = win.requestAnimationFrame(loop);
        const dt = Math.min(0.05, (now - lastT) / 1000);
        lastT = now;
        const r = stage.getBoundingClientRect();
        const vh = win.innerHeight;
        const near = r.bottom > -vh * 1.5 && r.top < vh * 1.5;
        updateBackground(r.top, vh); // immer, auch nach Sprüngen weit weg
        // Ist die Fläche noch sichtbar, immer nachziehen – sonst bliebe sie nach einem Sprung weg vom
        // Abschnitt über allem stehen.
        if (near || pane.style.visibility !== 'hidden') render(dt);
      };
      root.classList.add('about-animated'); // Abstand unter der Fläche (styles.css)
      render(0);
      updateBackground(stage.getBoundingClientRect().top, win.innerHeight);
      raf = win.requestAnimationFrame(loop);
      destroyRef.onDestroy(() => {
        win.cancelAnimationFrame(raf);
        root.style.removeProperty('--after-about-bg');
        root.classList.remove('about-animated');
      });
    });
  }
}
