import type { Product } from './product.model';

export interface CartItem {
  idCartItem: number;
  quantity: number;
  product: Product;
}

export interface Cart {
  idCart: number;
  createdAt?: string;
  items: CartItem[];
}

/** Item du panier local (non connecté) — persisté en localStorage. */
export interface LocalCartItem {
  product: Product;
  quantity: number;
}
