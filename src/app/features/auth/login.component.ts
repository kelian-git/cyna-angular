import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, TranslateModule],
  template: `
    <div class="container-page flex justify-center">
      <form
        [formGroup]="form"
        (ngSubmit)="submit()"
        class="card flex w-full max-w-md flex-col gap-4 p-8"
      >
        <h1 class="text-2xl font-bold text-brand-900">{{ 'auth.loginTitle' | translate }}</h1>

        <div>
          <label class="mb-1 block text-sm font-medium" for="email">{{
            'auth.email' | translate
          }}</label>
          <input id="email" class="input-field" type="email" formControlName="email" />
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium" for="password">{{
            'auth.password' | translate
          }}</label>
          <input id="password" class="input-field" type="password" formControlName="password" />
        </div>
        <label class="flex items-center gap-2 text-sm">
          <input type="checkbox" formControlName="rememberMe" />
          {{ 'auth.rememberMe' | translate }}
        </label>

        @if (error()) {
          <p class="text-sm text-danger">{{ error() }}</p>
        }

        <button
          type="submit"
          class="btn-primary"
          [disabled]="form.invalid || loading()"
        >
          {{ 'auth.submitLogin' | translate }}
        </button>

        <div class="flex justify-between text-sm">
          <a routerLink="/inscription" class="text-brand-700 hover:underline">{{
            'auth.noAccount' | translate
          }}</a>
          <a routerLink="/mot-de-passe-oublie" class="text-brand-700 hover:underline">{{
            'auth.forgotPassword' | translate
          }}</a>
        </div>
      </form>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly toast = inject(ToastService);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (e: Error) => {
        this.loading.set(false);
        const msg =
          e.message === 'USER_NOT_FOUND'
            ? 'Compte inexistant ou non confirmé.'
            : e.message === 'TOO_MANY_ATTEMPTS'
              ? 'Trop de tentatives. Réessayez plus tard.'
              : 'Échec de la connexion.';
        this.error.set(msg);
        this.toast.error(msg);
      },
    });
  }
}
