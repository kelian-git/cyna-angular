import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { RegisterPayload, User } from '../models';
import { readJson, removeKey, writeJson } from '../utils/storage.util';

const STORAGE_KEY = 'cyna-auth';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const MAX_LOGIN_ATTEMPTS = 10;

/** Forme renvoyee par le back au login / refresh. */
interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly currentUserSignal = signal<User | null>(
    readJson<User | null>(STORAGE_KEY, null),
  );
  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);
  readonly isAdminUser = computed(
    () => this.currentUserSignal()?.adminRole?.label === 'ADMIN',
  );

  private loginAttempts = 0;

  login(email: string, password: string): Observable<User> {
    if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      return throwError(() => new Error('TOO_MANY_ATTEMPTS'));
    }
    this.loginAttempts += 1;
    return this.http.post<AuthResponse>('/api/auth/login', { email, password }).pipe(
      map((res) => {
        this.loginAttempts = 0;
        this.storeTokens(res.accessToken, res.refreshToken);
        this.setUser(res.user);
        return res.user;
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          return throwError(() => new Error('INVALID_CREDENTIALS'));
        }
        if (err.status === 429) {
          return throwError(() => new Error('TOO_MANY_ATTEMPTS'));
        }
        return throwError(() => new Error('LOGIN_ERROR'));
      }),
    );
  }

  // --- Gestion des tokens ---

  getAccessToken(): string | null {
    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  getRefreshToken(): string | null {
    try {
      return localStorage.getItem(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    try {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } catch {
      /* quota / mode prive — on ignore */
    }
  }

  private clearTokens(): void {
    removeKey(ACCESS_TOKEN_KEY);
    removeKey(REFRESH_TOKEN_KEY);
  }

  /**
   * Echange le refresh token contre un nouvel access token.
   * Emet le nouvel access token. En cas d'echec, propage l'erreur (l'appelant deconnecte).
   */
  refreshToken(): Observable<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return throwError(() => new Error('NO_REFRESH_TOKEN'));
    }
    return this.http.post<AuthResponse>('/api/auth/refresh', { refreshToken }).pipe(
      map((res) => {
        this.storeTokens(res.accessToken, res.refreshToken);
        this.setUser(res.user);
        return res.accessToken;
      }),
    );
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http.post<AuthResponse>('/api/auth/register', payload).pipe(
      map((res) => {
        this.storeTokens(res.accessToken, res.refreshToken);
        this.setUser(res.user);
        return res.user;
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 409) return throwError(() => new Error('EMAIL_TAKEN'));
        return throwError(() => new Error('REGISTER_ERROR'));
      }),
    );
  }

  setUser(user: User | null): void {
    this.currentUserSignal.set(user);
    if (user) writeJson(STORAGE_KEY, user);
    else removeKey(STORAGE_KEY);
  }

  logout(): void {
    this.clearTokens();
    removeKey('token'); // ancien emplacement, nettoyage retrocompatible
    this.setUser(null);
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  isAdmin(): boolean {
    return this.isAdminUser();
  }

  getCurrentUser(): User | null {
    return this.currentUserSignal();
  }
}
