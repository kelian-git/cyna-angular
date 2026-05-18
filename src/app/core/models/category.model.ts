import type { Product } from './product.model';

export interface Category {
  idCategory: number;
  name: string;
  products?: Product[];
  /** Champs enrichis côté front (le back ne les fournit pas). */
  description?: string;
  imageUrl?: string;
  order?: number;
}

export interface CategoryPayload {
  name: string;
}
