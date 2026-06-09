import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Category, Product } from '../../../core/models';
import { CategoryService } from '../../../core/services/category.service';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { sortByPriorityAndStock } from '../../../core/utils/product-enrichment.util';
import { LoaderComponent } from '../../../shared/ui/loader/loader.component';
import { ProductCardComponent } from '../../../shared/ui/product-card/product-card.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [LoaderComponent, ProductCardComponent, EmptyStateComponent],
  templateUrl: './category.component.html',
  styleUrl: './category.component.scss'
})
export class CategoryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  readonly category = signal<Category | null>(null);
  readonly products = signal<Product[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!id) return;
      this.loading.set(true);
      this.categoryService.getById(id).subscribe({
        next: (c) => {
          this.category.set(c);
          this.productService.getByCategory(id, c.name).subscribe({
            next: (p) => this.products.set(sortByPriorityAndStock(p)),
            complete: () => this.loading.set(false),
            error: () => this.loading.set(false),
          });
        },
        error: () => this.loading.set(false),
      });
    });
  }

  addToCart(p: Product): void {
    this.cart.add(p, 1);
    this.toast.success(`${p.name} ajouté au panier`);
  }
}
