import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { RegisterPayload, User } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/users';

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(this.base);
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  getByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.base}/email/${encodeURIComponent(email)}`);
  }

  search(name: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.base}/search`, { params: { name } });
  }

  checkEmail(email: string): Observable<boolean> {
    return this.http
      .get<boolean>(`${this.base}/check-email`, { params: { email } })
      .pipe(catchError(() => of(false)));
  }

  create(payload: RegisterPayload): Observable<User> {
    return this.http.post<User>(this.base, payload);
  }

  update(id: number, payload: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.base}/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
