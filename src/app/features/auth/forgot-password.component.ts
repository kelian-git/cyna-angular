import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-page flex justify-center">
      <div class="card flex w-full max-w-md flex-col gap-4 p-8">
        <h1 class="text-2xl font-bold text-brand-900">Mot de passe oublié</h1>
        @if (sent()) {
          <p class="rounded bg-success/10 p-3 text-sm text-success">
            Si un compte existe pour cette adresse, un lien de réinitialisation a été envoyé
            (simulé).
          </p>
        } @else {
          <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4">
            <div>
              <label class="mb-1 block text-sm font-medium" for="fpemail">Email</label>
              <input id="fpemail" class="input-field" type="email" formControlName="email" />
            </div>
            <button type="submit" class="btn-primary" [disabled]="form.invalid">
              Envoyer le lien
            </button>
          </form>
        }
        <a routerLink="/connexion" class="text-center text-sm text-brand-700 hover:underline"
          >Retour à la connexion</a
        >
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(ToastService);
  readonly sent = signal(false);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.sent.set(true);
    this.toast.success('Lien de réinitialisation envoyé (simulé).');
  }
}
