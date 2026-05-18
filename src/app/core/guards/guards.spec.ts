import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../services/auth.service';
import { adminGuard } from './admin.guard';
import { authGuard } from './auth.guard';

describe('route guards', () => {
  let auth: { isLoggedIn: jest.Mock; isAdmin: jest.Mock };
  let router: Router;

  beforeEach(() => {
    auth = { isLoggedIn: jest.fn(), isAdmin: jest.fn() };
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: auth }],
    });
    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('authGuard allows when logged in', () => {
    auth.isLoggedIn.mockReturnValue(true);
    const res = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/compte' } as never),
    );
    expect(res).toBe(true);
  });

  it('authGuard redirects to /connexion when logged out', () => {
    auth.isLoggedIn.mockReturnValue(false);
    const res = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: '/compte' } as never),
    );
    expect(res).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/connexion'], {
      queryParams: { returnUrl: '/compte' },
    });
  });

  it('adminGuard allows admins and blocks others', () => {
    auth.isAdmin.mockReturnValue(true);
    expect(
      TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never)),
    ).toBe(true);
    auth.isAdmin.mockReturnValue(false);
    expect(
      TestBed.runInInjectionContext(() => adminGuard({} as never, {} as never)),
    ).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
