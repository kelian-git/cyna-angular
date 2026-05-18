import { provideHttpClient, withInterceptors, HttpClient } from '@angular/common/http';
import {
  APP_INITIALIZER,
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { environment } from '../environments/environment';
import { routes } from './app.routes';
import { applyDirection, httpLoaderFactory } from './core/i18n/translate-loader';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

function initLang(translate: TranslateService) {
  return () => {
    translate.addLangs(environment.supportedLangs);
    const stored = (() => {
      try {
        return localStorage.getItem('cyna-lang');
      } catch {
        return null;
      }
    })();
    const lang =
      stored && environment.supportedLangs.includes(stored) ? stored : environment.defaultLang;
    translate.setDefaultLang(environment.defaultLang);
    translate.use(lang);
    applyDirection(lang);
    translate.onLangChange.subscribe((e) => applyDirection(e.lang));
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
    ),
    provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
    provideAnimations(),
    importProvidersFrom(
      TranslateModule.forRoot({
        defaultLanguage: environment.defaultLang,
        loader: {
          provide: TranslateLoader,
          useFactory: httpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initLang,
      deps: [TranslateService],
      multi: true,
    },
  ],
};
