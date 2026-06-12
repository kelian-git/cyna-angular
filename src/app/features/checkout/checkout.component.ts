import { AfterViewInit, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Stripe, StripeCardElement } from '@stripe/stripe-js';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { StripeService } from '../../core/services/stripe.service';
import { formatPrice } from '../../core/utils/formatters.util';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.component.html'
})
export class CheckoutComponent implements AfterViewInit {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  private readonly orderService = inject(OrderService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly stripeService = inject(StripeService);

  readonly step = signal(1);
  readonly guest = signal(false);
  readonly submitting = signal(false);

  // Stripe
  private stripe: Stripe | null = null;
  private card!: StripeCardElement;
  readonly cardError = signal('');
  readonly cardComplete = signal(false);
  readonly paymentError = signal('');
  readonly finalTotal = signal(0);

  // stocke le récap pour l'étape 4, une fois le paiement validé
  private pendingRecap: unknown = null;

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

  async ngAfterViewInit(): Promise<void> {
    this.stripe = await this.stripeService.getStripe();
  }

  // Appelé quand on arrive à l'étape 3 — monte le formulaire Stripe
  async initCardElement(): Promise<void> {
    if (!this.stripe || this.card) return;

    const elements = this.stripe.elements();
    this.card = elements.create('card');
    this.card.mount('#card-element');

    this.card.on('change', (event) => {
      this.cardError.set(event.error ? event.error.message ?? '' : '');
      this.cardComplete.set(event.complete);
    });
  }

  goToStep(n: number): void {
    this.step.set(n);
    if (n === 3) {
      // attendre que le DOM affiche le #card-element avant de monter Stripe
      setTimeout(() => this.initCardElement(), 0);
    }
  }

  money(v: number): string {
    return formatPrice(v);
  }

  // Étape 3 : paiement Stripe, puis création de la commande
  confirm(): void {
    if (this.cart.items().length === 0) {
      this.toast.error('Votre panier est vide.');
      return;
    }
    if (!this.stripe || !this.card) {
      this.paymentError.set('Le formulaire de paiement n\'est pas prêt.');
      return;
    }

    this.submitting.set(true);
    this.paymentError.set('');

    const amount = Math.round(this.cart.total() * 100); // montant en centimes

    this.stripeService.createPaymentIntent(amount).subscribe({
      next: async (res) => {
        const result = await this.stripe!.confirmCardPayment(res.clientSecret, {
          payment_method: { card: this.card },
        });

        if (result.error) {
          this.submitting.set(false);
          this.paymentError.set(result.error.message ?? 'Erreur de paiement.');
          return;
        }

        if (result.paymentIntent?.status === 'succeeded') {
          this.finalizeOrder();
        } else {
          this.submitting.set(false);
          this.paymentError.set('Le paiement n\'a pas pu être validé.');
        }
      },
      error: () => {
        this.submitting.set(false);
        this.paymentError.set('Erreur lors de l\'initialisation du paiement.');
      },
    });
  }

private finalizeOrder(): void {
  const recap = {
    total: this.cart.total(),
    items: this.cart.items().map((i) => ({
      name: i.product.name,
      quantity: i.quantity,
      price: i.product.price,
    })),
    address: this.addressForm.value,
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
  this.pendingRecap = recap;
  this.finalTotal.set(this.cart.total()); // <-- sauvegarde le total AVANT de clear
  this.cart.clear();
  this.step.set(4);
}


  // Étape 4 : l'utilisateur clique pour terminer
  goToConfirmation(): void {
    this.toast.success('Commande confirmée — paiement validé avec succès.');
    this.router.navigate(['/confirmation'], { state: { recap: this.pendingRecap } });
  }
}