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
  templateUrl: './product-card.component.html'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() add = new EventEmitter<Product>();

  get price(): string {
    return formatPrice(this.product?.price);
  }
}
