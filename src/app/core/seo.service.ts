import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { site } from '../data/portfolio.data';

/**
 * Titel, Beschreibung und Open-Graph-/Twitter-Tags. Weil die Seite beim Build vorgerendert wird
 * (outputMode "static"), stehen die Tags direkt im HTML – LinkedIn, Slack, Mail-Programme führen
 * kein JavaScript aus und sehen sie nur so.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  apply(): void {
    const image = site.url + site.ogImage;
    this.title.setTitle(site.title);
    this.meta.updateTag({ name: 'description', content: site.description });

    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: site.url + '/' });
    this.meta.updateTag({ property: 'og:title', content: site.title });
    this.meta.updateTag({ property: 'og:description', content: site.description });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:image:alt', content: site.title });
    this.meta.updateTag({ property: 'og:locale', content: site.locale });

    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: site.title });
    this.meta.updateTag({ name: 'twitter:description', content: site.description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    let canonical = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.doc.createElement('link');
      canonical.rel = 'canonical';
      this.doc.head.appendChild(canonical);
    }
    canonical.href = site.url + '/';
  }
}
