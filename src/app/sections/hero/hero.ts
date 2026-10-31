import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  type ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Icon } from '../../shared/ui/icon';
import { profile, profileLinks, skills } from '../../data/portfolio.data';

/** Die Skills aus dem Tech-Stack, auf zwei große Schriftzeilen verteilt. */
function skillLines(): string[][] {
  const all = [...skills.focus, ...skills.more].map((s) => s.name);
  return [all.filter((_, i) => i % 2 === 0), all.filter((_, i) => i % 2 === 1)];
}

/**
 * Seitenkopf als Scroll-Bühne. Beim Scrollen:
 *  1. Der 3D-Kopf schrumpft und landet deckungsgleich in einer kleinen Kachel (Foto passt exakt),
 *     wird dabei schwarz-weiß; Scheibe weg, Kachel-Hintergrund kommt.
 *  2. Der Name wandert aus dem Textblock neben die Kachel, Rolle und Kurzvorstellung blenden aus.
 *  3. Zwei Schriftzeilen mit den Skills fahren dahinter herein.
 */
@Component({
  selector: 'app-hero',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  styles: `
    /* Silhouette ohne Ausblendung, nur im unteren Bereich (dort, wo der Anzug transparent wird).
       Läuft ganz unten selbst aus, damit dahinterliegende Elemente keine harte Kante bekommen. */
    .body-fill {
      -webkit-mask-image:
        url('/images/portrait-mask.png'),
        linear-gradient(to bottom, transparent 70%, #000 78%, #000 86%, transparent 98%);
      -webkit-mask-size:
        100% 100%,
        100% 100%;
      -webkit-mask-composite: source-in;
      mask-image:
        url('/images/portrait-mask.png'),
        linear-gradient(to bottom, transparent 70%, #000 78%, #000 86%, transparent 98%);
      mask-size:
        100% 100%,
        100% 100%;
      mask-composite: intersect;
    }
    /* Scrollweg der Bühne */
    .intro {
      height: 250svh;
    } /* erste Hälfte: Übergang Kopf → Kachel, zweite Hälfte: Band steht */
    .figure,
    .name-part {
      will-change: transform;
    }
    .lines,
    .card-bg,
    .card-img {
      opacity: 0;
    }
    .track {
      will-change: transform;
    } /* Bewegung per Skript, Tempo folgt dem Scrollen */
    .outline {
      color: transparent;
      -webkit-text-stroke: 1px var(--pf-ink);
    }
    /* Schweben, Stärke über --amp (0 = ruhig, 1 = schwebt) */
    .bob {
      --amp: 0;
      animation: bob 6s ease-in-out infinite;
    }
    @keyframes bob {
      0%,
      100% {
        transform: translateY(calc(var(--amp) * -8px));
      }
      50% {
        transform: translateY(calc(var(--amp) * 8px));
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .intro {
        height: auto;
      }
      .intro > div {
        position: relative;
      }
      .lines,
      .card-box {
        display: none;
      }
      .track,
      .bob {
        animation: none;
      }
    }
  `,
  template: `
    <section #stage id="top" class="intro relative">
      <div
        #pin
        class="sticky top-0 isolate h-svh min-h-[620px] overflow-hidden bg-paper will-change-transform"
      >
        <!-- Zwei Schriftzeilen (ganz hinten) -->
        <div
          #linesBox
          class="lines absolute inset-0 z-[0] flex flex-col justify-center gap-2 pt-[8vh]"
          aria-hidden="true"
        >
          @for (line of lines; track $index; let r = $index) {
            <div
              class="overflow-hidden font-display font-medium text-[clamp(56px,10vw,150px)] leading-[1.05] tracking-[-0.03em] whitespace-nowrap text-ink"
            >
              <div
                class="track inline-flex gap-[.4em] pr-[.4em]"
                [class.rev]="r === 1"
                [class.outline]="r === 1"
                [class.italic]="r === 1"
              >
                @for (w of line.concat(line); track $index) {
                  <span class="inline-flex items-center gap-[.4em]"
                    >{{ w }}<span class="size-[.2em] rounded-full bg-accent"></span
                  ></span>
                }
              </div>
            </div>
          }
        </div>

        <!-- Kachel: Ziel des Kopfes. Box bleibt gerade (zum Messen), die Kachel selbst dreht sich am Ende leicht. -->
        <div
          #cardBox
          class="card-box pointer-events-none absolute top-[56%] left-1/2 z-[1] aspect-[4/5] w-[clamp(170px,22vw,300px)] -translate-x-1/2 -translate-y-1/2"
          aria-hidden="true"
        >
          <div #card class="relative size-full origin-top">
            <div
              #cardBg
              class="card-bg absolute inset-0 rounded-[10px] bg-accent shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
            ></div>
            <div #cardImg class="card-img absolute inset-0 overflow-hidden rounded-[10px]">
              <img
                [src]="profile.portrait"
                alt=""
                class="size-full object-cover object-top grayscale contrast-110"
              />
            </div>
          </div>
        </div>

        <!-- Großer Kopf mit Scheibe: schrumpft genau in die Kachel -->
        <div #figure class="figure pointer-events-none absolute inset-0 z-[2]">
          <!-- Groß: Kopf links neben dem Text. Schmal: Kopf unten mittig unter dem Text. -->
          <div
            #disc
            class="absolute bottom-[8%] left-1/2 aspect-square w-[min(84vw,520px,calc(100svh-420px))] -translate-x-1/2 rounded-full bg-accent-soft md:w-[min(84vw,520px,calc(100svh-520px))] lg:bottom-[9%] lg:left-[29%] lg:w-[min(68vh,48vw,660px)]"
            aria-hidden="true"
          >
            <div class="absolute inset-[9%] rounded-full border border-ink/15"></div>
          </div>
          <div
            #frame
            class="absolute bottom-0 left-1/2 z-[3] aspect-[1200/1371] h-[min(54%,calc(100%-450px))] -translate-x-1/2 md:h-[min(58%,calc(100%-550px))] lg:left-[29%] lg:h-[86%]"
          >
            <!-- Körper-Aussparung: Wo der Anzug unten ausblendet, scheint der Seitengrund durch, nicht die Scheibe -->
            <div #bodyFill class="body-fill absolute inset-0 bg-paper" aria-hidden="true"></div>
            <img
              [src]="profile.portrait"
              [alt]="'Porträt von ' + profile.firstName + ' ' + profile.lastName"
              width="1200"
              height="1371"
              fetchpriority="high"
              class="absolute inset-0 size-full object-contain object-bottom drop-shadow-[0_24px_40px_rgba(0,0,0,0.18)] transition-opacity duration-500"
              [class.opacity-0]="ready()"
            />
            <canvas
              #canvas
              aria-hidden="true"
              class="absolute -top-[8%] -right-[14%] bottom-0 -left-[14%] h-[108%] w-[128%] drop-shadow-[0_24px_40px_rgba(0,0,0,0.18)] transition-opacity duration-500"
              [class.opacity-0]="!ready()"
            ></canvas>
          </div>
        </div>

        <!-- Text: Name, Kurzvorstellung, Ort, Kontakt. Beim Scrollen wandert der Name zur Kachel, der Rest blendet aus. -->
        <div #nameWrap class="bob pointer-events-none absolute inset-0 z-[4]">
          <div
            class="absolute inset-x-4 top-[96px] md:inset-x-8 md:top-[120px] lg:top-1/2 lg:right-[5vw] lg:left-[55vw] lg:-translate-y-1/2"
          >
            <h1
              class="m-0 font-display text-[16vw] leading-[.88] font-medium tracking-[-0.035em] md:text-[12vw] lg:text-[clamp(64px,8.4vw,150px)]"
            >
              <span
                #first
                class="name-part pointer-events-auto block w-fit origin-top-left whitespace-nowrap text-ink"
                >{{ profile.firstName }}</span
              >
              <span
                #last
                class="name-part pointer-events-auto block w-fit origin-top-left whitespace-nowrap italic text-accent"
                >{{ profile.lastName }}</span
              >
            </h1>
            <div #details class="pointer-events-auto mt-5 lg:mt-8">
              <p
                class="m-0 max-w-[38ch] text-[15px] leading-relaxed text-ink-muted md:text-lg lg:text-[clamp(16px,1.35vw,20px)]"
              >
                @for (part of profile.intro; track $index) {
                  <!-- Jeder Teil in eigenem Element, damit keine Leerzeichen vor Satzzeichen entstehen -->
                  <span [class]="part.strong ? 'font-medium text-ink' : ''">{{ part.text }}</span>
                }
              </p>
              <p class="label m-0 mt-4 flex items-center gap-1.5 text-ink lg:mt-5">
                <app-icon name="map-pin" class="size-4 text-ink-muted" />{{ profile.location }}
              </p>
              <div class="mt-6 flex flex-wrap gap-3 lg:mt-8">
                <a class="btn btn-primary btn-mail" [href]="'mailto:' + profile.email">
                  <app-icon name="envelope" class="mail-icon size-4" />E-Mail
                </a>
                <!-- Profile nur als runde Logo-Knöpfe, damit der Blick bei der E-Mail bleibt -->
                @for (p of profiles; track p.icon) {
                  <a
                    class="btn w-11 justify-center px-0"
                    [href]="p.url"
                    target="_blank"
                    rel="noopener"
                  >
                    <app-icon [name]="p.icon" class="size-[18px]" /><span class="sr-only">{{
                      p.label
                    }}</span>
                  </a>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class Hero {
  protected readonly profile = profile;
  protected readonly profiles = profileLinks;
  protected readonly lines = skillLines();
  protected readonly ready = signal(false);
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly pin = viewChild.required<ElementRef<HTMLElement>>('pin');
  private readonly linesEl = viewChild.required<ElementRef<HTMLElement>>('linesBox');
  private readonly cardBox = viewChild.required<ElementRef<HTMLElement>>('cardBox');
  private readonly card = viewChild.required<ElementRef<HTMLElement>>('card');
  private readonly cardBg = viewChild.required<ElementRef<HTMLElement>>('cardBg');
  private readonly cardImg = viewChild.required<ElementRef<HTMLElement>>('cardImg');
  private readonly figure = viewChild.required<ElementRef<HTMLElement>>('figure');
  private readonly disc = viewChild.required<ElementRef<HTMLElement>>('disc');
  private readonly bodyFill = viewChild.required<ElementRef<HTMLElement>>('bodyFill');
  private readonly nameWrap = viewChild.required<ElementRef<HTMLElement>>('nameWrap');
  private readonly first = viewChild.required<ElementRef<HTMLElement>>('first');
  private readonly last = viewChild.required<ElementRef<HTMLElement>>('last');
  private readonly details = viewChild.required<ElementRef<HTMLElement>>('details');
  private readonly frameEl = viewChild.required<ElementRef<HTMLElement>>('frame');
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    const doc = inject(DOCUMENT);
    const destroyRef = inject(DestroyRef);
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    afterNextRender(() => {
      const win = doc.defaultView;
      if (!win) return;
      if (!win.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const clamp = (v: number) => Math.max(0, Math.min(1, v));
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
        const ease = (t: number) => 1 - Math.pow(1 - t, 3);
        const easeInOut = (t: number) =>
          t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

        // Layout-Maße (ohne Transforms) – bei Größenänderung neu messen
        let m: {
          fx: number;
          fy: number;
          frameH: number; // Drehpunkt des Kopfes: Oberkante Mitte des Fotorahmens
          cardCx: number;
          cardTop: number;
          cardH: number; // Ziel: Kachel
          a: { x: number; y: number; w: number; h: number }; // „Adrian“ Startposition
          r: { x: number; y: number; w: number }; // „Rostin“ Startposition
          sc: number;
          gap: number; // Zielgröße des Namens
          aT: { x: number; y: number };
          rT: { x: number; y: number }; // Zielpositionen (oben links)
        };
        const measure = () => {
          const fig = this.figure().nativeElement,
            frame = this.frameEl().nativeElement;
          const box = this.cardBox().nativeElement,
            first = this.first().nativeElement,
            last = this.last().nativeElement;
          // Startposition des Namens im Textblock, relativ zur Bühne (ohne eigene Transforms gemessen)
          first.style.transform = '';
          last.style.transform = '';
          const wrapR = this.nameWrap().nativeElement.getBoundingClientRect();
          const firstR = first.getBoundingClientRect();
          const lastR = last.getBoundingClientRect();
          const vw = fig.clientWidth;
          const frameH = frame.offsetHeight;
          // Box ist per translate zentriert → Mittelpunkt/Oberkante aus Layout + halber Größe
          const cardH = box.offsetHeight;
          const cardCx = box.offsetLeft; // left-1/2, translateX(-50%)
          const cardTop = box.offsetTop - cardH / 2; // top-[56%], translateY(-50%)
          const fs = parseFloat(getComputedStyle(first).fontSize);
          const aw = first.offsetWidth,
            rw = last.offsetWidth,
            ah = first.offsetHeight;
          // Ziel: „Adrian Rostin“ nebeneinander, mittig über der Kachel – oberhalb der Schriftbänder,
          // damit der Name nicht in der laufenden Schrift untergeht
          const targetFs = Math.min(
            Math.max(44, vw * 0.07),
            112,
            (vw * 0.9) / ((aw + rw) / fs + 0.25),
          );
          const sc = targetFs / fs,
            g = targetFs * 0.25;
          const left = cardCx - ((aw + rw) * sc + g) / 2;
          const y = cardTop - ah * sc - targetFs * 0.22; // kleiner Abstand, auch bei gedrehter Kachel
          const aT = { x: left, y };
          const rT = { x: left + aw * sc + g, y };
          m = {
            fx: frame.offsetLeft, // Rahmen ist per left + translateX(-50%) zentriert → Mitte
            fy: fig.clientHeight - frameH,
            frameH,
            cardCx,
            cardTop,
            cardH,
            a: {
              x: firstR.left - wrapR.left,
              y: firstR.top - wrapR.top,
              w: firstR.width,
              h: firstR.height,
            },
            r: { x: lastR.left - wrapR.left, y: lastR.top - wrapR.top, w: lastR.width },
            sc: targetFs / fs,
            gap: targetFs * 0.25,
            aT,
            rT,
          };
          fig.style.transformOrigin = `${m.fx}px ${m.fy}px`;
        };

        // Übergang folgt dem Scrollen: über diesen Anteil des Bühnenwegs läuft Kopf → Kachel,
        // danach steht das Band. Leicht geglättet, damit es mit dem weichen Scrollen ruhig bleibt.
        const SPAN = 0.6;
        let anim = 0; // 0 … 1
        let lastAnim = -1;

        // Schriftzeilen: langsam von selbst, schneller beim Scrollen
        const tracks = Array.from(
          this.linesEl().nativeElement.querySelectorAll<HTMLElement>('.track'),
        );
        // Weg, den jedes Band schon ins Bild gefahren ist (0 = ganz draußen)
        const travel = tracks.map(() => 0);
        // out → entering → loop → exiting → out (exiting kann zurück nach loop, wenn man wieder runterscrollt)
        const mode = tracks.map(() => 'out');
        // Beim Rausfahren: Band wird hinter dem letzten sichtbaren Wort abgeschnitten
        const exitX = tracks.map(() => 0); // aktuelle Position beim Rausfahren
        const exitFrom = tracks.map(() => 0); // Position, an der das Rausfahren begann
        const exitCut = tracks.map(() => 0); // Schnittkante im Band (Band-Koordinaten)
        const START = 0.5; // ab der Hälfte des Übergangs beginnen die Bänder
        // Ein- und Ausfahren ab dem Auslösepunkt: schnell, aber sichtbar – wie ein kräftiger Scroll-Schwung,
        // der am Ende ausläuft (Tempo ∝ Restweg). MOMENTUM: höher = schneller; MIN_SPEED: damit es sicher ankommt.
        const MOMENTUM = 4.5;
        const MIN_SPEED = 220; // px/s
        const BASE_SPEED = 75; // px/s ohne Scrollen
        let speed = BASE_SPEED;
        let dirSign = 1; // 1 = runter gescrollt, -1 = hoch gescrollt
        let lastY = win.scrollY;

        const apply = (a: number) => {
          const q = a;

          // 1. Kopf schrumpft genau in die Kachel: Oberkante/Mitte des Fotos → Oberkante/Mitte der Kachel,
          //    Fotohöhe → Kachelhöhe (die Kachel zeigt dasselbe Bild oben bündig, „cover“)
          const t = easeInOut(clamp(q / 0.62));
          // Kachel und Kopf drehen sich gleichzeitig um denselben Punkt (Oberkante Mitte) → passen exakt
          const rot = -3 * t;
          const s = lerp(1, m.cardH / m.frameH, t);
          const dx = (m.cardCx - m.fx) * t,
            dy = (m.cardTop - m.fy) * t;
          const gs = this.figure().nativeElement.style;
          gs.transform = `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(4)})`;
          gs.filter = `grayscale(${clamp(q / 0.5).toFixed(3)})`;
          this.disc().nativeElement.style.opacity = String(1 - ease(clamp(q / 0.45)));
          this.bodyFill().nativeElement.style.opacity = String(1 - ease(clamp(q / 0.45)));
          this.cardBg().nativeElement.style.opacity = String(ease(clamp((q - 0.18) / 0.4)));

          // Angekommen: unmerklich vom 3D-Kopf auf das Kachelbild umblenden, dann leicht drehen
          const swap = clamp((q - 0.6) / 0.08);
          gs.opacity = String(1 - swap);
          this.cardImg().nativeElement.style.opacity = String(swap);
          this.card().nativeElement.style.transform = `rotate(${rot.toFixed(2)}deg)`;

          // 2. Name wandert aus dem Textblock nebeneinander mittig über die Kachel
          const n = easeInOut(clamp((q - 0.02) / 0.62));
          const sn = lerp(1, m.sc, n);
          this.first().nativeElement.style.transform = `translate3d(${((m.aT.x - m.a.x) * n).toFixed(1)}px, ${((m.aT.y - m.a.y) * n).toFixed(1)}px, 0) scale(${sn.toFixed(4)})`;
          this.last().nativeElement.style.transform = `translate3d(${((m.rT.x - m.r.x) * n).toFixed(1)}px, ${((m.rT.y - m.r.y) * n).toFixed(1)}px, 0) scale(${sn.toFixed(4)})`;
          this.nameWrap().nativeElement.style.setProperty(
            '--amp',
            clamp((q - 0.75) / 0.15).toFixed(3),
          );

          // Kurzvorstellung, Ort und Knöpfe blenden aus, der Name bleibt
          const f = ease(clamp(q / 0.22));
          const ds = this.details().nativeElement.style;
          ds.opacity = String(1 - f);
          ds.transform = `translateY(${(f * 30).toFixed(1)}px)`;
          // Ausgeblendeter Text samt Knöpfen fängt keine Maus mehr ab (Bänder bleiben markierbar)
          ds.pointerEvents = f > 0.5 ? 'none' : '';

          // 3. Schriftzeilen: sichtbar, sie fahren selbst ins Bild (siehe Schleife unten)
          this.linesEl().nativeElement.style.opacity = '1';
        };

        let visible = true;
        const io = new IntersectionObserver(
          // Bei schnellen Sprüngen kommen mehrere Meldungen gebündelt – die letzte ist die aktuelle
          (entries) => (visible = entries[entries.length - 1].isIntersecting),
        );
        io.observe(this.stage().nativeElement);

        let raf = 0,
          lastT = performance.now();
        const loop = (now: number) => {
          raf = win.requestAnimationFrame(loop);
          const dt = Math.min(0.05, (now - lastT) / 1000);
          lastT = now;
          const y = win.scrollY;
          const dy = y - lastY;
          const vel = Math.abs(dy) / Math.max(dt, 1e-3); // px/s
          // Richtung merken: beim Hochscrollen laufen die Zeilen rückwärts
          if (Math.abs(dy) > 0.5) dirSign = dy > 0 ? 1 : -1;
          lastY = y;
          if (!visible) return;

          // Auslösen / Zurückspulen
          const vh = win.innerHeight;
          const rect = this.stage().nativeElement.getBoundingClientRect();
          const p = clamp(-rect.top / Math.max(1, rect.height - vh));
          const target = clamp(p / SPAN);
          anim += (target - anim) * Math.min(1, dt * 14);
          if (Math.abs(target - anim) < 0.0005) anim = target;
          if (anim !== lastAnim) {
            apply(anim);
            lastAnim = anim;
          }

          // Ausstieg: Szene geht erst normal mit dem Scrollen hoch, dann beschleunigt sie nach oben weg
          const out = Math.max(0, vh - rect.bottom);
          const e = Math.min(1, out / vh);
          const boost = vh * 0.9 * e * e; // zusätzlicher Weg nach oben, wächst quadratisch
          this.pin().nativeElement.style.transform =
            boost > 0.5 ? `translate3d(0, ${(-boost).toFixed(1)}px, 0)` : '';

          // Zeilen-Tempo: steigt mit der Scrollgeschwindigkeit, fällt danach sanft zurück
          const want = BASE_SPEED + Math.min(vel, 3000) * 0.8;
          speed += (want - speed) * (want > speed ? 0.45 : 0.05);
          const vw = win.innerWidth;
          tracks.forEach((tr, i) => {
            const H = tr.scrollWidth / 2 || 1; // Länge einer Wiederholung (Inhalt steht 2× im Band)
            const top = i === 0; // oben: kommt von rechts; unten: kommt von links
            const mod = (v: number) => ((v % H) + H) % H;
            const xOf = (t: number) =>
              top ? (t < vw ? vw - t : mod(vw - t) - H) : t < vw ? t - 2 * H : mod(t - 2 * H) - H;
            const on = anim >= START;
            let t = travel[i];
            let x: number;

            if (mode[i] === 'exiting') {
              // Rausfahren: nur bis zum letzten sichtbaren Wort, der Rest ist abgeschnitten
              const goneAt = top ? vw - exitCut[i] : -exitCut[i]; // Position, an der nichts mehr zu sehen ist
              const goal = on ? exitFrom[i] : goneAt; // wieder runtergescrollt → zurück rein
              const rest = goal - exitX[i];
              exitX[i] +=
                Math.sign(rest) *
                Math.min(Math.abs(rest), (Math.abs(rest) * MOMENTUM + MIN_SPEED) * dt);
              x = exitX[i];
              if (Math.abs(goal - x) < 0.5) {
                tr.style.clipPath = '';
                if (on) {
                  mode[i] = 'loop';
                } else {
                  mode[i] = 'out';
                  t = 0;
                  x = xOf(0);
                }
              }
            } else if (!on && mode[i] === 'loop') {
              // Über den Auslösepunkt zurück: hinter dem letzten sichtbaren Wort abschneiden und rausfahren
              x = xOf(t);
              const words = Array.from(tr.children) as HTMLElement[];
              const trackLeft = tr.getBoundingClientRect().left;
              let cut = top ? Infinity : -Infinity;
              for (const w of words) {
                const r = w.getBoundingClientRect();
                if (r.right <= 0 || r.left >= vw) continue; // nicht sichtbar
                cut = top ? Math.min(cut, r.left - trackLeft) : Math.max(cut, r.right - trackLeft);
              }
              if (!isFinite(cut)) cut = top ? -x : vw - x;
              exitCut[i] = cut;
              exitFrom[i] = exitX[i] = x;
              tr.style.clipPath = top
                ? `inset(0 0 0 ${cut.toFixed(1)}px)`
                : `inset(0 ${(tr.scrollWidth - cut).toFixed(1)}px 0 0)`;
              mode[i] = 'exiting';
            } else if (!on) {
              // Noch beim Einfahren zurückgescrollt: auf demselben Weg wieder raus (Band endet hier eh am Rand)
              t = Math.max(0, t - (t * MOMENTUM + MIN_SPEED) * dt);
              mode[i] = t > 0 ? 'entering' : 'out';
              x = xOf(t);
            } else if (mode[i] !== 'loop') {
              // Auslösepunkt erreicht: Band schießt herein und läuft weich aus
              t = Math.min(vw, t + ((vw - t) * MOMENTUM + MIN_SPEED) * dt);
              mode[i] = t >= vw ? 'loop' : 'entering';
              x = xOf(t);
            } else {
              // Läuft endlos: Richtung folgt dem Scrollen, Tempo der Scrollgeschwindigkeit
              t += speed * dt * dirSign;
              while (t < vw) t += H;
              while (t >= vw + H) t -= H;
              x = xOf(t);
            }
            travel[i] = t;
            tr.style.transform = `translate3d(${x.toFixed(1)}px, 0, 0)`;
          });
        };
        const onResize = () => {
          measure();
          apply(anim);
        };
        measure();
        apply(0);
        win.addEventListener('resize', onResize);
        // Schrift lädt evtl. nach → Namensbreite neu messen
        void doc.fonts.ready.then(onResize);
        raf = win.requestAnimationFrame(loop);
        destroyRef.onDestroy(() => {
          win.cancelAnimationFrame(raf);
          io.disconnect();
          win.removeEventListener('resize', onResize);
        });
      }

      // Three.js erst im Browser nachladen – das vorgerenderte HTML bleibt klein
      void import('./portrait-3d')
        .then(({ createPortrait3D }) =>
          createPortrait3D(
            this.frameEl().nativeElement,
            this.canvas().nativeElement,
            profile.portrait,
            profile.portraitDepth,
          ),
        )
        .then((handle) => {
          if (!handle) return; // kein WebGL → Foto bleibt
          this.ready.set(true);
          destroyRef.onDestroy(() => {
            handle.destroy();
          });
        });
    });
  }
}
