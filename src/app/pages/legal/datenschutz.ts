import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { LegalLayout } from './legal-layout';
import { legal, site } from '../../data/portfolio.data';

/**
 * Datenschutzerklärung passend zum tatsächlichen Aufbau der Seite:
 * eigener Server in Deutschland, keine Access-Logs, keine Cookies, kein Tracking,
 * Cloudflare als vorgeschalteter Proxy, sonst keine externen Dienste (Schriften, Bilder und Skripte
 * kommen alle vom eigenen Server). Ändert sich daran etwas (z. B. Analytics, eingebettete Videos),
 * muss dieser Text angepasst werden.
 */
@Component({
  selector: 'app-datenschutz',
  imports: [LegalLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-legal-layout title="Datenschutz">
      <p>
        Der Schutz deiner Daten ist mir wichtig. Diese Website ist bewusst schlank gehalten: keine
        Cookies, kein Tracking und keine Analyse-Tools. Im Folgenden steht, welche Daten trotzdem
        verarbeitet werden und warum.
      </p>

      <h2>1. Verantwortlicher</h2>
      <address>
        {{ l.name }}<br />
        {{ l.street }}<br />
        {{ l.city }}<br />
        {{ l.country }}<br />
        E-Mail: <a [href]="'mailto:' + l.email">{{ l.email }}</a>
      </address>

      <h2>2. Hosting</h2>
      <p>
        Diese Website ({{ host }}) wird von einem eigenen Server ausgeliefert, der in einem
        Rechenzentrum in Deutschland steht.
      </p>
      <p>
        Damit die Seite bei dir angezeigt werden kann, verarbeitet der Server technisch notwendig
        deine IP-Adresse sowie Angaben, die dein Browser automatisch übermittelt (z. B. aufgerufene
        Seite, Browsertyp, Zeitpunkt).
      </p>
      <p>
        <strong>Keine Zugriffsprotokolle:</strong> Es werden keine Zugriffsprotokolle (Access-Logs)
        geführt. Deine IP-Adresse wird nur für die Dauer der Verbindung verwendet und nicht
        gespeichert. Lediglich bei technischen Störungen können Fehlermeldungen mit internen
        Verbindungsdaten entstehen; diese werden automatisch rotiert und überschrieben.<br />
        <strong>Zweck:</strong> technische Auslieferung der Website sowie ihr stabiler und sicherer
        Betrieb.<br />
        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO. Mein berechtigtes Interesse
        liegt darin, die Website zuverlässig bereitzustellen.
      </p>

      <h2>3. Cloudflare</h2>
      <p>
        Zum Schutz vor Angriffen und für eine schnelle Auslieferung läuft diese Website über das
        Netzwerk von Cloudflare. Anbieter ist die Cloudflare, Inc., 101 Townsend St., San Francisco,
        CA 94107, USA. Cloudflare ist zwischen deinen Browser und meinen Server geschaltet: Alle
        Aufrufe der Website laufen zunächst über Server von Cloudflare und werden von dort an meinen
        Server weitergeleitet.
      </p>
      <p>
        Dabei verarbeitet Cloudflare deine IP-Adresse sowie die technischen Angaben, die dein
        Browser beim Aufruf übermittelt (z. B. aufgerufene Seite, Browsertyp, Zeitpunkt). Cloudflare
        nutzt diese Daten, um die Seite auszuliefern und um schädliche Zugriffe zu erkennen und
        abzuwehren.<br />
        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO. Mein berechtigtes Interesse
        liegt in einer sicheren und zuverlässigen Bereitstellung der Website.<br />
        <strong>Auftragsverarbeitung:</strong> Mit Cloudflare besteht ein Vertrag zur
        Auftragsverarbeitung nach Art. 28 DSGVO.<br />
        <strong>Drittlandübermittlung:</strong> Dabei können Daten in die USA übermittelt werden.
        Cloudflare ist nach dem EU-US Data Privacy Framework zertifiziert; für die Übermittlung
        liegt damit ein Angemessenheitsbeschluss der EU-Kommission vor (Art. 45 DSGVO).
      </p>
      <p>
        Weitere Informationen findest du in der
        <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener"
          >Datenschutzerklärung von Cloudflare</a
        >.
      </p>

      <h2>4. Keine Cookies, kein Tracking</h2>
      <p>
        Diese Website setzt keine Cookies und verwendet keine Analyse- oder Tracking-Werkzeuge.
        Schriftarten, Bilder und Skripte werden ausschließlich von meinem eigenen Server geladen; es
        werden dabei keine Daten an weitere Dritte (z. B. Google) übertragen.
      </p>

      <h2>5. Kontakt per E-Mail</h2>
      <p>
        Wenn du mir eine E-Mail schreibst, verarbeite ich deine E-Mail-Adresse und die Inhalte
        deiner Nachricht, um dein Anliegen zu beantworten.<br />
        <strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der
        Beantwortung von Anfragen) bzw. Art. 6 Abs. 1 lit. b DSGVO, wenn deine Anfrage auf einen
        Vertrag oder ein Beschäftigungsverhältnis abzielt.<br />
        <strong>Speicherdauer:</strong> Ich lösche die Nachrichten, sobald sie für die Bearbeitung
        nicht mehr erforderlich sind, sofern keine gesetzlichen Aufbewahrungspflichten
        entgegenstehen.
      </p>

      <h2>6. Externe Links</h2>
      <p>
        Die Website enthält Links zu externen Angeboten (z. B. LinkedIn). Erst wenn du einen solchen
        Link anklickst, verlässt du diese Website; für die Datenverarbeitung dort ist der jeweilige
        Anbieter verantwortlich.
      </p>

      <h2>7. SSL-/TLS-Verschlüsselung</h2>
      <p>
        Die Verbindung zu dieser Website ist per TLS verschlüsselt. Du erkennst das an „https://“
        und dem Schloss-Symbol in der Adresszeile deines Browsers.
      </p>

      <h2>8. Deine Rechte</h2>
      <p>Du hast im Rahmen der gesetzlichen Vorgaben jederzeit das Recht auf:</p>
      <ul>
        <li>Auskunft über die zu deiner Person gespeicherten Daten (Art. 15 DSGVO)</li>
        <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
        <li>Löschung (Art. 17 DSGVO)</li>
        <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>
          Widerspruch gegen die Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO (Art. 21
          DSGVO)
        </li>
      </ul>
      <p>
        Für all das genügt eine formlose E-Mail an <a [href]="'mailto:' + l.email">{{ l.email }}</a
        >.
      </p>

      <h2>9. Beschwerderecht</h2>
      <p>
        Du hast das Recht, dich bei einer Datenschutz-Aufsichtsbehörde zu beschweren. Für mich
        zuständig ist:
        <a [href]="l.authority.url" target="_blank" rel="noopener">{{ l.authority.name }}</a
        >.
      </p>

      <p class="!mt-10 text-sm">Stand: {{ l.updated }}</p>
    </app-legal-layout>
  `,
})
export class Datenschutz {
  protected readonly l = legal;
  protected readonly host = site.url.replace(/^https?:\/\//, '');
  constructor() {
    inject(Title).setTitle('Datenschutz | ' + legal.name);
  }
}
