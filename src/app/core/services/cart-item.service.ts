import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { CartItem } from '../models';

@Injectable({ providedIn: 'root' })
export class CartItemService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/cart-items';

  listByCart(idCart: number): Observable<CartItem[]> {
    return this.http.get<CartItem[]>(`${this.base}/cart/${idCart}`);
  }

  add(idCart: number, idProduct: number, quantity = 1): Observable<CartItem> {
    return this.http.post<CartItem>(this.base, { idCart, idProduct, quantity });
  }

  updateQuantity(idCartItem: number, quantity: number): Observable<CartItem> {
    return this.http.put<CartItem>(`${this.base}/${idCartItem}`, { quantity });
  }

  remove(idCartItem: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${idCartItem}`);
  }

  clear(idCart: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/cart/${idCart}`);
  }
}
