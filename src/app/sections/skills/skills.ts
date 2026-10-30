import { ChangeDetectionStrategy, Component } from '@angular/core';
import { type Skill, skills } from '../../data/portfolio.data';
import { techLogos } from '../../data/tech-logos';
import { TechLogoIcon } from '../../shared/ui/tech-logo';

/**
 * Tech-Stack: oben der Schwerpunkt in großen Kacheln, darunter der Rest kompakt.
 * Logos unverändert in ihren Markenfarben; beim Überfahren tönt sich die Kachel leicht in diese Farbe.
 */
@Component({
  selector: 'app-skills',
  imports: [TechLogoIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  styles: `
    .tile {
      transition:
        background-color 0.3s ease,
        transform 0.3s ease;
    }
    @media (hover: hover) {
      .tile:hover {
        background-color: color-mix(in srgb, var(--brand) 6%, var(--pf-paper-raised));
        transform: translateY(-2px);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .tile {
        transition: none;
      }
      .tile:hover {
        transform: none;
      }
    }
  `,
  template: `
    <section id="skills" class="mx-auto max-w-[1240px] px-4 py-24 md:px-8">
      <h2
        class="m-0 mb-12 font-display text-[clamp(48px,8vw,120px)] leading-[.92] font-medium tracking-[-0.035em]"
      >
        Tech-<i class="text-accent">Stack</i>
      </h2>

      <h3 class="label m-0 mb-5 text-ink-muted">Schwerpunkt</h3>
      <ul class="m-0 grid list-none grid-cols-2 gap-3 p-0 md:grid-cols-4 md:gap-4">
        @for (s of skills.focus; track s.name) {
          <li
            class="tile flex min-h-[180px] flex-col justify-between gap-8 bg-paper-raised p-5 md:min-h-[220px] md:p-7"
            [style.--brand]="brandColor(s)"
          >
            @if (s.logo) {
              <app-tech-logo [name]="s.logo" class="size-10 md:size-12" />
            } @else {
              <!-- kein Logo (Spring: Logo ist Broadcom vorbehalten): neutrales Monogramm -->
              <span
                class="flex size-10 items-center font-display text-[30px] leading-none font-semibold tracking-[-0.04em] md:size-12 md:text-[36px]"
                [style.color]="s.color"
                aria-hidden="true"
                >{{ monogram(s.name) }}</span
              >
            }
            <span
              class="font-display text-[22px] leading-tight font-medium tracking-[-0.01em] md:text-[28px]"
              >{{ s.name }}</span
            >
          </li>
        }
      </ul>

      <h3 class="label m-0 mt-14 mb-5 text-ink-muted">Außerdem</h3>
      <ul class="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-4">
        @for (s of skills.more; track s.name) {
          <li
            class="tile flex items-center gap-3 bg-paper-raised px-4 py-3.5"
            [style.--brand]="brandColor(s)"
          >
            @if (s.logo) {
              <app-tech-logo [name]="s.logo" class="size-6" />
            }
            <span class="text-[15px] font-medium">{{ s.name }}</span>
          </li>
        }
      </ul>
    </section>
  `,
})
export class Skills {
  protected readonly skills = skills;
  protected readonly logos = techLogos;

  protected brandColor(s: Skill): string {
    return s.logo ? this.logos[s.logo].color : (s.color ?? 'var(--pf-ink)');
  }

  /** „Spring Boot“ → „Sb“ */
  protected monogram(name: string): string {
    const [first = '', second = ''] = name.split(' ');
    return first.charAt(0).toUpperCase() + second.charAt(0).toLowerCase();
  }
}
