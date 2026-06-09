import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';
import { applyDirection } from '../../../core/i18n/translate-loader';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  templateUrl: './language-switcher.component.html',
  styleUrl: './language-switcher.component.scss'
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
