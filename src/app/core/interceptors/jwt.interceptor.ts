import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Ajoute `Authorization: Bearer <token>` si un token est présent.
 * Prêt pour le vrai JWT (access 15 min + refresh 7 j) quand le back l'exposera.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  let token: string | null = null;
  try {
    token = localStorage.getItem('token');
  } catch {
    token = null;
  }
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
