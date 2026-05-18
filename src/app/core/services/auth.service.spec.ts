import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), AuthService],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('starts logged out', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.isAdmin()).toBe(false);
    expect(service.getCurrentUser()).toBeNull();
  });

  it('logs in and stores the user', () => {
    const user = { idUser: 2, email: 'alice@cyna.com', name: 'Alice' };
    service.login('alice@cyna.com').subscribe((u) => expect(u).toEqual(user));
    httpMock.expectOne('/api/users/email/alice%40cyna.com').flush(user);
    expect(service.isLoggedIn()).toBe(true);
    expect(service.getCurrentUser()?.email).toBe('alice@cyna.com');
    expect(localStorage.getItem('cyna-auth')).toContain('alice');
  });

  it('isAdmin true only for ADMIN role', () => {
    const admin = {
      idUser: 1,
      email: 'admin@cyna.com',
      name: 'Admin',
      adminRole: { idAdminRole: 1, label: 'ADMIN' },
    };
    service.login('admin@cyna.com').subscribe();
    httpMock.expectOne('/api/users/email/admin%40cyna.com').flush(admin);
    expect(service.isAdmin()).toBe(true);
  });

  it('logout clears the session', () => {
    service.setUser({ idUser: 9, email: 'x@y.z', name: 'X' });
    expect(service.isLoggedIn()).toBe(true);
    service.logout();
    expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('cyna-auth')).toBeNull();
  });

  it('registers a new user when email is free', () => {
    const created = { idUser: 5, email: 'new@cyna.com', name: 'New' };
    service.register({ name: 'New', email: 'new@cyna.com', password: 'Abcdef1!' }).subscribe();
    httpMock.expectOne((r) => r.url === '/api/users/check-email').flush(false);
    httpMock.expectOne('/api/users').flush(created);
    expect(service.getCurrentUser()?.idUser).toBe(5);
  });

  it('register fails when email already taken', () => {
    let err: Error | undefined;
    service
      .register({ name: 'N', email: 'taken@cyna.com', password: 'Abcdef1!' })
      .subscribe({ error: (e) => (err = e) });
    httpMock.expectOne((r) => r.url === '/api/users/check-email').flush(true);
    expect(err?.message).toBe('EMAIL_TAKEN');
  });
});
