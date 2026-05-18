import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Subscription } from '../models';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/subscriptions';

  getAll(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(this.base);
  }

  getById(id: number): Observable<Subscription> {
    return this.http.get<Subscription>(`${this.base}/${id}`);
  }

  getByUser(userId: number): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.base}/user/${userId}`);
  }

  getByStatus(status: string): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.base}/status/${status}`);
  }

  create(userId: number, payload: Partial<Subscription>): Observable<Subscription> {
    return this.http.post<Subscription>(this.base, payload, { params: { userId } });
  }

  update(id: number, payload: Partial<Subscription>): Observable<Subscription> {
    return this.http.put<Subscription>(`${this.base}/${id}`, payload);
  }

  cancel(id: number): Observable<Subscription> {
    return this.http.patch<Subscription>(`${this.base}/${id}/cancel`, null);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
