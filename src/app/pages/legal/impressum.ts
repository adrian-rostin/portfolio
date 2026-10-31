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
        Diese Website enthält Links zu externen Websites (LinkedIn, GitHub und Xing). Auf deren
        Inhalte habe ich keinen Einfluss; für sie ist der jeweilige Anbieter verantwortlich. Zum
        Zeitpunkt der Verlinkung waren keine Rechtsverstöße erkennbar. Sollte mir eine
        Rechtsverletzung bekannt werden, entferne ich den Link umgehend.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Texte, Fotos und Gestaltung dieser Website sind urheberrechtlich geschützt. Eine Verwendung
        außerhalb der Grenzen des Urheberrechts bedarf meiner vorherigen Zustimmung.
      </p>

      <h2>Marken und Logos</h2>
      <p>
        Die im Tech-Stack und bei den Profil-Links genannten Namen und gezeigten Logos sind Marken
        ihrer jeweiligen Inhaber. Sie dienen hier ausschließlich dazu, die Technologien zu benennen,
        mit denen ich arbeite, und auf meine Profile bei diesen Diensten zu verweisen. Es besteht
        keine Verbindung zu den Markeninhabern; sie unterstützen oder empfehlen diese Website nicht.
      </p>
      <p>
        Java und JavaScript sind Marken von Oracle und/oder verbundenen Unternehmen. Python ist eine
        eingetragene Marke der Python Software Foundation. Kubernetes ist eine eingetragene Marke
        der Linux Foundation. Docker ist eine Marke von Docker, Inc. Spring ist eine Marke von
        Broadcom Inc. und/oder ihren Tochtergesellschaften. TypeScript ist eine Marke der Microsoft
        Corporation. Angular und Go sind Marken von Google LLC. React ist eine Marke von Meta
        Platforms, Inc. Git ist eine Marke der Software Freedom Conservancy. GitHub ist eine Marke
        von GitHub, Inc. LinkedIn ist eine Marke der LinkedIn Corporation. XING ist eine Marke der
        New Work SE.
      </p>
      <p>
        Lizenzhinweise: Git-Logo von Jason Long, lizenziert unter
        <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener"
          >CC BY 3.0</a
        >. Angular-Logo von Google, lizenziert unter
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener"
          >CC BY 4.0</a
        >. Logo-Grafiken aus
        <a href="https://simpleicons.org" target="_blank" rel="noopener">Simple Icons</a> (CC0) und
        <a href="https://devicon.dev" target="_blank" rel="noopener">Devicon</a> (MIT) sowie das
        GitHub-Logo aus
        <a href="https://primer.style/octicons" target="_blank" rel="noopener">Octicons</a> (MIT).
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
