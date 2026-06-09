import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Order } from '../../../core/models';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { formatDate, formatPrice } from '../../../core/utils/formatters.util';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { LoaderComponent } from '../../../shared/ui/loader/loader.component';

const STATUSES = ['PENDING', 'DELIVERED', 'COMPLETED', 'CANCELLED'];

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [FormsModule, BadgeComponent, LoaderComponent],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss'
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
