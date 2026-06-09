import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, switchMap, throwError } from 'rxjs';
import { RegisterPayload, User } from '../models';
import { readJson, removeKey, writeJson } from '../utils/storage.util';
import { UserService } from './user.service';

const STORAGE_KEY = 'cyna-auth';
const MAX_LOGIN_ATTEMPTS = 10;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly userService = inject(UserService);

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
    return this.http.post<User>('/api/auth/login', { email, password }).pipe(
      map((user) => {
        this.loginAttempts = 0;
        this.setUser(user);
        return user;
      }),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          return throwError(() => new Error('INVALID_CREDENTIALS'));
        }
        return throwError(() => new Error('LOGIN_ERROR'));
      }),
    );
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.userService.checkEmail(payload.email).pipe(
      switchMap((exists) => {
        if (exists) return throwError(() => new Error('EMAIL_TAKEN'));
        return this.userService.create(payload);
      }),
      map((user) => {
        this.setUser(user);
        return user;
      }),
    );
  }

  setUser(user: User | null): void {
    this.currentUserSignal.set(user);
    if (user) writeJson(STORAGE_KEY, user);
    else removeKey(STORAGE_KEY);
  }

  logout(): void {
    removeKey('token');
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
