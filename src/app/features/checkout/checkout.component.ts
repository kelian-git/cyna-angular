import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { formatPrice, maskCardNumber } from '../../core/utils/formatters.util';
import {
  CARD_NUMBER_REGEX,
  CVV_REGEX,
  EXPIRY_REGEX,
  patternValidator,
} from '../../core/utils/validators.util';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly step = signal(1);
  readonly guest = signal(false);
  readonly submitting = signal(false);

  readonly steps = [
    { n: 1, label: 'Compte' },
    { n: 2, label: 'Adresse' },
    { n: 3, label: 'Paiement' },
    { n: 4, label: 'Confirmation' },
  ];

  readonly addressForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    line1: ['', Validators.required],
    line2: [''],
    city: ['', Validators.required],
    region: ['', Validators.required],
    zip: ['', Validators.required],
    country: ['', Validators.required],
    phone: ['', Validators.required],
  });

  readonly paymentForm = this.fb.nonNullable.group({
    cardName: ['', Validators.required],
    cardNumber: ['', [Validators.required, patternValidator(CARD_NUMBER_REGEX, 'card')]],
    expiry: ['', [Validators.required, patternValidator(EXPIRY_REGEX, 'expiry')]],
    cvv: ['', [Validators.required, patternValidator(CVV_REGEX, 'cvv')]],
  });

  money(v: number): string {
    return formatPrice(v);
  }

  maskedCard(): string {
    return maskCardNumber(this.paymentForm.value.cardNumber);
  }

  confirm(): void {
    if (this.cart.items().length === 0) {
      this.toast.error('Votre panier est vide.');
      return;
    }
    this.submitting.set(true);
    const recap = {
      total: this.cart.total(),
      items: this.cart.items().map((i) => ({
        name: i.product.name,
        quantity: i.quantity,
        price: i.product.price,
      })),
      address: this.addressForm.value,
      last4: maskCardNumber(this.paymentForm.value.cardNumber),
    };
    const user = this.auth.getCurrentUser();

    if (user) {
      this.cart.syncToBackend().subscribe({
        next: () => {
          this.orderService.checkout(user.idUser).subscribe({
            next: (order) => this.finish({ ...recap, order }),
            error: () => this.finish(recap),
          });
        },
        error: () => this.finish(recap),
      });
    } else {
      this.finish(recap);
    }
  }

  private finish(recap: unknown): void {
    this.submitting.set(false);
    this.toast.success('Commande confirmée — un email de confirmation a été envoyé (simulé).');
    this.cart.clear();
    this.router.navigate(['/confirmation'], { state: { recap } });
  }
}
