import { DOCUMENT, Injectable, inject } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import type Lenis from 'lenis';

/**
 * Weiches Scrollen für die ganze Seite mit Lenis (https://lenis.darkroom.engineering).
 * Lenis gleitet das Mausrad-Scrollen aus; die Seite scrollt weiterhin nativ (sticky, Anker, Tastatur).
 * Bei „Bewegung reduzieren“ bleibt das normale Browser-Scrollen.
 */
@Injectable({ providedIn: 'root' })
export class SmoothScroll {
  private readonly doc = inject(DOCUMENT);
  private lenis?: Lenis;

  async start(): Promise<void> {
    const win = this.doc.defaultView;
    if (!win || this.lenis || win.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const { default: LenisCtor } = await import('lenis');
    this.lenis = new LenisCtor({ autoRaf: true, lerp: 0.09, wheelMultiplier: 0.9 });
  }

  scrollTo(top: number, immediate = false): void {
    if (this.lenis) {
      this.lenis.scrollTo(top, { immediate, duration: 1.2 });
      return;
    }
    this.doc.defaultView?.scrollTo({ top, behavior: immediate ? 'instant' : 'smooth' });
  }
}

/**
 * Ersetzt Angulars ViewportScroller, damit der Router (anchorScrolling / scrollPositionRestoration)
 * über Lenis scrollt statt hart zu springen.
 */
@Injectable()
export class SmoothViewportScroller extends ViewportScroller {
  private readonly doc = inject(DOCUMENT);
  private readonly smooth = inject(SmoothScroll);
  private offset: [number, number] | (() => [number, number]) = [0, 0];

  setOffset(offset: [number, number] | (() => [number, number])): void {
    this.offset = offset;
  }

  getScrollPosition(): [number, number] {
    const win = this.doc.defaultView;
    return win ? [win.scrollX, win.scrollY] : [0, 0];
  }

  scrollToPosition(position: [number, number]): void {
    this.smooth.scrollTo(position[1], true);
  }

  scrollToAnchor(anchor: string): void {
    const win = this.doc.defaultView;
    const el =
      this.doc.getElementById(anchor) ?? Array.from(this.doc.getElementsByName(anchor)).at(0);
    if (!win || !el) return;
    const [, offsetY] = typeof this.offset === 'function' ? this.offset() : this.offset;
    const top = el.getBoundingClientRect().top + win.scrollY - offsetY;
    this.smooth.scrollTo(top);
  }

  setHistoryScrollRestoration(mode: 'auto' | 'manual'): void {
    const history = this.doc.defaultView?.history;
    if (history && 'scrollRestoration' in history) history.scrollRestoration = mode;
  }
}
