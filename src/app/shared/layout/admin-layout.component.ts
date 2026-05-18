import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LogoComponent } from '../components/logo/logo.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LogoComponent],
  template: `
    <div class="flex min-h-screen flex-col bg-gray-50 md:flex-row">
      <aside class="w-full shrink-0 border-r border-gray-200 bg-white md:w-60">
        <div class="border-b p-4"><app-logo /></div>
        <nav class="flex flex-col gap-1 p-3" aria-label="Navigation administration">
          <a routerLink="/admin" [routerLinkActiveOptions]="{ exact: true }" routerLinkActive="bg-brand-100 text-brand-800" class="admin-link">📊 Tableau de bord</a>
          <a routerLink="/admin/produits" routerLinkActive="bg-brand-100 text-brand-800" class="admin-link">📦 Produits</a>
          <a routerLink="/admin/categories" routerLinkActive="bg-brand-100 text-brand-800" class="admin-link">🏷️ Catégories</a>
          <a routerLink="/admin/commandes" routerLinkActive="bg-brand-100 text-brand-800" class="admin-link">📋 Commandes</a>
          <a routerLink="/admin/carousel" routerLinkActive="bg-brand-100 text-brand-800" class="admin-link">🖼️ Carrousel</a>
          <a routerLink="/admin/messages" routerLinkActive="bg-brand-100 text-brand-800" class="admin-link">✉️ Messages</a>
          <hr class="my-2" />
          <a routerLink="/" class="admin-link">← Retour au site</a>
          <button type="button" class="admin-link text-left text-danger" (click)="logout()">Se déconnecter</button>
        </nav>
      </aside>
      <main class="flex-1 p-4 sm:p-6 lg:p-8">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .admin-link {
        @apply rounded px-3 py-2 text-sm font-medium text-gray-700 hover:bg-brand-50;
      }
    `,
  ],
})
export class AdminLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
