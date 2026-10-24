import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { ViewportScroller } from '@angular/common';
import { SmoothViewportScroller } from './core/smooth-scroll';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // One-Page-App: Menüklicks setzen nur das Fragment (#skills …) und der Router scrollt dorthin.
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      // Ein zweiter Klick auf denselben Menüpunkt scrollt erneut.
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
    ),
    provideClientHydration(withEventReplay()),
    // Router-Scrollen läuft über Lenis (weich), siehe smooth-scroll.ts
    { provide: ViewportScroller, useClass: SmoothViewportScroller },
  ],
};
