import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Routes d'authentification publiques : on ne tente jamais de refresh dessus. */
const PUBLIC_AUTH_URLS = ['/api/auth/login', '/api/auth/refresh', '/api/auth/register'];

/**
 * - Ajoute `Authorization: Bearer <accessToken>` (lu depuis localStorage via AuthService).
 * - Sur 401, tente un refresh automatique du token puis rejoue la requete une seule fois.
 *   Si le refresh echoue, deconnecte l'utilisateur et propage l'erreur.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthUrl = PUBLIC_AUTH_URLS.some((url) => req.url.includes(url));

      // 401 sur une route protegee + on a un refresh token -> on tente un refresh
      if (error.status === 401 && !isAuthUrl && auth.getRefreshToken()) {
        return auth.refreshToken().pipe(
          switchMap((newAccessToken) => {
            const retried = req.clone({
              setHeaders: { Authorization: `Bearer ${newAccessToken}` },
            });
            return next(retried);
          }),
          catchError((refreshError) => {
            auth.logout();
            return throwError(() => refreshError);
          }),
        );
      }

      return throwError(() => error);
    }),
  );
};
