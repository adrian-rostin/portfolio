import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { site } from '../data/portfolio.data';
import { Hero } from '../sections/hero/hero';
import { About } from '../sections/about/about';
import { Skills } from '../sections/skills/skills';
import { Contact } from '../sections/contact/contact';

@Component({
  selector: 'app-home',
  imports: [Hero, About, Skills, Contact],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main>
      <app-hero />
      <app-about />
      <!-- Hintergrund folgt dem Farbwechsel aus „Über mich“ -->
      <div class="after-about">
        <app-skills />
      </div>
    </main>
    <app-contact />
  `,
})
export class Home {
  constructor() {
    // Titel wieder setzen, wenn man von Impressum/Datenschutz zurückkommt
    inject(Title).setTitle(site.title);
  }
}
