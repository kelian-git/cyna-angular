import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { strongPasswordValidator } from '../../core/utils/validators.util';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule],
  template: `
    <div class="container-page flex justify-center">
      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        class="card flex w-full max-w-md flex-col gap-4 p-8"
      >
        <h1 class="text-2xl font-bold text-brand-900">{{ 'auth.registerTitle' | translate }}</h1>

        <div>
          <label class="mb-1 block text-sm font-medium" for="name">{{
            'auth.name' | translate
          }}</label>
          <input id="name" class="input-field" formControlName="name" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium" for="remail">{{
            'auth.email' | translate
          }}</label>
          <input id="remail" class="input-field" type="email" formControlName="email" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium" for="rpwd">{{
            'auth.password' | translate
          }}</label>
          <input id="rpwd" class="input-field" type="password" formControlName="password" />
          <ul class="mt-1 text-xs text-gray-500">
            <li>Au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial.</li>
          </ul>
          @if (form.controls.password.touched && form.controls.password.errors?.['weakPassword']) {
            <p class="text-xs text-danger">Mot de passe trop faible.</p>
          }
        </div>

        <button type="submit" class="btn-primary" [disabled]="form.invalid || loading()">
          {{ 'auth.submitRegister' | translate }}
        </button>

        <a routerLink="/connexion" class="text-center text-sm text-brand-700 hover:underline">{{
          'auth.hasAccount' | translate
        }}</a>
      </form>
    </div>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, strongPasswordValidator()]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.toast.success('Compte créé — un email de confirmation a été envoyé (simulé).');
        this.router.navigate(['/']);
      },
      error: (e: Error) => {
        this.loading.set(false);
        this.toast.error(
          e.message === 'EMAIL_TAKEN' ? 'Cet email est déjà utilisé.' : 'Échec de l’inscription.',
        );
      },
    });
  }
}
