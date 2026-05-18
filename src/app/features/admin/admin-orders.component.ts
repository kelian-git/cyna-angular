import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Order } from '../../core/models';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { formatDate, formatPrice } from '../../core/utils/formatters.util';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';

const STATUSES = ['PENDING', 'DELIVERED', 'COMPLETED', 'CANCELLED'];

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [FormsModule, BadgeComponent, LoaderComponent],
  template: `
    <h1 class="mb-6 text-2xl font-bold text-brand-900">Commandes</h1>

    <div class="mb-4 flex flex-wrap gap-3">
      <input class="input-field max-w-xs" [(ngModel)]="search" placeholder="Rechercher (n°)" />
      <select class="input-field max-w-[180px]" [(ngModel)]="statusFilter">
        <option value="">Tous les statuts</option>
        @for (s of statuses; track s) {
          <option [value]="s">{{ s }}</option>
        }
      </select>
      <input type="date" class="input-field max-w-[180px]" [(ngModel)]="dateFilter" />
    </div>

    @if (loading()) {
      <app-loader />
    } @else {
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="border-b text-gray-500">
            <tr>
              <th class="p-2">N°</th>
              <th class="p-2">Date</th>
              <th class="p-2">Articles</th>
              <th class="p-2">Montant</th>
              <th class="p-2">Statut</th>
              <th class="p-2">Changer</th>
            </tr>
          </thead>
          <tbody>
            @for (o of filtered(); track o.idOrder) {
              <tr class="border-b hover:bg-gray-50">
                <td class="p-2 font-medium">#{{ o.idOrder }}</td>
                <td class="p-2">{{ date(o.orderDate) }}</td>
                <td class="p-2">{{ o.orderItems?.length || 0 }}</td>
                <td class="p-2">{{ money(o.totalAmount) }}</td>
                <td class="p-2"><app-badge [tone]="tone(o.status)">{{ o.status }}</app-badge></td>
                <td class="p-2">
                  <select
                    class="input-field"
                    [ngModel]="o.status"
                    (ngModelChange)="changeStatus(o, $event)"
                    [attr.aria-label]="'Statut commande ' + o.idOrder"
                  >
                    @for (s of statuses; track s) {
                      <option [value]="s">{{ s }}</option>
                    }
                  </select>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }
  `,
})
export class AdminOrdersComponent implements OnInit {
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);

  readonly orders = signal<Order[]>([]);
  readonly loading = signal(true);
  readonly statuses = STATUSES;

  search = '';
  statusFilter = '';
  dateFilter = '';

  readonly filtered = computed(() => {
    const s = this.search.toLowerCase();
    return this.orders().filter((o) => {
      if (this.statusFilter && o.status !== this.statusFilter) return false;
      if (s && !String(o.idOrder).includes(s)) return false;
      if (this.dateFilter && !String(o.orderDate).startsWith(this.dateFilter)) return false;
      return true;
    });
  });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.orderService.getAll().subscribe({
      next: (o) => this.orders.set(o),
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }

  changeStatus(o: Order, status: string): void {
    this.orderService.updateStatus(o.idOrder, status).subscribe({
      next: () => {
        this.toast.success(`Commande #${o.idOrder} → ${status}`);
        this.load();
      },
      error: () => this.toast.error('Échec de la mise à jour du statut.'),
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
}
