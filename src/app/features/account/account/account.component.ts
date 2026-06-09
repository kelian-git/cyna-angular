import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Order, Subscription } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { formatDate, formatPrice } from '../../../core/utils/formatters.util';
import { BadgeComponent } from '../../../shared/ui/badge/badge.component';
import { LoaderComponent } from '../../../shared/ui/loader/loader.component';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [RouterLink, BadgeComponent, LoaderComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss'
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
