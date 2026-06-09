import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Order } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { formatDate, formatPrice } from '../../../core/utils/formatters.util';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state/empty-state.component';
import { LoaderComponent } from '../../../shared/ui/loader/loader.component';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [FormsModule, RouterLink, BadgeComponent, EmptyStateComponent, LoaderComponent],
  templateUrl: './orders.component.html'
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
