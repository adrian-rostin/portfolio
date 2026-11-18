import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { site } from '../data/portfolio.data';
import { Hero } from '../sections/hero/hero';
import { About } from '../sections/about/about';
import { Projects } from '../sections/projects/projects';
import { Skills } from '../sections/skills/skills';
import { Contact } from '../sections/contact/contact';

@Component({
  selector: 'app-home',
  imports: [Hero, About, Projects, Skills, Contact],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <app-hero />
      <app-about />
      <!-- Hintergrund folgt dem Farbwechsel aus „Über mich“: erst die Projekte, dann der Tech-Stack -->
      <div class="after-about">
        <app-projects />
        <app-skills />
      </div>
    </main>
    <app-contact />
  `,
})
export class Home {
  constructor() {
    inject(Title).setTitle(site.title);
  }
}
