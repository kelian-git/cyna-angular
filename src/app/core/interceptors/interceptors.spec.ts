import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { errorInterceptor } from './error.interceptor';
import { jwtInterceptor } from './jwt.interceptor';

describe('interceptors', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  const auth = {
    logout: jest.fn(),
    getAccessToken: jest.fn<string | null, []>(),
    getRefreshToken: jest.fn<string | null, []>(),
    refreshToken: jest.fn(),
  };
  const toast = { error: jest.fn() };
  const router = { url: '/', navigate: jest.fn() };

  beforeEach(() => {
    localStorage.clear();
    auth.logout.mockReset();
    auth.getAccessToken.mockReset().mockReturnValue(null);
    auth.getRefreshToken.mockReset().mockReturnValue(null);
    auth.refreshToken.mockReset();
    toast.error.mockReset();
    router.navigate.mockReset();
    TestBed.configureTestingModule({
      providers: [
        // Meme ordre qu'en prod : errorInterceptor externe, jwtInterceptor interne
        // (le jwtInterceptor traite le 401 / refresh avant la deconnexion).
        provideHttpClient(withInterceptors([errorInterceptor, jwtInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        { provide: ToastService, useValue: toast },
        { provide: Router, useValue: router },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('jwtInterceptor adds Authorization header from getAccessToken()', () => {
    auth.getAccessToken.mockReturnValue('abc');
    http.get('/api/x').subscribe();
    const req = httpMock.expectOne('/api/x');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush({});
  });

  it('jwtInterceptor does not add header without token', () => {
    http.get('/api/x').subscribe();
    const req = httpMock.expectOne('/api/x');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('jwtInterceptor refreshes the token and retries on 401', () => {
    auth.getAccessToken.mockReturnValue('expired');
    auth.getRefreshToken.mockReturnValue('refresh-token');
    auth.refreshToken.mockReturnValue(of('fresh-access'));

    let ok = false;
    http.get('/api/protected').subscribe(() => (ok = true));

    // 1re requete -> 401
    httpMock
      .expectOne('/api/protected')
      .flush('no', { status: 401, statusText: 'Unauthorized' });

    // le jwtInterceptor a rejoue la requete avec le nouveau token
    const retried = httpMock.expectOne('/api/protected');
    expect(retried.request.headers.get('Authorization')).toBe('Bearer fresh-access');
    retried.flush({ data: 1 });

    expect(auth.refreshToken).toHaveBeenCalled();
    expect(ok).toBe(true);
    expect(auth.logout).not.toHaveBeenCalled();
  });

  it('errorInterceptor logs out and redirects on 401 without refresh token', () => {
    http.get('/api/x').subscribe({ error: () => {} });
    httpMock.expectOne('/api/x').flush('no', { status: 401, statusText: 'Unauthorized' });
    expect(auth.refreshToken).not.toHaveBeenCalled();
    expect(auth.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalled();
  });

  it('errorInterceptor shows a toast on 500', () => {
    http.get('/api/x').subscribe({ error: () => {} });
    httpMock.expectOne('/api/x').flush('err', { status: 500, statusText: 'Server Error' });
    expect(toast.error).toHaveBeenCalled();
  });

  it('errorInterceptor stays silent on 404', () => {
    http.get('/api/x').subscribe({ error: () => {} });
    httpMock.expectOne('/api/x').flush('nf', { status: 404, statusText: 'Not Found' });
    expect(toast.error).not.toHaveBeenCalled();
  });
});
