import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { applyDirection } from '../../../core/i18n/translate-loader';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  template: `
    <label class="sr-only" for="lang-select">Langue</label>
    <select
      id="lang-select"
      class="rounded border border-gray-300 bg-white px-2 py-1 text-sm"
      [value]="translate.currentLang || translate.defaultLang"
      (change)="change($event)"
    >
      @for (l of langs; track l) {
        <option [value]="l">{{ l.toUpperCase() }}</option>
      }
    </select>
  `,
})
export class LanguageSwitcherComponent {
  readonly translate = inject(TranslateService);
  readonly langs = environment.supportedLangs;

  change(e: Event): void {
    const lang = (e.target as HTMLSelectElement).value;
    this.translate.use(lang);
    applyDirection(lang);
    try {
      localStorage.setItem('cyna-lang', lang);
    } catch {
      /* ignore */
    }
  }
}
