import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../models';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/orders';

  getAll(): Observable<Order[]> {
    return this.http.get<Order[]>(this.base);
  }

  getById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.base}/${id}`);
  }

  getByUser(userId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/user/${userId}`);
  }

  getByStatus(status: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/status/${status}`);
  }

  dateRange(start: string, end: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.base}/date-range`, { params: { start, end } });
  }

  revenue(start: string, end: string): Observable<number> {
    return this.http.get<number>(`${this.base}/revenue`, { params: { start, end } });
  }

  create(userId: number): Observable<Order> {
    return this.http.post<Order>(this.base, {}, { params: { userId } });
  }

  checkout(userId: number): Observable<Order> {
    return this.http.post<Order>(`${this.base}/checkout`, {}, { params: { userId } });
  }

  update(id: number, payload: Partial<Order>): Observable<Order> {
    return this.http.put<Order>(`${this.base}/${id}`, payload);
  }

  updateStatus(id: number, status: string): Observable<Order> {
    return this.http.patch<Order>(`${this.base}/${id}/status`, null, { params: { status } });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
