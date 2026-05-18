import { HttpClient } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

/** Charge les JSON de traduction servis depuis public/i18n. */
export function httpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, '/i18n/', '.json');
}

export const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export function applyDirection(lang: string): void {
  const dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
  if (typeof document !== 'undefined') {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }
}
