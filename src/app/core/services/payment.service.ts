import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Payment } from '../models';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/payments';

  getAll(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.base);
  }

  getById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.base}/${id}`);
  }

  getByOrder(orderId: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.base}/order/${orderId}`);
  }

  getByUser(userId: number): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.base}/user/${userId}`);
  }

  getByStatus(status: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.base}/status/${status}`);
  }

  getByMethod(method: string): Observable<Payment[]> {
    return this.http.get<Payment[]>(`${this.base}/method/${method}`);
  }

  revenue(start: string, end: string): Observable<number> {
    return this.http.get<number>(`${this.base}/revenue`, { params: { start, end } });
  }

  create(orderId: number, payload: Partial<Payment>): Observable<Payment> {
    return this.http.post<Payment>(this.base, payload, { params: { orderId } });
  }

  update(id: number, payload: Partial<Payment>): Observable<Payment> {
    return this.http.put<Payment>(`${this.base}/${id}`, payload);
  }

  updateStatus(id: number, status: string): Observable<Payment> {
    return this.http.patch<Payment>(`${this.base}/${id}/status`, null, { params: { status } });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
