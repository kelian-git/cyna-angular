import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order, Subscription } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { formatDate, formatPrice } from '../../core/utils/formatters.util';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterLink, BadgeComponent, LoaderComponent],
  template: `
    <div class="container-page">
      <h1 class="mb-2 text-2xl font-bold text-brand-900">Mon compte</h1>
      <p class="mb-6 text-gray-500">{{ auth.getCurrentUser()?.name }} — {{ auth.getCurrentUser()?.email }}</p>

      <div class="mb-6 flex gap-3">
        <a routerLink="/compte/parametres" class="btn-secondary">Mes paramètres</a>
        <a routerLink="/compte/commandes" class="btn-secondary">Mes commandes</a>
      </div>

      @if (loading()) {
        <app-loader />
      } @else {
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section class="card p-5">
            <h2 class="mb-3 font-bold text-brand-900">Abonnements actifs</h2>
            @if (subscriptions().length === 0) {
              <p class="text-sm text-gray-500">Aucun abonnement actif.</p>
            } @else {
              <ul class="flex flex-col gap-2">
                @for (s of subscriptions(); track s.idSubscription) {
                  <li class="flex justify-between text-sm">
                    <span>Du {{ date(s.startDate) }} au {{ date(s.endDate) }}</span>
                    <app-badge [tone]="s.status === 'ACTIVE' ? 'success' : 'neutral'">{{
                      s.status
                    }}</app-badge>
                  </li>
                }
              </ul>
            }
          </section>

          <section class="card p-5">
            <h2 class="mb-3 font-bold text-brand-900">Commandes récentes</h2>
            @if (orders().length === 0) {
              <p class="text-sm text-gray-500">Aucune commande.</p>
            } @else {
              <ul class="flex flex-col gap-2">
                @for (o of orders(); track o.idOrder) {
                  <li class="flex justify-between text-sm">
                    <a [routerLink]="['/compte/commandes', o.idOrder]" class="text-brand-700 hover:underline"
                      >#{{ o.idOrder }} — {{ date(o.orderDate) }}</a
                    >
                    <span>{{ money(o.totalAmount) }}</span>
                  </li>
                }
              </ul>
            }
          </section>
        </div>
      }
    </div>
  `,
})
export class AccountComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly subService = inject(SubscriptionService);

  readonly orders = signal<Order[]>([]);
  readonly subscriptions = signal<Subscription[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.loading.set(false);
      return;
    }
    let done = 0;
    const finish = () => {
      if (++done === 2) this.loading.set(false);
    };
    this.orderService.getByUser(user.idUser).subscribe({
      next: (o) => this.orders.set(o.slice(0, 5)),
      complete: finish,
      error: finish,
    });
    this.subService.getByUser(user.idUser).subscribe({
      next: (s) => this.subscriptions.set(s.filter((x) => x.status === 'ACTIVE')),
      complete: finish,
      error: finish,
    });
  }

  date(v: string): string {
    return formatDate(v);
  }
  money(v: number): string {
    return formatPrice(v);
  }
}
