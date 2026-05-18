import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

/**
 * 401 → logout + redirection /connexion.
 * Autres 4xx/5xx → toast d'erreur. Les 404 sur GET sont laissés passer
 * (gérés localement par les services, ex. panier inexistant).
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth = inject(AuthService);
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        auth.logout();
        if (!router.url.startsWith('/connexion')) {
          router.navigate(['/connexion'], { queryParams: { returnUrl: router.url } });
        }
      } else if (error.status === 0) {
        toast.error('Serveur injoignable. Vérifiez que le back est démarré (:8080).');
      } else if (error.status >= 500) {
        toast.error('Une erreur serveur est survenue. Réessayez plus tard.');
      } else if (error.status >= 400 && error.status !== 404) {
        const message =
          typeof error.error === 'string' ? error.error : error.error?.message || error.message;
        toast.error(message || 'Requête invalide.');
      }
      return throwError(() => error);
    }),
  );
};
