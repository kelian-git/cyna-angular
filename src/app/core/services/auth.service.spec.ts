import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  // Reponse standard du back : { user, accessToken, refreshToken }
  const authResponse = (user: object) => ({
    user,
    accessToken: 'access-123',
    refreshToken: 'refresh-456',
  });

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

  it('logs in and stores the user + tokens', () => {
    const user = { idUser: 2, email: 'alice@cyna.com', name: 'Alice' };
    service.login('alice@cyna.com', 'Abcdef1!').subscribe((u) => expect(u).toEqual(user));

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'alice@cyna.com', password: 'Abcdef1!' });
    req.flush(authResponse(user));

    expect(service.isLoggedIn()).toBe(true);
    expect(service.getCurrentUser()?.email).toBe('alice@cyna.com');
    expect(localStorage.getItem('cyna-auth')).toContain('alice');
    expect(service.getAccessToken()).toBe('access-123');
    expect(service.getRefreshToken()).toBe('refresh-456');
  });

  it('maps 401 to INVALID_CREDENTIALS', () => {
    let err: Error | undefined;
    service.login('alice@cyna.com', 'wrong').subscribe({ error: (e) => (err = e) });
    httpMock
      .expectOne('/api/auth/login')
      .flush('no', { status: 401, statusText: 'Unauthorized' });
    expect(err?.message).toBe('INVALID_CREDENTIALS');
    expect(service.isLoggedIn()).toBe(false);
  });

  it('maps 429 to TOO_MANY_ATTEMPTS', () => {
    let err: Error | undefined;
    service.login('alice@cyna.com', 'pwd').subscribe({ error: (e) => (err = e) });
    httpMock
      .expectOne('/api/auth/login')
      .flush('too many', { status: 429, statusText: 'Too Many Requests' });
    expect(err?.message).toBe('TOO_MANY_ATTEMPTS');
  });

  it('isAdmin true only for ADMIN role', () => {
    const admin = {
      idUser: 1,
      email: 'admin@cyna.com',
      name: 'Admin',
      adminRole: { idAdminRole: 1, label: 'ADMIN' },
    };
    service.login('admin@cyna.com', 'Abcdef1!').subscribe();
    httpMock.expectOne('/api/auth/login').flush(authResponse(admin));
    expect(service.isAdmin()).toBe(true);
  });

  it('refreshToken exchanges the refresh token for a new access token', () => {
    localStorage.setItem('refreshToken', 'refresh-456');
    let newToken: string | undefined;
    service.refreshToken().subscribe((t) => (newToken = t));

    const req = httpMock.expectOne('/api/auth/refresh');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ refreshToken: 'refresh-456' });
    req.flush({
      user: { idUser: 2, email: 'alice@cyna.com', name: 'Alice' },
      accessToken: 'access-new',
      refreshToken: 'refresh-new',
    });

    expect(newToken).toBe('access-new');
    expect(service.getAccessToken()).toBe('access-new');
    expect(service.getRefreshToken()).toBe('refresh-new');
  });

  it('refreshToken errors when no refresh token is stored', () => {
    let err: Error | undefined;
    service.refreshToken().subscribe({ error: (e) => (err = e) });
    expect(err?.message).toBe('NO_REFRESH_TOKEN');
    httpMock.expectNone('/api/auth/refresh');
  });

  it('logout clears the session and both tokens', () => {
    service.setUser({ idUser: 9, email: 'x@y.z', name: 'X' });
    localStorage.setItem('accessToken', 'access-123');
    localStorage.setItem('refreshToken', 'refresh-456');
    expect(service.isLoggedIn()).toBe(true);

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('cyna-auth')).toBeNull();
    expect(service.getAccessToken()).toBeNull();
    expect(service.getRefreshToken()).toBeNull();
  });

  it('registers a new user and stores tokens', () => {
    const created = { idUser: 5, email: 'new@cyna.com', name: 'New' };
    service
      .register({ name: 'New', email: 'new@cyna.com', password: 'Abcdef1!' })
      .subscribe();

    const req = httpMock.expectOne('/api/auth/register');
    expect(req.request.method).toBe('POST');
    req.flush(authResponse(created));

    expect(service.getCurrentUser()?.idUser).toBe(5);
    expect(service.getAccessToken()).toBe('access-123');
  });

  it('register fails when email already taken (409)', () => {
    let err: Error | undefined;
    service
      .register({ name: 'N', email: 'taken@cyna.com', password: 'Abcdef1!' })
      .subscribe({ error: (e) => (err = e) });
    httpMock
      .expectOne('/api/auth/register')
      .flush('conflict', { status: 409, statusText: 'Conflict' });
    expect(err?.message).toBe('EMAIL_TAKEN');
  });
});
