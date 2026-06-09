import { Component, OnInit, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Category, Product } from '../../core/models';
import { CarouselService } from '../../core/services/carousel.service';
import { CartService } from '../../core/services/cart.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { CarouselComponent } from '../../shared/ui/carousel/carousel.component';
import { CategoryCardComponent } from '../../shared/ui/category-card/category-card.component';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { ProductCardComponent } from '../../shared/ui/product-card/product-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TranslateModule,
    CarouselComponent,
    CategoryCardComponent,
    ProductCardComponent,
    LoaderComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  readonly carousel = inject(CarouselService);
  private readonly categoryService = inject(CategoryService);
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  readonly categories = signal<Category[]>([]);
  readonly topProducts = signal<Product[]>([]);
  readonly loadingCats = signal(true);
  readonly loadingProds = signal(true);

  ngOnInit(): void {
    this.categoryService.getAll().subscribe({
      next: (c) => this.categories.set(c),
      complete: () => this.loadingCats.set(false),
      error: () => this.loadingCats.set(false),
    });
    this.productService.getAll().subscribe({
      next: (p) => this.topProducts.set(p.slice(0, 8)),
      complete: () => this.loadingProds.set(false),
      error: () => this.loadingProds.set(false),
    });
  }

  addToCart(p: Product): void {
    this.cart.add(p, 1);
    this.toast.success(`${p.name} ajouté au panier`);
  }
}
