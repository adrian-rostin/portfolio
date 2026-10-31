import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Heroicons (MIT, https://heroicons.com) – Outline, 24px – als Inline-SVG.
 * Farbe und Größe kommen von außen über Tailwind: <app-icon name="envelope" class="size-5 text-ink-muted" />
 * Neue Icons: auf heroicons.com das SVG kopieren und den `d`-Pfad hier eintragen.
 */
const PATHS: Record<string, string[]> = {
  'arrow-up-right': ['m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25'],
  envelope: [
    'M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75',
  ],
  'map-pin': [
    'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
    'M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z',
  ],
};

/**
 * Logos der Profil-Dienste, gefüllt in der Schriftfarbe (einfarbig, wie von den Diensten erlaubt).
 * - GitHub: Octicons „mark-github“ (MIT)
 * - LinkedIn: Devicon „linkedin-plain“ (MIT)
 * - Xing: Simple Icons (CC0)
 * Kein Heroicon, da Heroicons keine Markenlogos enthält.
 */
const BRANDS: Record<string, { viewBox: string; d: string }> = {
  github: {
    viewBox: '0 0 16 16',
    d: 'M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z',
  },
  linkedin: {
    viewBox: '0 0 128 128',
    d: 'M116 3H12a8.91 8.91 0 00-9 8.8v104.42a8.91 8.91 0 009 8.78h104a8.93 8.93 0 009-8.81V11.77A8.93 8.93 0 00116 3zM39.17 107H21.06V48.73h18.11zm-9-66.21a10.5 10.5 0 1110.49-10.5 10.5 10.5 0 01-10.54 10.48zM107 107H88.89V78.65c0-6.75-.12-15.44-9.41-15.44s-10.87 7.36-10.87 15V107H50.53V48.73h17.36v8h.24c2.42-4.58 8.32-9.41 17.13-9.41C103.6 47.28 107 59.35 107 75z',
  },
  xing: {
    viewBox: '0 0 24 24',
    d: 'M18.188 0c-.517 0-.741.325-.927.66 0 0-7.455 13.224-7.702 13.657.015.024 4.919 9.023 4.919 9.023.17.308.436.66.967.66h3.454c.211 0 .375-.078.463-.22.089-.151.089-.346-.009-.536l-4.879-8.916c-.004-.006-.004-.016 0-.022L22.139.756c.095-.191.097-.387.006-.535C22.056.078 21.894 0 21.686 0h-3.498zM3.648 4.74c-.211 0-.385.074-.473.216-.09.149-.078.339.02.531l2.34 4.05c.004.01.004.016 0 .021L1.86 16.051c-.099.188-.093.381 0 .529.085.142.239.234.45.234h3.461c.518 0 .766-.348.945-.667l3.734-6.609-2.378-4.155c-.172-.315-.434-.659-.962-.659H3.648v.016z',
  },
};

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block shrink-0', 'aria-hidden': 'true' },
  template: `
    @if (brand(); as b) {
      <svg [attr.viewBox]="b.viewBox" fill="currentColor" class="size-full">
        <path [attr.d]="b.d" />
      </svg>
    } @else {
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        [attr.stroke-width]="stroke()"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="size-full"
      >
        @for (d of paths(); track $index) {
          <path [attr.d]="d" />
        }
      </svg>
    }
  `,
})
export class Icon {
  readonly name = input.required<string>();
  readonly stroke = input(1.5);
  protected readonly brand = computed(() => BRANDS[this.name()]);
  protected readonly paths = computed(() => PATHS[this.name()] ?? []);
}
