import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Order } from '../../core/models';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { formatDate, formatPrice } from '../../core/utils/formatters.util';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [FormsModule, RouterLink, BadgeComponent, EmptyStateComponent, LoaderComponent],
  template: `
    <div class="container-page">
      <h1 class="mb-6 text-2xl font-bold text-brand-900">Mes commandes</h1>

      <div class="mb-4 flex flex-wrap gap-3">
        <input
          class="input-field max-w-xs"
          [(ngModel)]="search"
          placeholder="Rechercher (produit, n°)"
        />
        <select class="input-field max-w-[160px]" [(ngModel)]="yearFilter">
          <option value="">Toutes les années</option>
          @for (y of years(); track y) {
            <option [value]="y">{{ y }}</option>
          }
        </select>
        <select class="input-field max-w-[180px]" [(ngModel)]="statusFilter">
          <option value="">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="DELIVERED">Livrée</option>
          <option value="COMPLETED">Terminée</option>
          <option value="CANCELLED">Annulée</option>
        </select>
      </div>

      @if (loading()) {
        <app-loader />
      } @else if (filtered().length === 0) {
        <app-empty-state title="Aucune commande" icon="📋" />
      } @else {
        @for (group of grouped(); track group.year) {
          <section class="mb-6">
            <h2 class="mb-2 font-bold text-brand-900">{{ group.year }}</h2>
            <div class="flex flex-col gap-2">
              @for (o of group.orders; track o.idOrder) {
                <div class="card flex items-center justify-between p-4">
                  <div>
                    <a
                      [routerLink]="['/compte/commandes', o.idOrder]"
                      class="font-semibold text-brand-700 hover:underline"
                      >Commande #{{ o.idOrder }}</a
                    >
                    <p class="text-sm text-gray-500">
                      {{ date(o.orderDate) }} —
                      {{ o.orderItems?.length || 0 }} article(s)
                    </p>
                  </div>
                  <div class="flex items-center gap-4">
                    <span class="font-bold text-brand-800">{{ money(o.totalAmount) }}</span>
                    <app-badge [tone]="tone(o.status)">{{ o.status }}</app-badge>
                    <button type="button" class="text-sm text-brand-700" (click)="downloadInvoice()">
                      Facture
                    </button>
                  </div>
                </div>
              }
            </div>
          </section>
        }
      }
    </div>
  `,
})
export class OrdersComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);

  search = '';
  yearFilter = '';
  statusFilter = '';

  readonly filtered = computed(() => {
    const s = this.search.toLowerCase();
    return this.orders().filter((o) => {
      if (this.statusFilter && o.status !== this.statusFilter) return false;
      if (this.yearFilter && new Date(o.orderDate).getFullYear().toString() !== this.yearFilter)
        return false;
      if (
        s &&
        !String(o.idOrder).includes(s) &&
        !(o.orderItems || []).some((i) => i.product?.name?.toLowerCase().includes(s))
      )
        return false;
      return true;
    });
  });

  readonly years = computed(() => [
    ...new Set(this.orders().map((o) => new Date(o.orderDate).getFullYear())),
  ]);

  readonly grouped = computed(() => {
    const map = new Map<number, Order[]>();
    for (const o of this.filtered()) {
      const y = new Date(o.orderDate).getFullYear();
      map.set(y, [...(map.get(y) || []), o]);
    }
    return [...map.entries()]
      .sort((a, b) => b[0] - a[0])
      .map(([year, orders]) => ({ year, orders }));
  });

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.loading.set(false);
      return;
    }
    this.orderService.getByUser(user.idUser).subscribe({
      next: (o) => this.orders.set(o),
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  date(v: string): string {
    return formatDate(v);
  }
  money(v: number): string {
    return formatPrice(v);
  }
  tone(status: string): 'success' | 'danger' | 'info' | 'warning' | 'neutral' {
    if (status === 'COMPLETED' || status === 'DELIVERED') return 'success';
    if (status === 'CANCELLED') return 'danger';
    if (status === 'PENDING') return 'warning';
    return 'neutral';
  }
  downloadInvoice(): void {
    this.toast.info('Téléchargement de la facture (simulé).');
  }
}
