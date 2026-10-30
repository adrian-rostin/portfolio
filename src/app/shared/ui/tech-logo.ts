import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { type Logo, type TechLogo, techLogos } from '../../data/tech-logos';

/**
 * Logo einer Technologie in seinen originalen Markenfarben (Quellen siehe tech-logos.ts).
 * Pfade und Verläufe kommen als Daten und werden als SVG-Elemente gerendert – funktioniert so auch
 * beim Vorrendern auf dem Server.
 */
@Component({
  selector: 'app-tech-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block shrink-0', 'aria-hidden': 'true' },
  template: `
    <svg [attr.viewBox]="logo().viewBox" class="block size-full">
      @if (logo().gradients; as gradients) {
        <defs>
          @for (g of gradients; track g.id) {
            <linearGradient
              [attr.id]="g.id"
              [attr.x1]="g.x1"
              [attr.y1]="g.y1"
              [attr.x2]="g.x2"
              [attr.y2]="g.y2"
              [attr.gradientUnits]="g.units ?? null"
              [attr.gradientTransform]="g.transform ?? null"
            >
              @for (stop of g.stops; track $index) {
                <stop [attr.stop-color]="stop[0]" [attr.offset]="stop[1]" />
              }
            </linearGradient>
          }
        </defs>
      }
      @for (p of logo().paths; track $index) {
        <path [attr.d]="p.d" [attr.fill]="p.fill" [attr.transform]="p.transform ?? null" />
      }
    </svg>
  `,
})
export class TechLogoIcon {
  readonly name = input.required<TechLogo>();
  protected readonly logo = computed<Logo>(() => techLogos[this.name()]);
}
