import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icon } from '../../shared/ui/icon';
import { skills } from '../../data/portfolio.data';

/** Tech-Stack, logisch getrennt: Sprachen · Frameworks · Infrastruktur & Betrieb · Werkzeuge & CI/CD. */
@Component({
  selector: 'app-skills',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <section id="skills" class="mx-auto max-w-[1240px] px-4 py-24 md:px-8">
      <div class="mb-12 border-b border-line pb-8">
        <h2
          class="m-0 font-display text-[clamp(48px,8vw,120px)] leading-[.92] font-medium tracking-[-0.035em]"
        >
          Tech-<i class="text-accent">Stack</i>
        </h2>
      </div>

      <div
        class="grid gap-px overflow-hidden rounded-[10px] border border-line bg-line md:grid-cols-2"
      >
        @for (g of skills; track g.title; let last = $last) {
          <!-- Bei ungerader Anzahl füllt die letzte Gruppe die ganze Breite (keine Lücke im Raster) -->
          <div
            class="flex flex-col gap-5 bg-paper-raised p-8"
            [class.md:col-span-2]="last && skills.length % 2 === 1"
          >
            <div class="flex items-center gap-4">
              <span
                class="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent"
              >
                <app-icon [name]="icons[g.icon]" class="size-6" />
              </span>
              <h3 class="m-0 font-display text-[26px] leading-8 font-medium">{{ g.title }}</h3>
            </div>
            <ul class="m-0 flex list-none flex-wrap gap-2 p-0">
              @for (s of g.items; track s) {
                <li class="chip">{{ s }}</li>
              }
            </ul>
          </div>
        }
      </div>
    </section>
  `,
})
export class Skills {
  protected readonly skills = skills;
  protected readonly icons = {
    languages: 'code-bracket',
    frameworks: 'squares-2x2',
    infra: 'cloud',
    tools: 'command-line',
  } as const;
}
