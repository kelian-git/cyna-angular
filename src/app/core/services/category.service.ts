import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Category, CategoryPayload } from '../models';

const CATEGORY_META: Record<string, { description: string; image: string }> = {
  SOC: {
    description: 'Centre opérationnel de sécurité : surveillance et réponse 24/7.',
    image: 'https://images.unsplash.com/photo-1551808525-051fb1a87d8a?auto=format&fit=crop&w=800&q=70',
  },
  EDR: {
    description: 'Détection et réponse sur les endpoints, multi-OS.',
    image: 'https://images.unsplash.com/photo-1614064548237-02f96b3c2bd1?auto=format&fit=crop&w=800&q=70',
  },
  XDR: {
    description: 'Détection étendue : endpoints, réseau, cloud et email unifiés.',
    image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=800&q=70',
  },
  'Sécurité Cloud': {
    description: 'Protection des environnements AWS, Azure et GCP.',
    image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=70',
  },
  'Services Managés': {
    description: 'Équipes Cyna dédiées à la gestion de votre sécurité.',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=800&q=70',
  },
  'Audit & Conformité': {
    description: 'Audits ISO 27001, SOC 2 et mise en conformité RGPD.',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=70',
  },
};

const DEFAULT_IMG =
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=70';

function enrich(c: Category): Category {
  const meta = CATEGORY_META[c.name];
  return {
    ...c,
    description: c.description || meta?.description || 'Solutions de cybersécurité Cyna.',
    imageUrl: c.imageUrl || meta?.image || DEFAULT_IMG,
  };
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly http = inject(HttpClient);
  private readonly base = '/api/categories';

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.base).pipe(map((l) => l.map(enrich)));
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.base}/${id}`).pipe(map(enrich));
  }

  search(name: string): Observable<Category[]> {
    return this.http
      .get<Category[]>(`${this.base}/search`, { params: { name } })
      .pipe(map((l) => l.map(enrich)));
  }

  withProducts(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/with-products`).pipe(map((l) => l.map(enrich)));
  }

  create(payload: CategoryPayload): Observable<Category> {
    return this.http.post<Category>(this.base, payload).pipe(map(enrich));
  }

  update(id: number, payload: CategoryPayload): Observable<Category> {
    return this.http.put<Category>(`${this.base}/${id}`, payload).pipe(map(enrich));
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
