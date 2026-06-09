import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { formatPrice } from '../../core/utils/formatters.util';

interface RecapItem {
  name: string;
  quantity: number;
  price: number;
}
interface Recap {
  total: number;
  items: RecapItem[];
  address?: Record<string, string>;
  last4?: string;
  order?: { idOrder: number };
}

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './confirmation.component.html'
})
export class ConfirmationComponent {
  private readonly router = inject(Router);
  readonly recap: Recap | null;
  readonly reference = 'CYNA-' + Math.floor(100000 + Math.random() * 900000);

  constructor() {
    const state =
      this.router.getCurrentNavigation()?.extras.state ??
      (typeof history !== 'undefined' ? history.state : {});
    this.recap = (state && state['recap']) || null;
  }

  money(v: number): string {
    return formatPrice(v);
  }
}
