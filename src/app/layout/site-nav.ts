import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Icon } from '../shared/ui/icon';
import { nav, profile } from '../data/portfolio.data';

/** Fixe Kopfleiste. Links setzen nur ein Fragment – der Router scrollt weich zur Sektion. */
@Component({
  selector: 'app-site-nav',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header
      class="fixed inset-x-0 top-0 z-50 transition-colors duration-300"
      [class]="
        scrolled() || open()
          ? 'bg-paper/85 backdrop-blur-md border-b border-line'
          : 'border-b border-transparent'
      "
    >
      <nav
        class="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between gap-4 px-4 md:px-8"
        aria-label="Hauptnavigation"
      >
        <a
          routerLink="/"
          fragment="top"
          class="font-display text-xl leading-none tracking-tight text-ink"
          (click)="open.set(false)"
        >
          {{ profile.initials }}
          <span
            class="mt-1 block font-sans text-[11px] tracking-[0.08em] text-ink-muted uppercase"
            >{{ profile.role }}</span
          >
        </a>

        <ul class="hidden items-center gap-8 md:flex">
          @for (item of nav; track item.fragment) {
            <li>
              <a
                routerLink="/"
                [fragment]="item.fragment"
                class="label relative py-1.5 text-ink-muted transition-colors hover:text-ink
                        after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:scale-x-0 after:bg-accent after:transition-transform hover:after:scale-x-100"
              >
                {{ item.label }}
              </a>
            </li>
          }
        </ul>

        <div class="flex items-center gap-2">
          <a
            class="btn btn-primary btn-mail hidden sm:inline-flex"
            [href]="'mailto:' + profile.email"
          >
            <app-icon name="envelope" class="mail-icon size-4" /> Kontakt
          </a>
          <button
            type="button"
            class="inline-flex size-11 items-center justify-center rounded-full border border-line text-ink md:hidden"
            [attr.aria-expanded]="open()"
            aria-controls="mobile-menu"
            (click)="open.set(!open())"
          >
            <span class="sr-only">Menü</span>
            <app-icon [name]="open() ? 'x-mark' : 'bars-3'" class="size-6" />
          </button>
        </div>
      </nav>

      @if (open()) {
        <ul id="mobile-menu" class="border-t border-line px-4 pb-6 md:hidden">
          @for (item of nav; track item.fragment) {
            <li>
              <a
                routerLink="/"
                [fragment]="item.fragment"
                (click)="open.set(false)"
                class="block border-b border-line py-4 font-display text-3xl text-ink"
                >{{ item.label }}</a
              >
            </li>
          }
        </ul>
      }
    </header>
  `,
})
export class SiteNav {
  protected readonly nav = nav;
  protected readonly profile = profile;
  protected readonly open = signal(false);
  protected readonly scrolled = signal(false);

  constructor() {
    const doc = inject(DOCUMENT);
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    afterNextRender(() => {
      const win = doc.defaultView;
      if (!win) return;
      const update = () => {
        this.scrolled.set(win.scrollY > 40);
      };
      win.addEventListener('scroll', update, { passive: true });
      update();
    });
  }
}
