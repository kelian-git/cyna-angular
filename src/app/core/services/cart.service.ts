import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, forkJoin, of, switchMap } from 'rxjs';
import { Cart, LocalCartItem, Product } from '../models';
import { readJson, writeJson } from '../utils/storage.util';
import { AuthService } from './auth.service';
import { CartApiService } from './cart-api.service';
import { CartItemService } from './cart-item.service';

const STORAGE_KEY = 'cyna-cart';

/**
 * Panier client-side persisté (localStorage). La synchronisation avec
 * /api/carts est déclenchée à la connexion ou au checkout (syncToBackend).
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly auth = inject(AuthService);
  private readonly cartApi = inject(CartApiService);
  private readonly cartItemApi = inject(CartItemService);

  private readonly itemsSignal = signal<LocalCartItem[]>(
    readJson<LocalCartItem[]>(STORAGE_KEY, []),
  );
  readonly items = this.itemsSignal.asReadonly();
  readonly count = computed(() => this.itemsSignal().reduce((s, it) => s + it.quantity, 0));
  readonly total = computed(() =>
    this.itemsSignal().reduce((s, it) => s + it.quantity * (it.product.price || 0), 0),
  );

  private persist(items: LocalCartItem[]): void {
    this.itemsSignal.set(items);
    writeJson(STORAGE_KEY, items);
  }

  add(product: Product, quantity = 1): void {
    const items = this.itemsSignal();
    const existing = items.find((it) => it.product.idProduct === product.idProduct);
    if (existing) {
      this.persist(
        items.map((it) =>
          it.product.idProduct === product.idProduct
            ? { ...it, quantity: it.quantity + quantity }
            : it,
        ),
      );
    } else {
      this.persist([...items, { product, quantity }]);
    }
  }

  updateQuantity(idProduct: number, quantity: number): void {
    if (quantity <= 0) return this.remove(idProduct);
    this.persist(
      this.itemsSignal().map((it) =>
        it.product.idProduct === idProduct ? { ...it, quantity } : it,
      ),
    );
  }

  remove(idProduct: number): void {
    this.persist(this.itemsSignal().filter((it) => it.product.idProduct !== idProduct));
  }

  clear(): void {
    this.persist([]);
  }

  getTotal(): number {
    return this.total();
  }

  /**
   * Pousse le panier local vers le back pour l'utilisateur connecté
   * (crée le panier s'il n'existe pas, vide puis ré-ajoute les items).
   */
  syncToBackend(): Observable<Cart | null> {
    const user = this.auth.getCurrentUser();
    if (!user) return of(null);
    const localItems = this.itemsSignal();
    return this.cartApi.getByUser(user.idUser).pipe(
      switchMap((cart) => (cart ? of(cart) : this.cartApi.create(user.idUser))),
      switchMap((cart) =>
        this.cartItemApi.clear(cart.idCart).pipe(switchMap(() => of(cart))),
      ),
      switchMap((cart) => {
        if (!localItems.length) return of(cart);
        return forkJoin(
          localItems.map((it) =>
            this.cartItemApi.add(cart.idCart, it.product.idProduct, it.quantity),
          ),
        ).pipe(switchMap(() => of(cart)));
      }),
    );
  }
}
