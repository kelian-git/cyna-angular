import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Product } from '../../core/models';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { formatPrice } from '../../core/utils/formatters.util';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';

type SortCol = 'name' | 'price' | 'stock';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [RouterLink, LoaderComponent],
  template: `
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-brand-900">Produits</h1>
      <a routerLink="/admin/produits/nouveau" class="btn-primary">Nouveau produit</a>
    </div>

    @if (selected().length > 0) {
      <div class="mt-4 flex items-center gap-3 rounded bg-brand-50 p-3">
        <span class="text-sm">{{ selected().length }} sélectionné(s)</span>
        <button type="button" class="btn-danger" (click)="deleteSelected()">
          Supprimer la sélection
        </button>
      </div>
    }

    @if (loading()) {
      <app-loader />
    } @else {
      <div class="mt-4 overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="border-b text-gray-500">
            <tr>
              <th class="p-2"></th>
              <th class="cursor-pointer p-2" (click)="sortBy('name')">Nom ⇅</th>
              <th class="cursor-pointer p-2" (click)="sortBy('price')">Prix ⇅</th>
              <th class="cursor-pointer p-2" (click)="sortBy('stock')">Stock ⇅</th>
              <th class="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (p of sortedProducts(); track p.idProduct) {
              <tr class="border-b hover:bg-gray-50">
                <td class="p-2">
                  <input
                    type="checkbox"
                    [checked]="selected().includes(p.idProduct)"
                    (change)="toggle(p.idProduct)"
                    [attr.aria-label]="'Sélectionner ' + p.name"
                  />
                </td>
                <td class="p-2 font-medium">{{ p.name }}</td>
                <td class="p-2">{{ money(p.price) }}</td>
                <td class="p-2">{{ p.stock }}</td>
                <td class="flex gap-3 p-2">
                  <a [routerLink]="['/produits', p.idProduct]" class="text-brand-700">Voir</a>
                  <a [routerLink]="['/admin/produits', p.idProduct, 'modifier']" class="text-brand-700"
                    >Modifier</a
                  >
                  <button type="button" class="text-danger" (click)="remove(p)">Supprimer</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class AdminProductsComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly toast = inject(ToastService);

  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);
  readonly selected = signal<number[]>([]);
  readonly sortCol = signal<SortCol>('name');
  readonly sortAsc = signal(true);

  readonly sortedProducts = computed(() => {
    const col = this.sortCol();
    const dir = this.sortAsc() ? 1 : -1;
    return [...this.products()].sort((a, b) => {
      const av = a[col];
      const bv = b[col];
      return (av > bv ? 1 : av < bv ? -1 : 0) * dir;
    });
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.productService.getAll().subscribe({
      next: (p) => this.products.set(p),
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  sortBy(col: SortCol): void {
    if (this.sortCol() === col) this.sortAsc.set(!this.sortAsc());
    else {
      this.sortCol.set(col);
      this.sortAsc.set(true);
    }
  }

  toggle(id: number): void {
    const cur = this.selected();
    this.selected.set(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  }

  remove(p: Product): void {
    if (!confirm(`Supprimer "${p.name}" ?`)) return;
    this.productService.remove(p.idProduct).subscribe({
      next: () => {
        this.toast.success('Produit supprimé.');
        this.load();
      },
    });
  }

  deleteSelected(): void {
    const ids = this.selected();
    if (!ids.length || !confirm(`Supprimer ${ids.length} produit(s) ?`)) return;
    forkJoin(ids.map((id) => this.productService.remove(id))).subscribe({
      next: () => {
        this.toast.success('Produits supprimés.');
        this.selected.set([]);
        this.load();
      },
      error: () => this.toast.error('Erreur lors de la suppression.'),
    });
  }

  money(v: number): string {
    return formatPrice(v);
  }
}
