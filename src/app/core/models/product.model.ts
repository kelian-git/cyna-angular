/** Forme renvoyée par le back (modèle simple). */
export interface RawProduct {
  idProduct: number;
  name: string;
  price: number;
  des: string;
  stock: number;
}

export interface ProductPricing {
  monthly: number;
  yearly: number;
  perUser: number;
}

/** Produit enrichi côté front (image, dispo, pricing dérivé, caractéristiques mockées). */
export interface Product extends RawProduct {
  category?: { idCategory: number; name: string } | null;
  categoryName?: string;
  available?: boolean;
  imageUrl?: string;
  characteristics?: string[];
  priority?: number;
  pricing?: ProductPricing;
}

/** Payload de création/édition admin. */
export interface ProductPayload {
  name: string;
  price: number;
  des: string;
  stock: number;
}
