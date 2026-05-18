import { Injectable } from '@angular/core';
import { Product, SearchFilters } from '../models';
import { matchScore } from '../utils/levenshtein.util';

/**
 * Recherche locale avec matching à 4 niveaux + facettes.
 * Performant (< 100ms sur le catalogue) : tout est fait en mémoire.
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  matchScore(query: string, text: string): number {
    return matchScore(text, query);
  }

  searchProducts(products: Product[], filters: SearchFilters): Product[] {
    const keyword = (filters.keyword || '').trim();
    let results = products.map((p) => {
      const titleScore = matchScore(p.name, keyword);
      const descScore = matchScore(p.des, keyword) * 0.5; // le titre prime sur la description
      return { product: p, score: Math.max(titleScore, descScore) };
    });

    if (keyword) results = results.filter((r) => r.score > 0);

    results = results.filter(({ product }) => {
      if (filters.priceMin != null && product.price < filters.priceMin) return false;
      if (filters.priceMax != null && product.price > filters.priceMax) return false;
      if (
        filters.categoryIds?.length &&
        !filters.categoryIds.includes(product.category?.idCategory ?? -1)
      )
        return false;
      if (filters.onlyAvailable && !(product.stock > 0)) return false;
      return true;
    });

    results.sort((a, b) => b.score - a.score);
    return results.map((r) => r.product);
  }
}
