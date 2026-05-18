import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from '../../core/models';
import { AddressService } from '../../core/services/address.service';
import { AuthService } from '../../core/services/auth.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { ToastService } from '../../core/services/toast.service';
import { UserService } from '../../core/services/user.service';
import { strongPasswordValidator } from '../../core/utils/validators.util';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="container-page flex max-w-3xl flex-col gap-6">
      <h1 class="text-2xl font-bold text-brand-900">Paramètres du compte</h1>

      <section class="card p-5">
        <h2 class="mb-3 font-bold text-brand-900">Profil</h2>
        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="flex flex-col gap-3">
          <input class="input-field" formControlName="name" placeholder="Nom" />
          <input class="input-field" type="email" formControlName="email" placeholder="Email" />
          <button type="submit" class="btn-primary self-start" [disabled]="profileForm.invalid">
            Enregistrer
          </button>
        </form>
      </section>

      <section class="card p-5">
        <h2 class="mb-3 font-bold text-brand-900">Mot de passe</h2>
        <form [formGroup]="passwordForm" (ngSubmit)="savePassword()" class="flex flex-col gap-3">
          <input
            class="input-field"
            type="password"
            formControlName="password"
            placeholder="Nouveau mot de passe"
          />
          <button type="submit" class="btn-primary self-start" [disabled]="passwordForm.invalid">
            Modifier
          </button>
        </form>
      </section>

      <section class="card p-5">
        <h2 class="mb-3 font-bold text-brand-900">Mes abonnements</h2>
        @if (subscriptions().length === 0) {
          <p class="text-sm text-gray-500">Aucun abonnement.</p>
        } @else {
          <ul class="flex flex-col gap-2">
            @for (s of subscriptions(); track s.idSubscription) {
              <li class="flex items-center justify-between text-sm">
                <span>#{{ s.idSubscription }} — {{ s.status }}</span>
                @if (s.status === 'ACTIVE') {
                  <button type="button" class="text-danger" (click)="cancelSub(s.idSubscription)">
                    Résilier
                  </button>
                }
              </li>
            }
          </ul>
        }
      </section>

      <section class="card p-5">
        <h2 class="mb-3 font-bold text-brand-900">Carnet d'adresses</h2>
        <form [formGroup]="addressForm" (ngSubmit)="addAddress()" class="mb-3 grid grid-cols-2 gap-2">
          <input class="input-field" formControlName="firstName" placeholder="Prénom" />
          <input class="input-field" formControlName="lastName" placeholder="Nom" />
          <input class="input-field col-span-2" formControlName="line1" placeholder="Adresse" />
          <input class="input-field" formControlName="zip" placeholder="Code postal" />
          <input class="input-field" formControlName="city" placeholder="Ville" />
          <input class="input-field" formControlName="region" placeholder="Région" />
          <input class="input-field" formControlName="country" placeholder="Pays" />
          <input class="input-field" formControlName="phone" placeholder="Téléphone" />
          <button type="submit" class="btn-secondary col-span-2" [disabled]="addressForm.invalid">
            Ajouter l'adresse
          </button>
        </form>
        <ul class="flex flex-col gap-1 text-sm">
          @for (a of addressService.addresses(); track a.id) {
            <li class="flex justify-between">
              <span>{{ a.firstName }} {{ a.lastName }} — {{ a.line1 }}, {{ a.zip }} {{ a.city }}</span>
              <button type="button" class="text-danger" (click)="addressService.removeAddress(a.id)">
                Supprimer
              </button>
            </li>
          }
        </ul>
      </section>

      <section class="card p-5">
        <h2 class="mb-3 font-bold text-brand-900">Méthodes de paiement</h2>
        <p class="mb-2 text-xs text-gray-400">
          Conforme PCI-DSS (simulé) : seuls les 4 derniers chiffres sont conservés.
        </p>
        <form [formGroup]="cardForm" (ngSubmit)="addCard()" class="mb-3 grid grid-cols-2 gap-2">
          <input class="input-field" formControlName="holder" placeholder="Titulaire" />
          <input class="input-field" formControlName="cardNumber" placeholder="Numéro de carte" />
          <input class="input-field" formControlName="expiry" placeholder="MM/AA" />
          <button type="submit" class="btn-secondary" [disabled]="cardForm.invalid">Ajouter</button>
        </form>
        <ul class="flex flex-col gap-1 text-sm">
          @for (m of addressService.methods(); track m.id) {
            <li class="flex justify-between">
              <span>•••• {{ m.last4 }} — {{ m.holder }} @if (m.isDefault) {<strong>(défaut)</strong>}</span>
              <span class="flex gap-2">
                <button type="button" class="text-brand-700" (click)="addressService.setDefaultMethod(m.id)">
                  Par défaut
                </button>
                <button type="button" class="text-danger" (click)="addressService.removeMethod(m.id)">
                  Supprimer
                </button>
              </span>
            </li>
          }
        </ul>
      </section>

      <section class="card border-danger p-5">
        <h2 class="mb-2 font-bold text-danger">Zone dangereuse (RGPD)</h2>
        <p class="mb-3 text-sm text-gray-600">
          Vous pouvez exercer votre droit à l'effacement en supprimant définitivement votre compte.
        </p>
        <button type="button" class="btn-danger" (click)="deleteAccount()">
          Supprimer mon compte
        </button>
      </section>
    </div>
  `,
})
export class AccountSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly userService = inject(UserService);
  private readonly subService = inject(SubscriptionService);
  readonly addressService = inject(AddressService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  readonly subscriptions = signal<Subscription[]>([]);

  readonly profileForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });
  readonly passwordForm = this.fb.nonNullable.group({
    password: ['', [Validators.required, strongPasswordValidator()]],
  });
  readonly addressForm = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    line1: ['', Validators.required],
    zip: ['', Validators.required],
    city: ['', Validators.required],
    region: ['', Validators.required],
    country: ['', Validators.required],
    phone: ['', Validators.required],
  });
  readonly cardForm = this.fb.nonNullable.group({
    holder: ['', Validators.required],
    cardNumber: ['', Validators.required],
    expiry: ['', Validators.required],
  });

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    this.profileForm.patchValue({ name: user.name, email: user.email });
    this.subService.getByUser(user.idUser).subscribe((s) => this.subscriptions.set(s));
  }

  saveProfile(): void {
    const user = this.auth.getCurrentUser();
    if (!user || this.profileForm.invalid) return;
    this.userService.update(user.idUser, this.profileForm.getRawValue()).subscribe({
      next: (u) => {
        this.auth.setUser({ ...user, ...u });
        this.toast.success('Profil mis à jour. Un email de confirmation a été envoyé (simulé).');
      },
    });
  }

  savePassword(): void {
    const user = this.auth.getCurrentUser();
    if (!user || this.passwordForm.invalid) return;
    this.userService
      .update(user.idUser, { password: this.passwordForm.getRawValue().password })
      .subscribe({
        next: () => {
          this.passwordForm.reset();
          this.toast.success('Mot de passe modifié.');
        },
      });
  }

  cancelSub(id: number): void {
    this.subService.cancel(id).subscribe({
      next: () => {
        const user = this.auth.getCurrentUser();
        if (user) this.subService.getByUser(user.idUser).subscribe((s) => this.subscriptions.set(s));
        this.toast.success('Abonnement résilié.');
      },
    });
  }

  addAddress(): void {
    if (this.addressForm.invalid) return;
    this.addressService.addAddress(this.addressForm.getRawValue());
    this.addressForm.reset();
    this.toast.success('Adresse ajoutée.');
  }

  addCard(): void {
    if (this.cardForm.invalid) return;
    this.addressService.addMethod(this.cardForm.getRawValue());
    this.cardForm.reset();
    this.toast.success('Méthode de paiement ajoutée.');
  }

  deleteAccount(): void {
    const user = this.auth.getCurrentUser();
    if (!user) return;
    if (!confirm('Supprimer définitivement votre compte ? Cette action est irréversible.')) return;
    this.userService.remove(user.idUser).subscribe({
      next: () => {
        this.auth.logout();
        this.toast.success('Compte supprimé.');
        this.router.navigate(['/']);
      },
    });
  }
}
