import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Product } from '../../../core/models';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { formatPrice } from '../../../core/utils/formatters.util';
import { LoaderComponent } from '../../../shared/ui/loader/loader.component';

type SortCol = 'name' | 'price' | 'stock';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [RouterLink, LoaderComponent],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss'
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
