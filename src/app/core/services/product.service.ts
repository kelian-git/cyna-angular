import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Product, ProductPayload, RawProduct } from '../models';
import { enrichProduct } from '../utils/product-enrichment.util';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/products';

  getAll(): Observable<Product[]> {
    return this.http
      .get<RawProduct[]>(this.base)
      .pipe(map((list) => list.map((p) => enrichProduct(p))));
  }

  getById(id: number): Observable<Product> {
    return this.http.get<RawProduct>(`${this.base}/${id}`).pipe(map((p) => enrichProduct(p)));
  }

  getByCategory(categoryId: number, categoryName?: string): Observable<Product[]> {
    return this.http
      .get<RawProduct[]>(`${this.base}/category/${categoryId}`)
      .pipe(map((list) => list.map((p) => enrichProduct(p, categoryName))));
  }

  search(keyword: string): Observable<Product[]> {
    return this.http
      .get<RawProduct[]>(`${this.base}/search`, { params: { keyword } })
      .pipe(map((list) => list.map((p) => enrichProduct(p))));
  }

  priceRange(min: number, max: number): Observable<Product[]> {
    return this.http
      .get<RawProduct[]>(`${this.base}/price-range`, { params: { min, max } })
      .pipe(map((list) => list.map((p) => enrichProduct(p))));
  }

  inStock(): Observable<Product[]> {
    return this.http
      .get<RawProduct[]>(`${this.base}/in-stock`)
      .pipe(map((list) => list.map((p) => enrichProduct(p))));
  }

  create(payload: ProductPayload, categoryId: number): Observable<Product> {
    return this.http
      .post<RawProduct>(this.base, payload, { params: { categoryId } })
      .pipe(map((p) => enrichProduct(p)));
  }

  update(id: number, payload: ProductPayload): Observable<Product> {
    return this.http
      .put<RawProduct>(`${this.base}/${id}`, payload)
      .pipe(map((p) => enrichProduct(p)));
  }

  updateStock(id: number, quantity: number): Observable<Product> {
    return this.http
      .patch<RawProduct>(`${this.base}/${id}/stock`, null, { params: { quantity } })
      .pipe(map((p) => enrichProduct(p)));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
