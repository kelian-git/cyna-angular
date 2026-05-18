import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Category, Product, SearchFilters } from '../../core/models';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { SearchService } from '../../core/services/search.service';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { ProductCardComponent } from '../../shared/ui/product-card/product-card.component';

type SortKey = 'relevance' | 'price-asc' | 'price-desc' | 'availability';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    FormsModule,
    TranslateModule,
    EmptyStateComponent,
    LoaderComponent,
    ProductCardComponent,
  ],
  template: `
    <div class="container-page grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
      <aside class="card h-fit p-4">
        <h2 class="mb-3 font-bold text-brand-900">{{ 'search.title' | translate }}</h2>
        <label class="mb-1 block text-sm font-medium">{{ 'search.keyword' | translate }}</label>
        <input class="input-field mb-3" [(ngModel)]="keyword" (ngModelChange)="apply()" />

        <div class="mb-3 grid grid-cols-2 gap-2">
          <div>
            <label class="mb-1 block text-sm font-medium">{{ 'search.priceMin' | translate }}</label>
            <input type="number" class="input-field" [(ngModel)]="priceMin" (ngModelChange)="apply()" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium">{{ 'search.priceMax' | translate }}</label>
            <input type="number" class="input-field" [(ngModel)]="priceMax" (ngModelChange)="apply()" />
          </div>
        </div>

        <label class="mb-1 block text-sm font-medium">{{ 'search.categoryFilter' | translate }}</label>
        <div class="mb-3 flex flex-col gap-1">
          @for (c of categories(); track c.idCategory) {
            <label class="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                [checked]="selectedCats().includes(c.idCategory)"
                (change)="toggleCat(c.idCategory)"
              />
              {{ c.name }}
            </label>
          }
        </div>

        <label class="mb-3 flex items-center gap-2 text-sm">
          <input type="checkbox" [(ngModel)]="onlyAvailable" (ngModelChange)="apply()" />
          {{ 'search.onlyAvailable' | translate }}
        </label>

        <label class="mb-1 block text-sm font-medium">{{ 'search.sortBy' | translate }}</label>
        <select class="input-field" [(ngModel)]="sort" (ngModelChange)="apply()">
          <option value="relevance">Pertinence</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
          <option value="availability">Disponibilité</option>
        </select>
      </aside>

      <section>
        @if (loading()) {
          <app-loader />
        } @else {
          <p class="mb-4 text-sm text-gray-500">
            {{ 'search.results' | translate: { count: results().length } }}
          </p>
          @if (results().length === 0) {
            <app-empty-state [title]="'search.noResult' | translate" icon="🔍" />
          } @else {
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              @for (p of results(); track p.idProduct) {
                <app-product-card [product]="p" (add)="addToCart($event)" />
              }
            </div>
          }
        }
      </section>
    </div>
  `,
})
export class SearchComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly searchService = inject(SearchService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  private readonly allProducts = signal<Product[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly selectedCats = signal<number[]>([]);
  readonly loading = signal(true);
  readonly results = signal<Product[]>([]);

  keyword = '';
  priceMin: number | null = null;
  priceMax: number | null = null;
  onlyAvailable = false;
  sort: SortKey = 'relevance';

  ngOnInit(): void {
    this.categoryService.getAll().subscribe((c) => this.categories.set(c));
    this.route.queryParamMap.subscribe((q) => {
      const term = q.get('q');
      if (term) this.keyword = term;
    });
    this.productService.getAll().subscribe({
      next: (p) => {
        this.allProducts.set(p);
        this.loading.set(false);
        this.apply();
      },
      error: () => this.loading.set(false),
    });
  }

  toggleCat(id: number): void {
    const cur = this.selectedCats();
    this.selectedCats.set(
      cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id],
    );
    this.apply();
  }

  apply(): void {
    const filters: SearchFilters = {
      keyword: this.keyword,
      priceMin: this.priceMin,
      priceMax: this.priceMax,
      categoryIds: this.selectedCats(),
      onlyAvailable: this.onlyAvailable,
    };
    let list = this.searchService.searchProducts(this.allProducts(), filters);
    if (this.sort === 'price-asc') list = [...list].sort((a, b) => a.price - b.price);
    else if (this.sort === 'price-desc') list = [...list].sort((a, b) => b.price - a.price);
    else if (this.sort === 'availability')
      list = [...list].sort((a, b) => Number(b.available) - Number(a.available));
    this.results.set(list);
  }

  addToCart(p: Product): void {
    this.cart.add(p, 1);
    this.toast.success(`${p.name} ajouté au panier`);
  }
}
