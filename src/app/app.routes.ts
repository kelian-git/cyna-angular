import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin.guard';
import { authGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from './shared/layout/admin-layout.component';
import { MainLayoutComponent } from './shared/layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/home/home.component').then((m) => m.HomeComponent),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/catalogue/catalogue.component').then((m) => m.CatalogueComponent),
      },
      {
        path: 'categories/:id',
        loadComponent: () =>
          import('./features/catalogue/category.component').then((m) => m.CategoryComponent),
      },
      {
        path: 'produits/:id',
        loadComponent: () =>
          import('./features/product/product.component').then((m) => m.ProductComponent),
      },
      {
        path: 'recherche',
        loadComponent: () =>
          import('./features/search/search.component').then((m) => m.SearchComponent),
      },
      {
        path: 'panier',
        loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent),
      },
      {
        path: 'confirmation',
        loadComponent: () =>
          import('./features/confirmation/confirmation.component').then(
            (m) => m.ConfirmationComponent,
          ),
      },
      {
        path: 'connexion',
        loadComponent: () =>
          import('./features/auth/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'inscription',
        loadComponent: () =>
          import('./features/auth/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'mot-de-passe-oublie',
        loadComponent: () =>
          import('./features/auth/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
      },
      {
        path: 'compte',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/account/account.component').then((m) => m.AccountComponent),
      },
      {
        path: 'compte/parametres',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/account/account-settings.component').then(
            (m) => m.AccountSettingsComponent,
          ),
      },
      {
        path: 'compte/commandes',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/account/orders.component').then((m) => m.OrdersComponent),
      },
      {
        path: 'compte/commandes/:id',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/account/order-detail.component').then((m) => m.OrderDetailComponent),
      },
      {
        path: 'contact',
        loadComponent: () =>
          import('./features/contact/contact.component').then((m) => m.ContactComponent),
      },
      {
        path: 'cgu',
        loadComponent: () => import('./features/legal/cgu.component').then((m) => m.CguComponent),
      },
      {
        path: 'mentions-legales',
        loadComponent: () =>
          import('./features/legal/mentions-legales.component').then(
            (m) => m.MentionsLegalesComponent,
          ),
      },
      {
        path: 'a-propos',
        loadComponent: () =>
          import('./features/legal/a-propos.component').then((m) => m.AProposComponent),
      },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'produits',
        loadComponent: () =>
          import('./features/admin/admin-products.component').then((m) => m.AdminProductsComponent),
      },
      {
        path: 'produits/nouveau',
        loadComponent: () =>
          import('./features/admin/admin-product-form.component').then(
            (m) => m.AdminProductFormComponent,
          ),
      },
      {
        path: 'produits/:id/modifier',
        loadComponent: () =>
          import('./features/admin/admin-product-form.component').then(
            (m) => m.AdminProductFormComponent,
          ),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./features/admin/admin-categories.component').then(
            (m) => m.AdminCategoriesComponent,
          ),
      },
      {
        path: 'commandes',
        loadComponent: () =>
          import('./features/admin/admin-orders.component').then((m) => m.AdminOrdersComponent),
      },
      {
        path: 'carousel',
        loadComponent: () =>
          import('./features/admin/admin-carousel.component').then(
            (m) => m.AdminCarouselComponent,
          ),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./features/admin/admin-messages.component').then(
            (m) => m.AdminMessagesComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent),
      },
    ],
  },
];
