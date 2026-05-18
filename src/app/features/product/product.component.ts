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
  template: `
    <div class="container-page">
      @if (loading()) {
        <app-loader />
      } @else if (product()) {
        @if (product(); as p) {
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <img [src]="p.imageUrl" [alt]="p.name" class="h-80 w-full rounded-lg object-cover" />
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <h1 class="text-3xl font-extrabold text-brand-900">{{ p.name }}</h1>
              @if (p.available) {
                <app-badge tone="success">{{ 'common.available' | translate }}</app-badge>
              } @else {
                <app-badge tone="danger">{{ 'common.outOfStock' | translate }}</app-badge>
              }
            </div>
            <p class="text-gray-600">{{ p.des }}</p>

            <div class="grid grid-cols-3 gap-3">
              <div class="rounded-lg bg-brand-50 p-3 text-center">
                <p class="text-xs text-gray-500">{{ 'product.monthly' | translate }}</p>
                <p class="font-bold text-brand-800">{{ price(p.pricing?.monthly) }}</p>
              </div>
              <div class="rounded-lg bg-brand-50 p-3 text-center">
                <p class="text-xs text-gray-500">{{ 'product.yearly' | translate }}</p>
                <p class="font-bold text-brand-800">{{ price(p.pricing?.yearly) }}</p>
              </div>
              <div class="rounded-lg bg-brand-50 p-3 text-center">
                <p class="text-xs text-gray-500">{{ 'product.perUser' | translate }}</p>
                <p class="font-bold text-brand-800">{{ price(p.pricing?.perUser) }}</p>
              </div>
            </div>

            <div>
              <h2 class="mb-2 font-semibold text-brand-900">
                {{ 'product.features' | translate }}
              </h2>
              <ul class="flex flex-wrap gap-2">
                @for (c of p.characteristics; track c) {
                  <li class="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">{{ c }}</li>
                }
              </ul>
            </div>

            <p class="text-sm" [class.text-success]="p.available" [class.text-danger]="!p.available">
              {{
                (p.available ? 'product.available' : 'product.unavailable') | translate
              }}
            </p>

            <button
              type="button"
              class="btn-primary w-full sm:w-auto"
              [disabled]="!p.available"
              (click)="addToCart(p)"
            >
              {{
                (p.available ? 'product.subscribe' : 'product.unavailable') | translate
              }}
            </button>
          </div>
        </div>

        @if (similar().length) {
          <section class="mt-12">
            <h2 class="mb-4 text-xl font-bold text-brand-900">
              {{ 'product.similar' | translate }}
            </h2>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              @for (s of similar(); track s.idProduct) {
                <app-product-card [product]="s" (add)="addToCart($event)" />
              }
            </div>
          </section>
        }
        }
      } @else {
        <p class="py-20 text-center text-gray-500">Produit introuvable.</p>
      }
    </div>
  `,
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
