import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { LanguageSwitcherComponent } from '../language-switcher/language-switcher.component';
import { LogoComponent } from '../logo/logo.component';
import { MenuBurgerComponent } from '../menu-burger/menu-burger.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    FormsModule,
    TranslateModule,
    LogoComponent,
    LanguageSwitcherComponent,
    MenuBurgerComponent,
  ],
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
  readonly cart = inject(CartService);
  private readonly router = inject(Router);

  query = '';
  readonly menuOpen = signal(false);

  submitSearch(): void {
    const q = this.query.trim();
    this.router.navigate(['/recherche'], { queryParams: q ? { q } : {} });
  }

  onLogout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
