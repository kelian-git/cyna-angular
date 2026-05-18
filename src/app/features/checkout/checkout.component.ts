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
  template: `
    <div class="container-page max-w-3xl">
      <h1 class="mb-6 text-2xl font-bold text-brand-900">Commande</h1>

      <ol class="mb-8 flex items-center gap-2 text-sm">
        @for (s of steps; track s.n) {
          <li
            class="flex-1 rounded-lg px-3 py-2 text-center"
            [class.bg-brand-800]="step() === s.n"
            [class.text-white]="step() === s.n"
            [class.bg-gray-100]="step() !== s.n"
          >
            {{ s.n }}. {{ s.label }}
          </li>
        }
      </ol>

      <!-- Étape 1 — Authentification -->
      @if (step() === 1) {
        <div class="card flex flex-col gap-3 p-6">
          @if (auth.isAuthenticated()) {
            <p>Connecté en tant que <strong>{{ auth.getCurrentUser()?.email }}</strong></p>
            <button type="button" class="btn-primary self-start" (click)="step.set(2)">
              Continuer
            </button>
          } @else {
            <p class="text-gray-600">Comment souhaitez-vous continuer ?</p>
            <a routerLink="/connexion" [queryParams]="{ returnUrl: '/checkout' }" class="btn-primary"
              >Se connecter</a
            >
            <a routerLink="/inscription" class="btn-secondary">Créer un compte</a>
            <button type="button" class="btn-secondary" (click)="guest.set(true); step.set(2)">
              Continuer en invité
            </button>
          }
        </div>
      }

      <!-- Étape 2 — Adresse -->
      @if (step() === 2) {
        <form [formGroup]="addressForm" class="card grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
          <input class="input-field" formControlName="firstName" placeholder="Prénom *" />
          <input class="input-field" formControlName="lastName" placeholder="Nom *" />
          <input
            class="input-field sm:col-span-2"
            formControlName="line1"
            placeholder="Adresse *"
          />
          <input
            class="input-field sm:col-span-2"
            formControlName="line2"
            placeholder="Complément d'adresse (optionnel)"
          />
          <input class="input-field" formControlName="city" placeholder="Ville *" />
          <input class="input-field" formControlName="region" placeholder="Région *" />
          <input class="input-field" formControlName="zip" placeholder="Code postal *" />
          <input class="input-field" formControlName="country" placeholder="Pays *" />
          <input
            class="input-field sm:col-span-2"
            formControlName="phone"
            placeholder="Téléphone *"
          />
          <div class="sm:col-span-2 flex justify-between">
            <button type="button" class="btn-secondary" (click)="step.set(1)">Retour</button>
            <button
              type="button"
              class="btn-primary"
              [disabled]="addressForm.invalid"
              (click)="step.set(3)"
            >
              Suivant
            </button>
          </div>
        </form>
      }

      <!-- Étape 3 — Paiement (factice) -->
      @if (step() === 3) {
        <form [formGroup]="paymentForm" class="card grid grid-cols-1 gap-3 p-6 sm:grid-cols-2">
          <input
            class="input-field sm:col-span-2"
            formControlName="cardName"
            placeholder="Nom sur la carte *"
          />
          <input
            class="input-field sm:col-span-2"
            formControlName="cardNumber"
            placeholder="Numéro de carte (16 chiffres) *"
            maxlength="16"
          />
          <input class="input-field" formControlName="expiry" placeholder="MM/AA *" />
          <input class="input-field" formControlName="cvv" placeholder="CVV *" maxlength="4" />
          <p class="sm:col-span-2 text-xs text-gray-400">
            Formulaire de démonstration — aucun paiement réel n'est effectué.
          </p>
          <div class="sm:col-span-2 flex justify-between">
            <button type="button" class="btn-secondary" (click)="step.set(2)">Retour</button>
            <button
              type="button"
              class="btn-primary"
              [disabled]="paymentForm.invalid"
              (click)="step.set(4)"
            >
              Suivant
            </button>
          </div>
        </form>
      }

      <!-- Étape 4 — Confirmation -->
      @if (step() === 4) {
        <div class="card flex flex-col gap-4 p-6">
          <h2 class="font-bold text-brand-900">Récapitulatif</h2>
          <ul class="divide-y">
            @for (it of cart.items(); track it.product.idProduct) {
              <li class="flex justify-between py-2 text-sm">
                <span>{{ it.product.name }} × {{ it.quantity }}</span>
                <span>{{ money(it.product.price * it.quantity) }}</span>
              </li>
            }
          </ul>
          <div class="flex justify-between font-bold text-brand-900">
            <span>Total</span><span>{{ money(cart.total()) }}</span>
          </div>
          <p class="text-sm text-gray-600">
            Livraison : {{ addressForm.value.firstName }} {{ addressForm.value.lastName }},
            {{ addressForm.value.line1 }}, {{ addressForm.value.zip }}
            {{ addressForm.value.city }}
          </p>
          <p class="text-sm text-gray-600">Carte : {{ maskedCard() }}</p>
          <div class="flex justify-between">
            <button type="button" class="btn-secondary" (click)="step.set(3)">Retour</button>
            <button
              type="button"
              class="btn-primary"
              [disabled]="submitting()"
              (click)="confirm()"
            >
              Confirmer la commande
            </button>
          </div>
        </div>
      }
    </div>
  `,
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
