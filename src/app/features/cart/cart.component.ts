import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CartService } from '../../core/services/cart.service';
import { formatPrice } from '../../core/utils/formatters.util';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, TranslateModule, BadgeComponent, EmptyStateComponent],
  templateUrl: './cart.component.html'
})
export class CartComponent {
  readonly cart = inject(CartService);

  price(v: number): string {
    return formatPrice(v);
  }
}
