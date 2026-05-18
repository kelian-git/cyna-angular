# Couverture des tests

Rapport généré par Jest :

```bash
npm run test:coverage
```

Sortie HTML : `coverage/lcov-report/index.html` (à la racine du projet, ignorée
par git ; uploadée comme artefact par la CI GitHub Actions).

## Résultats actuels (couche logique testée)

| Métrique | Couverture | Seuil CI |
|----------|------------|----------|
| Statements | ~92 % | 70 % |
| Lines | ~92 % | 70 % |
| Functions | ~84 % | 70 % |
| Branches | ~75 % | 60 % |

Périmètre mesuré : `core/services`, `core/utils`, `core/guards`,
`core/interceptors` + composants UI clés (`button`, `product-card`, `header`).
Les pages `features/` sont déclaratives et destinées aux tests e2e (Cypress).

## Suites (77 tests, 16 suites)

services (auth, cart, search, product, http CRUD, toast, carousel, chatbot,
contact, address), utils (levenshtein, formatters, validators, enrichment,
storage), guards (auth, admin), interceptors (jwt, error), composants
(button, product-card, header).
