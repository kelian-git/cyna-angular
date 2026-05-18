import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { Cart } from '../models';

/** Accès aux paniers côté back (synchro à la connexion / au checkout). */
@Injectable({ providedIn: 'root' })
export class CartApiService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/carts';

  getById(id: number): Observable<Cart> {
    return this.http.get<Cart>(`${this.base}/${id}`);
  }

  getByUser(userId: number): Observable<Cart | null> {
    return this.http
      .get<Cart>(`${this.base}/user/${userId}`)
      .pipe(catchError(() => of(null)));
  }

  create(userId: number): Observable<Cart> {
    return this.http.post<Cart>(this.base, {}, { params: { userId } });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  removeByUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/user/${userId}`);
  }
}
