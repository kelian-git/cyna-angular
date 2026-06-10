# Cyna Frontend — Angular

Plateforme e-commerce B2B d'abonnements SaaS de cybersécurité (SOC, EDR, XDR).
SPA Angular 18 découplée, consommant l'API Spring Boot via un proxy `/api`.

## Stack

| Couche | Techno |
|--------|--------|
| Framework | Angular 18 (standalone components) |
| Langage | TypeScript strict |
| Style | Tailwind CSS + SCSS |
| État | Services Angular + Signals / RxJS |
| HTTP | HttpClient + intercepteurs (JWT-ready, gestion d'erreurs) |
| Routing | Angular Router + Guards (`authGuard`, `adminGuard`) |
| Formulaires | Reactive Forms + Validators |
| i18n | @ngx-translate/core (FR par défaut, EN, AR/RTL) |
| Graphiques | Chart.js |
| Tests | Jest + jest-preset-angular (coverage ≥ 70 %) |
| Qualité | ESLint + Prettier |
| CI/CD | GitHub Actions |

## Prérequis

- Node.js ≥ 20
- npm ≥ 10
- Backend Spring Boot démarré sur `:8080`
- MySQL démarré avec la base `cyna_db`

## Installation

```bash
git clone <repo> cyna-angular
cd cyna-angular
npm install
```

## Lancement (développement)

```bash
npm start        # http://localhost:4200 — proxy /api -> http://localhost:8080
```

Le fichier `proxy.conf.json` redirige tous les appels `/api` vers le backend `:8080`
(évite les soucis CORS, notamment sur `cart-items`).

## Scripts

```bash
npm start            # serveur de dev + proxy
npm run build        # build de production (dist/cyna-angular)
npm test             # tests unitaires Jest
npm run test:ci      # tests CI (jest --ci --runInBand)
npm run test:coverage# rapport de couverture HTML (coverage/)
npm run lint         # ESLint (TS + templates)
npm run format       # Prettier --write
```

## Authentification (V1)

Le backend n'expose pas encore `/api/auth/login` ni de JWT. Le front utilise une
**pseudo-authentification** : récupération de l'utilisateur via
`GET /api/users/email/{email}` puis stockage en `localStorage`. L'intercepteur
`jwt.interceptor` est déjà prêt pour un vrai token (access 15 min + refresh 7 j)
quand le back l'exposera.


## Architecture

```
src/app/
├── core/        # models, services, guards, interceptors, utils, i18n
├── shared/      # ui/ (button, badge, card, modal, carousel, product-card…)
│                # components/ (header, footer, menu-burger, chatbot…)
│                # layout/ (main-layout, admin-layout)
└── features/    # home, catalogue, product, search, cart, checkout,
                 # auth, account, contact, legal, admin
```

- Panier persistant en `localStorage` si déconnecté, synchronisé au back au checkout.
- Carrousel, chatbot, adresses, méthodes de paiement, messages : mockés en
  `localStorage` (pas d'endpoint back correspondant).
- Produits/catégories enrichis côté front (image, dispo, pricing mensuel/annuel/par
  utilisateur, caractéristiques).

## Sécurité (résumé DAT §4)

- JWT : intercepteur prêt ; bcrypt salt 12 côté back.
- Rate limiting login simulé côté front (blocage après 10 tentatives).
- OWASP : échappement Angular (pas d'`innerHTML` non sanitisé), CORS via proxy,
  injection SQL impossible côté front.
- RGPD : suppression de compte (`DELETE /api/users/{id}`), politique accessible
  depuis le footer, aucune donnée sensible en clair (carte = 4 derniers chiffres).


## Déploiement

`npm run build` génère `dist/cyna-angular` à servir derrière nginx (avec un reverse
proxy `/api` vers le backend et les en-têtes de sécurité recommandés).
