import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order } from '../../../core/models';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { formatDate, formatPrice, maskCardNumber } from '../../../core/utils/formatters.util';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { LoaderComponent } from '../../../shared/ui/loader/loader.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, BadgeComponent, LoaderComponent],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.scss'
})
export class OrderDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);

  readonly order = signal<Order | null>(null);
  readonly loading = signal(true);
  readonly maskedCard = maskCardNumber('4242424242424242');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.loading.set(false);
      return;
    }
    this.orderService.getById(id).subscribe({
      next: (o) => this.order.set(o),
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
  download(): void {
    this.toast.info('Téléchargement de la facture PDF (simulé).');
  }
}
