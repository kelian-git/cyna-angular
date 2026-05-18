import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let component: HeaderComponent;
  const auth = {
    isAuthenticated: jest.fn().mockReturnValue(false),
    isAdmin: jest.fn().mockReturnValue(false),
    getCurrentUser: jest.fn().mockReturnValue(null),
    logout: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent, RouterTestingModule, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        CartService,
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

  it('renders the logo and shows login link when logged out', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-logo')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('nav.login');
  });

  it('reflects the cart badge count', () => {
    const cart = TestBed.inject(CartService);
    cart.add({ idProduct: 1, name: 'P', price: 10, des: '', stock: 1 } as never, 2);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('2');
  });

  it('navigates to /recherche on search submit', () => {
    const router = TestBed.inject(Router);
    const spy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.query = 'edr';
    component.submitSearch();
    expect(spy).toHaveBeenCalledWith(['/recherche'], { queryParams: { q: 'edr' } });
  });

  it('logs out and redirects home', () => {
    const router = TestBed.inject(Router);
    const spy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
    component.onLogout();
    expect(auth.logout).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith(['/']);
  });
});
