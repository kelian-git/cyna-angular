# API — Backend Cyna (Spring Boot)

- Base : `http://localhost:8080`, préfixe `/api`, pas de versioning.
- Le front passe par le proxy Angular (`/api` → `:8080`).
- Pas de JWT en V1 → pseudo-login `GET /api/users/email/{email}`.

## Ressources principales

| Ressource | Endpoints clés |
|-----------|----------------|
| Users | `GET /api/users`, `/users/{id}`, `/users/email/{email}`, `/users/check-email`, POST/PUT/DELETE |
| Products | `GET /api/products`, `/products/{id}`, `/products/category/{id}`, `/products/search`, `/products/price-range`, `/products/in-stock`, POST/PUT, `PATCH /{id}/stock`, DELETE |
| Categories | `GET /api/categories`, `/categories/{id}`, `/categories/with-products`, POST/PUT/DELETE |
| Carts / Cart Items | `/api/carts/user/{userId}`, `POST /api/carts`, `/api/cart-items` CRUD |
| Orders | `GET /api/orders`, `/orders/user/{userId}`, `POST /api/orders/checkout?userId=`, `PATCH /{id}/status` |
| Payments / Invoices / Subscriptions | CRUD + `/revenue`, `/total`, `PATCH /subscriptions/{id}/cancel` |
| Admin Roles | `GET /api/admin-roles` … |

Analyse exhaustive : voir `../../API_ANALYSIS.md` (racine du dépôt parent) et
`docs/PORTING_SPEC.md`.

## Modèles renvoyés (formes réelles)

`User` expose le hash `password` (⚠️ jamais affiché côté front). `Product` est
minimal (`name`, `price`, `des`, `stock`) → enrichi côté front. `Category` =
`{ idCategory, name, products? }`. Détails dans `core/models/`.
