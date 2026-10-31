import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/ui/icon';

/** Schlichtes Layout für Impressum und Datenschutz: helle Fläche, gut lesbarer Text, Weg zurück zur Startseite. */
@Component({
  selector: 'app-legal-layout',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  // Ohne Kapselung, damit die Stile auch den eingesetzten Inhalt der Seiten (ng-content) erreichen.
  // Alle Regeln hängen an .legal und wirken daher nur hier.
  encapsulation: ViewEncapsulation.None,
  styles: `
    .legal :where(h2) {
      margin: 2.5rem 0 0.75rem;
      font-family: var(--font-display);
      font-size: 1.5rem;
      line-height: 1.25;
      font-weight: 600;
    }
    .legal :where(h3) {
      margin: 1.75rem 0 0.5rem;
      font-size: 1.05rem;
      font-weight: 600;
    }
    .legal :where(p, li) {
      margin: 0 0 0.85rem;
      line-height: 1.7;
      color: var(--pf-paper);
      opacity: 0.85;
    }
    .legal :where(ul) {
      margin: 0 0 1rem;
      padding-left: 1.25rem;
      list-style: disc;
    }
    .legal :where(a) {
      color: color-mix(
        in srgb,
        var(--pf-accent-deep) 72%,
        black
      ); /* dunkler: kleiner Text braucht mehr Kontrast */
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .legal :where(address) {
      font-style: normal;
      line-height: 1.7;
    }
  `,
  template: `
    <main class="relative min-h-svh bg-ink pt-[120px] pb-24 text-paper">
      <article class="legal mx-auto max-w-[760px] px-4 md:px-8">
        <a
          routerLink="/"
          class="label mb-10 inline-flex items-center gap-2 text-paper/70 no-underline hover:text-paper"
        >
          <app-icon name="arrow-up-right" class="size-4 -scale-x-100" /> Zur Startseite
        </a>
        <h1
          class="m-0 mb-8 font-display text-[clamp(44px,7vw,84px)] leading-[.95] font-medium tracking-[-0.03em]"
        >
          {{ title() }}
        </h1>
        <ng-content />
      </article>
    </main>
  `,
})
export class LegalLayout {
  readonly title = input.required<string>();
}
