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
  templateUrl: './search.component.html'
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
