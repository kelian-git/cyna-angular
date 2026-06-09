import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '../../core/models';
import { CartService } from '../../core/services/cart.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { formatPrice } from '../../core/utils/formatters.util';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';
import { ProductCardComponent } from '../../shared/ui/product-card/product-card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [TranslateModule, LoaderComponent, ProductCardComponent, BadgeComponent],
  templateUrl: './product.component.html'
})
export class ProductComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productService = inject(ProductService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  readonly product = signal<Product | null>(null);
  readonly similar = signal<Product[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!id) return;
      this.loading.set(true);
      this.product.set(null);
      this.productService.getById(id).subscribe({
        next: (p) => {
          this.product.set(p);
          this.loading.set(false);
          this.loadSimilar(p);
        },
        error: () => this.loading.set(false),
      });
    });
  }

  private loadSimilar(p: Product): void {
    const catId = p.category?.idCategory;
    const source$ = catId
      ? this.productService.getByCategory(catId)
      : this.productService.getAll();
    source$.subscribe((list) =>
      this.similar.set(list.filter((x) => x.idProduct !== p.idProduct).slice(0, 6)),
    );
  }

  price(v: number | undefined): string {
    return formatPrice(v);
  }

  addToCart(p: Product): void {
    if (!p.available) return;
    this.cart.add(p, 1);
    this.toast.success(`${p.name} ajouté au panier`);
  }
}
