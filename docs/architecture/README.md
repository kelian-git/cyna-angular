# Architecture — Cyna Angular

```
Navigateur (Angular 18 SPA)
        │  /api/*  (proxy.conf.json en dev, reverse-proxy nginx en prod)
        ▼
Spring Boot 3 (:8080)  ──►  MySQL (cyna_db)
```

## Couches front

- **core/** — sans état d'affichage : `models/` (interfaces TS), `services/`
  (HttpClient + signals), `guards/` (`authGuard`, `adminGuard`),
  `interceptors/` (`jwt`, `error`), `utils/` (formatters, validators,
  levenshtein, enrichissement produit), `i18n/`.
- **shared/** — présentation réutilisable : `ui/` (atomes), `components/`
  (header, footer, menu, chatbot, toast, language-switcher), `layout/`
  (`MainLayout`, `AdminLayout`).
- **features/** — pages routées (lazy `loadComponent`), une feature par dossier.

## Flux d'état

- `AuthService` : signal `currentUser`, persistance `localStorage` (`cyna-auth`).
- `CartService` : signal `items`, persistance `localStorage` (`cyna-cart`),
  synchronisation back au checkout (`syncToBackend`).
- Fonctionnalités sans endpoint (carrousel, chatbot, adresses, messages) :
  services à signaux + `localStorage`.

## Routing

Routes publiques sous `MainLayoutComponent`, back-office sous
`AdminLayoutComponent` protégé par `adminGuard`. `authGuard` sur `/compte*`.

> Schémas détaillés (draw.io / PNG) à déposer ici.
