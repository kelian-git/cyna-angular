import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Invoice } from '../models';

@Injectable({ providedIn: 'root' })
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/invoices';

  getAll(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(this.base);
  }

  getById(id: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.base}/${id}`);
  }

  getByOrder(orderId: number): Observable<Invoice> {
    return this.http.get<Invoice>(`${this.base}/order/${orderId}`);
  }

  getByUser(userId: number): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.base}/user/${userId}`);
  }

  dateRange(start: string, end: string): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.base}/date-range`, { params: { start, end } });
  }

  total(start: string, end: string): Observable<number> {
    return this.http.get<number>(`${this.base}/total`, { params: { start, end } });
  }

  create(orderId: number): Observable<Invoice> {
    return this.http.post<Invoice>(this.base, {}, { params: { orderId } });
  }

  update(id: number, payload: Partial<Invoice>): Observable<Invoice> {
    return this.http.put<Invoice>(`${this.base}/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
