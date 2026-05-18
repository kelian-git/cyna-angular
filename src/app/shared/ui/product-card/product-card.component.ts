import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '../../../core/models';
import { formatPrice } from '../../../core/utils/formatters.util';
import { BadgeComponent } from '../badge/badge.component';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, TranslateModule, BadgeComponent],
  template: `
    <article
      class="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <a [routerLink]="['/produits', product.idProduct]" class="block overflow-hidden">
        <img
          [src]="product.imageUrl"
          [alt]="product.name"
          loading="lazy"
          class="h-44 w-full object-cover transition group-hover:scale-105"
        />
      </a>
      <div class="flex flex-1 flex-col gap-2 p-4">
        <div class="flex items-start justify-between gap-2">
          <a
            [routerLink]="['/produits', product.idProduct]"
            class="font-semibold text-brand-900 hover:underline"
          >
            {{ product.name }}
          </a>
          @if (!product.available) {
            <app-badge tone="danger">{{ 'common.outOfStock' | translate }}</app-badge>
          }
        </div>
        <p class="line-clamp-2 text-sm text-gray-500">{{ product.des }}</p>
        <div class="mt-auto flex items-center justify-between pt-2">
          <span class="text-lg font-bold text-brand-800">{{ price }}</span>
          <button
            type="button"
            class="rounded-lg bg-brand-800 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-900 disabled:opacity-40"
            [disabled]="!product.available"
            (click)="add.emit(product)"
          >
            {{ 'product.addToCart' | translate }}
          </button>
        </div>
      </div>
    </article>
  `,
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() add = new EventEmitter<Product>();

  get price(): string {
    return formatPrice(this.product?.price);
  }
}
