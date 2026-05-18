import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <footer class="mt-12 hidden border-t border-gray-200 bg-white md:block">
      <div
        class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row"
      >
        <p class="text-sm text-gray-500">{{ 'footer.rights' | translate: { year: year } }}</p>
        <nav class="flex flex-wrap gap-4 text-sm text-gray-600" aria-label="Liens de pied de page">
          <a routerLink="/mentions-legales" class="hover:text-brand-800">{{
            'nav.legal' | translate
          }}</a>
          <a routerLink="/cgu" class="hover:text-brand-800">{{ 'nav.cgu' | translate }}</a>
          <a routerLink="/contact" class="hover:text-brand-800">{{ 'nav.contact' | translate }}</a>
          <a routerLink="/a-propos" class="hover:text-brand-800">{{ 'nav.about' | translate }}</a>
        </nav>
        <div class="flex gap-3 text-gray-500" aria-label="Réseaux sociaux">
          <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook"
            >Facebook</a
          >
          <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter"
            >Twitter</a
          >
          <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn"
            >LinkedIn</a
          >
        </div>
      </div>
    </footer>
  `,
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
