import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Order } from '../../core/models';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { formatDate, formatPrice, maskCardNumber } from '../../core/utils/formatters.util';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { LoaderComponent } from '../../shared/ui/loader/loader.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [RouterLink, BadgeComponent, LoaderComponent],
  template: `
    <div class="container-page max-w-3xl">
      <a routerLink="/compte/commandes" class="text-sm text-brand-700 hover:underline"
        >← Retour aux commandes</a
      >
      @if (loading()) {
        <app-loader />
      } @else if (order()) {
        @if (order(); as o) {
        <div class="mt-4 flex items-center justify-between">
          <h1 class="text-2xl font-bold text-brand-900">Commande #{{ o.idOrder }}</h1>
          <app-badge tone="info">{{ o.status }}</app-badge>
        </div>
        <p class="mb-4 text-sm text-gray-500">Passée le {{ date(o.orderDate) }}</p>

        <div class="card mb-4 p-5">
          <h2 class="mb-3 font-bold text-brand-900">Articles</h2>
          <ul class="divide-y">
            @for (it of o.orderItems || []; track it.idOrderItem) {
              <li class="flex justify-between py-2 text-sm">
                <span>{{ it.product?.name }} × {{ it.quantity }}</span>
                <span>{{ money((it.unitPrice ?? it.product?.price ?? 0) * it.quantity) }}</span>
              </li>
            }
          </ul>
          <div class="mt-3 flex justify-between font-bold text-brand-900">
            <span>Total</span><span>{{ money(o.totalAmount) }}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="card p-5">
            <h2 class="mb-2 font-bold text-brand-900">Paiement</h2>
            <p class="text-sm text-gray-600">
              Méthode : {{ o.payment?.method || 'CREDIT_CARD' }}<br />
              Carte : {{ maskedCard }}<br />
              Statut : {{ o.payment?.status || 'PAID' }}
            </p>
          </div>
          <div class="card p-5">
            <h2 class="mb-2 font-bold text-brand-900">Facturation</h2>
            <p class="text-sm text-gray-600">
              @if (o.invoice) {
                Facture n° {{ o.invoice.idInvoice }} — {{ date(o.invoice.invoiceDate) }}
              } @else {
                Facture en cours de génération.
              }
            </p>
            <button type="button" class="btn-secondary mt-3" (click)="download()">
              Télécharger la facture PDF (simulé)
            </button>
          </div>
        </div>
        }
      } @else {
        <p class="py-20 text-center text-gray-500">Commande introuvable.</p>
      }
    </div>
  `,
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
