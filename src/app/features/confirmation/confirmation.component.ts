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
  template: `
    <div class="container-page max-w-2xl text-center">
      <div class="text-6xl">✅</div>
      <h1 class="mt-4 text-2xl font-bold text-brand-900">Merci pour votre commande !</h1>
      <p class="mt-2 text-gray-600">
        Un email de confirmation vous a été envoyé (simulé).
      </p>

      @if (recap) {
        <div class="card mt-6 p-6 text-left">
          <p class="mb-3 font-semibold text-brand-900">
            Commande n° {{ recap.order?.idOrder ?? reference }}
          </p>
          <ul class="divide-y">
            @for (it of recap.items; track it.name) {
              <li class="flex justify-between py-2 text-sm">
                <span>{{ it.name }} × {{ it.quantity }}</span>
                <span>{{ money(it.price * it.quantity) }}</span>
              </li>
            }
          </ul>
          <div class="mt-3 flex justify-between font-bold text-brand-900">
            <span>Total</span><span>{{ money(recap.total) }}</span>
          </div>
          @if (recap.address) {
            <p class="mt-3 text-sm text-gray-600">
              Adresse : {{ recap.address['firstName'] }} {{ recap.address['lastName'] }},
              {{ recap.address['line1'] }}, {{ recap.address['zip'] }}
              {{ recap.address['city'] }}
            </p>
          }
          @if (recap.last4) {
            <p class="text-sm text-gray-600">Paiement : {{ recap.last4 }}</p>
          }
        </div>
      }

      <a routerLink="/" class="btn-primary mt-6">Retour à l'accueil</a>
    </div>
  `,
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
