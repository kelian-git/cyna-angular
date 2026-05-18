import { Component } from '@angular/core';

@Component({
  selector: 'app-mentions-legales',
  standalone: true,
  template: `
    <div class="container-page max-w-3xl">
      <h1 class="mb-6 text-2xl font-bold text-brand-900">Mentions légales</h1>

      <h2 class="mt-6 font-bold text-brand-800">Éditeur</h2>
      <p class="text-gray-600">
        Cyna SAS (société fictive à des fins pédagogiques) — Capital social : 100 000 € —
        Siège : 12 rue de la Cybersécurité, 75000 Paris — RCS Paris 000 000 000.
      </p>

      <h2 class="mt-6 font-bold text-brand-800">Hébergeur</h2>
      <p class="text-gray-600">
        Hébergement cloud souverain (UE). Les serveurs back-end et la base MySQL sont opérés
        dans des centres de données certifiés ISO 27001.
      </p>

      <h2 class="mt-6 font-bold text-brand-800">Propriété intellectuelle</h2>
      <p class="text-gray-600">
        L'ensemble des contenus, marques et logos présents sur la plateforme Cyna sont protégés
        et ne peuvent être reproduits sans autorisation.
      </p>

      <h2 class="mt-6 font-bold text-brand-800">Données personnelles & RGPD</h2>
      <p class="text-gray-600">
        Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et
        d'effacement de vos données. Le droit à l'effacement est exerçable directement depuis
        « Mon compte &gt; Paramètres &gt; Supprimer mon compte ». Contact DPO :
        dpo&#64;cyna.example.
      </p>

      <h2 class="mt-6 font-bold text-brand-800">Cookies</h2>
      <p class="text-gray-600">
        Seuls des cookies/stockage techniques strictement nécessaires (session, préférence de
        langue, panier) sont utilisés.
      </p>
    </div>
  `,
})
export class MentionsLegalesComponent {}
