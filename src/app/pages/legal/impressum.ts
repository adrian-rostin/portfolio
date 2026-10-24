import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { LegalLayout } from './legal-layout';
import { legal } from '../../data/portfolio.data';

@Component({
  selector: 'app-impressum',
  imports: [LegalLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-legal-layout title="Impressum">
      <h2>Angaben zum Anbieter</h2>
      <p class="!mb-2">
        Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG) und § 18 Abs. 1 Medienstaatsvertrag (MStV):
      </p>
      <address>
        {{ l.name }}<br />
        {{ l.street }}<br />
        {{ l.city }}<br />
        {{ l.country }}
      </address>

      <h2>Kontakt</h2>
      <p>
        E-Mail: <a [href]="'mailto:' + l.email">{{ l.email }}</a>
      </p>

      <h2>Verantwortlich für den Inhalt</h2>
      <p>{{ l.name }}, Anschrift wie oben.</p>

      <h2>Haftung für Links</h2>
      <p>
        Diese Website enthält Links zu externen Websites (z. B. LinkedIn). Auf deren Inhalte habe
        ich keinen Einfluss; für sie ist der jeweilige Anbieter verantwortlich. Zum Zeitpunkt der
        Verlinkung waren keine Rechtsverstöße erkennbar. Sollte mir eine Rechtsverletzung bekannt
        werden, entferne ich den Link umgehend.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Texte, Fotos und Gestaltung dieser Website sind urheberrechtlich geschützt. Eine Verwendung
        außerhalb der Grenzen des Urheberrechts bedarf meiner vorherigen Zustimmung.
      </p>
    </app-legal-layout>
  `,
})
export class Impressum {
  protected readonly l = legal;
  constructor() {
    inject(Title).setTitle('Impressum | ' + legal.name);
  }
}
