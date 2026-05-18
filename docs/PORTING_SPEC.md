# Cyna Angular — Spec de portage (à respecter par tous les contributeurs)

Projet : `C:/Users/super/cyna-angular`. Référence métier (React/Vite) : `C:/Users/super/cyna-frontend/src`.
Le code React sert UNIQUEMENT de référence de logique — tout est réécrit en Angular 18 standalone + TypeScript strict.

## Conventions Angular obligatoires

- **Standalone components** uniquement (`standalone: true`), pas de NgModule.
- Injection via `inject()` (pas de constructeurs).
- Control flow natif : `@if`, `@for (… ; track …)`, `@else`. Pas de `*ngIf`/`*ngFor`.
- Templates inline dans le `.ts` (pas de fichiers .html/.scss séparés sauf nécessité).
- TypeScript strict — typer tous les retours, pas de `any` implicite.
- Imports modèles : `import { Product, Order, … } from '../../core/models';` (adapter la profondeur `../`).
- i18n : `imports: [TranslateModule]` puis `{{ 'cle' | translate }}`. Clés dispo dans `public/i18n/fr.json` (nav.*, common.*, home.*, product.*, cart.*, auth.*, search.*, footer.*). Ajouter du texte FR en dur si pas de clé.
- Style : Tailwind. Couleurs marque `brand-50..950` (primaire `brand-800` #3D2B8E, accent `brand-500` #7C3AED), `danger`, `success`. Classes utilitaires globales dispo : `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.card`, `.input-field`, `.container-page`.
- Accessibilité : `aria-label` sur boutons icônes, `<label>` lié aux inputs, sémantique `<main>/<nav>/<header>`, `alt` sur images.
- Formulaires : **Reactive Forms** (`ReactiveFormsModule`, `FormBuilder`) + Validators.

## Services (core/services) — API

Données (retournent des `Observable`, faire `.subscribe()` dans le composant) :
- `ProductService` : getAll(), getById(id), getByCategory(catId, catName?), search(keyword), priceRange(min,max), inStock(), create(payload,catId), update(id,payload), updateStock(id,qty), remove(id). Renvoie des `Product` enrichis (available, imageUrl, pricing{monthly,yearly,perUser}, characteristics, priority).
- `CategoryService` : getAll(), getById(id), search(name), withProducts(), create(payload), update(id,payload), remove(id). `Category` enrichi (description, imageUrl).
- `OrderService` : getAll(), getById(id), getByUser(uid), getByStatus(s), dateRange(s,e), revenue(s,e), create(uid), checkout(uid), update(id,p), updateStatus(id,status), remove(id).
- `PaymentService`, `InvoiceService`, `SubscriptionService`, `UserService` : CRUD analogues (voir fichiers).
- `SubscriptionService.cancel(id)`.
- `UserService` : getByEmail(email), checkEmail(email), getAll(), getById(id), create(p), update(id,p), remove(id).

État (signals, appeler comme fonctions dans le template) :
- `AuthService` : `currentUser()` (signal User|null), `isAuthenticated()`, `isAdmin()`, `getCurrentUser()`, `login(email,password?)→Observable<User>`, `register({name,email,password})→Observable<User>`, `logout()`, `setUser(u)`.
- `CartService` : `items()` (LocalCartItem[]), `count()`, `total()`, `add(product,qty=1)`, `updateQuantity(idProduct,qty)`, `remove(idProduct)`, `clear()`, `getTotal()`, `syncToBackend()→Observable`.
- `CarouselService` : signals `slides()`, `fixedText()`; reset(), add(slide), update(id,patch), remove(id), move(id,dir:-1|1), setFixedText(t).
- `ChatbotService` + `botReply(text)` ; `ContactService` (messages signal, send(email,subject,msg), setHandled(id,b), remove(id)).
- `AddressService` : signals `addresses()`, `methods()`; addAddress, updateAddress, removeAddress, addMethod({label,cardNumber,holder,expiry}), removeMethod, setDefaultMethod.
- `SearchService` : `matchScore(query,text)`, `searchProducts(products, filters)` où filters = {keyword?,priceMin?,priceMax?,categoryIds?,onlyAvailable?}.
- `ToastService` : `success(msg)`, `error(msg)`, `info(msg)`.

Utils : `formatPrice/formatDate/formatDateTime/maskCardNumber` depuis `core/utils/formatters.util`. `PASSWORD_REGEX, EMAIL_REGEX, CARD_NUMBER_REGEX, CVV_REGEX, EXPIRY_REGEX, isStrongPassword, isEmail, strongPasswordValidator(), patternValidator(re,key)` depuis `core/utils/validators.util`. `sortByPriorityAndStock(products)` depuis `core/utils/product-enrichment.util`.

## Composants partagés réutilisables (importer le composant)

`app-button` (variant=primary|secondary|danger|ghost, [disabled],[loading],[block],(clicked)), `app-badge` (tone=success|danger|info|warning|neutral), `app-card`, `app-loader` ([label]), `app-skeleton` ([width],[height]), `app-empty-state` ([icon],[title],[description]), `app-pagination` ([page],[total],[perPage],(pageChange)), `app-modal` ([open],[title],(closed), `<ng-content>` + `[modalFooter]`), `app-product-card` ([product],(add)), `app-category-card` ([category]), `app-carousel` ([slides],[interval]), `app-input`/`app-select` (ControlValueAccessor, utilisables avec formControlName — sinon inputs natifs `.input-field`).

Chemins : `src/app/shared/ui/<name>/<name>.component.ts`, `src/app/shared/components/<name>/<name>.component.ts`.

## Backend (proxy /api → :8080)

Pseudo-auth (pas de JWT) : login = `GET /api/users/email/{email}` (pas de vérif mdp possible). Modèle User expose `password` (hash) — NE JAMAIS l'afficher. Comptes : admin@cyna.com (ADMIN), alice@cyna.com / bob@cyna.com (USER). Statuts Order: PENDING|DELIVERED|COMPLETED|CANCELLED. Checkout: `POST /api/orders/checkout?userId=`.

## Routes (chemins exacts)

`''` Home · `categories` Catalogue · `categories/:id` Category · `produits/:id` Product · `recherche` Search (queryParam `q`) · `panier` Cart · `checkout` Checkout · `confirmation` Confirmation · `connexion` Login · `inscription` Register · `mot-de-passe-oublie` ForgotPassword · `compte` Account · `compte/parametres` AccountSettings · `compte/commandes` Orders · `compte/commandes/:id` OrderDetail · `contact` Contact · `cgu` CGU · `mentions-legales` MentionsLegales · `a-propos` APropos · `**` NotFound · `admin` AdminDashboard · `admin/produits` AdminProducts · `admin/produits/nouveau` & `admin/produits/:id/modifier` AdminProductForm · `admin/categories` AdminCategories · `admin/commandes` AdminOrders · `admin/carousel` AdminCarousel · `admin/messages` AdminMessages.

Chaque page = un composant standalone exporté, fichier `src/app/features/<area>/<name>.component.ts`, classe `XxxComponent`, selector `app-xxx`. Les routes seront câblées séparément (lazy `loadComponent`) — exporter proprement la classe.
