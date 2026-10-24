import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SiteNav } from './layout/site-nav';
import { SeoService } from './core/seo.service';
import { SmoothScroll } from './core/smooth-scroll';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteNav],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<app-site-nav /><router-outlet />`,
})
export class App {
  constructor() {
    inject(SeoService).apply();
    // Beim Anker-Scrollen Platz für die fixe Navigation (72px) lassen.
    inject(ViewportScroller).setOffset([0, 72]);
    const smooth = inject(SmoothScroll);
    afterNextRender(() => void smooth.start());
  }
}
