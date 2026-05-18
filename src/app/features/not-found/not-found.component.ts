import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container-page flex flex-col items-center gap-4 py-24 text-center">
      <p class="text-7xl font-extrabold text-brand-800">404</p>
      <h1 class="text-2xl font-bold text-gray-800">Page introuvable</h1>
      <p class="text-gray-500">La page demandée n'existe pas ou a été déplacée.</p>
      <a routerLink="/" class="btn-primary">Retour à l'accueil</a>
    </div>
  `,
})
export class NotFoundComponent {}
