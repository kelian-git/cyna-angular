import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from '../../../core/models';
import { AddressService } from '../../../core/services/address.service';
import { AuthService } from '../../../core/services/auth.service';
import { SubscriptionService } from '../../../core/services/subscription.service';
import { ToastService } from '../../../core/services/toast.service';
import { UserService } from '../../../core/services/user.service';
import { strongPasswordValidator } from '../../../core/utils/validators.util';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.scss'
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
