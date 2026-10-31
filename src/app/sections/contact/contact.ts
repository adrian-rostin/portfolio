import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/ui/icon';
import { nav, profile, profileLinks } from '../../data/portfolio.data';

@Component({
  selector: 'app-contact',
  imports: [Icon, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <footer id="kontakt" class="mt-12 bg-ink pt-24 pb-8 text-paper">
      <div class="mx-auto max-w-[1240px] px-4 md:px-8">
        <p
          class="m-0 mb-8 font-display font-medium text-[clamp(56px,10vw,156px)] leading-[.92] tracking-[-0.035em]"
        >
          Lass uns <i class="text-accent-deep">reden.</i>
        </p>
        <div class="mb-24 flex flex-wrap gap-3">
          <!-- Füllung in Papierfarbe, weil die Fußzeile selbst dunkel ist -->
          <a
            class="btn btn-primary btn-mail h-14 border-accent-deep bg-accent-deep px-7 text-base [--fill-text:var(--pf-ink)] [--fill:var(--pf-paper)]"
            [href]="'mailto:' + profile.email"
          >
            <app-icon name="envelope" class="mail-icon size-5" />
            <!-- Eigenes Element: Cloudflare verschlüsselt die Adresse hier gegen Spam-Bots -->
            <span>{{ profile.email }}</span>
          </a>
          @for (p of profiles; track p.icon) {
            <a
              class="btn h-14 border-paper/30 px-6 text-base text-paper hover:border-paper hover:bg-paper/5"
              [href]="p.url"
              target="_blank"
              rel="noopener"
            >
              <app-icon [name]="p.icon" class="size-5" />{{ p.label }}
            </a>
          }
        </div>

        <div class="grid gap-8 border-t border-paper/25 py-8 sm:grid-cols-3">
          <div>
            <h4 class="label mb-2 opacity-70">Seite</h4>
            <ul class="m-0 list-none p-0">
              @for (item of nav; track item.fragment) {
                <li>
                  <a
                    routerLink="/"
                    [fragment]="item.fragment"
                    class="leading-[30px] hover:underline hover:underline-offset-4"
                    >{{ item.label }}</a
                  >
                </li>
              }
            </ul>
          </div>
          <div>
            <h4 class="label mb-2 opacity-70">Profile</h4>
            <ul class="m-0 list-none p-0">
              @for (p of profiles; track p.icon) {
                <li>
                  <a
                    [href]="p.url"
                    target="_blank"
                    rel="noopener"
                    class="inline-flex items-center gap-2 leading-[30px] hover:underline hover:underline-offset-4"
                    ><app-icon [name]="p.icon" class="size-4" />{{ p.label }}</a
                  >
                </li>
              }
            </ul>
          </div>
          <div>
            <h4 class="label mb-2 opacity-70">Standort</h4>
            <p class="m-0 inline-flex items-center gap-2 leading-[30px]">
              <app-icon name="map-pin" class="size-4" />{{ profile.location }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap justify-between gap-4 text-[13px] opacity-70">
          <span>© {{ year }} {{ profile.firstName }} {{ profile.lastName }}</span>
          <span
            ><a routerLink="/impressum" class="hover:underline">Impressum</a> ·
            <a routerLink="/datenschutz" class="hover:underline">Datenschutz</a></span
          >
        </div>
      </div>
    </footer>
  `,
})
export class Contact {
  protected readonly profile = profile;
  protected readonly profiles = profileLinks;
  protected readonly nav = nav;
  protected readonly year = new Date().getFullYear();
}
