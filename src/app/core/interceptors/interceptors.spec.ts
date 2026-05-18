import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { errorInterceptor } from './error.interceptor';
import { jwtInterceptor } from './jwt.interceptor';

describe('interceptors', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  const auth = { logout: jest.fn() };
  const toast = { error: jest.fn() };
  const router = { url: '/', navigate: jest.fn() };

  beforeEach(() => {
    localStorage.clear();
    auth.logout.mockReset();
    toast.error.mockReset();
    router.navigate.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([jwtInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        { provide: ToastService, useValue: toast },
        { provide: Router, useValue: router },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('jwtInterceptor adds Authorization header when token present', () => {
    localStorage.setItem('token', 'abc');
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

  it('errorInterceptor logs out and redirects on 401', () => {
    http.get('/api/x').subscribe({ error: () => {} });
    httpMock.expectOne('/api/x').flush('no', { status: 401, statusText: 'Unauthorized' });
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
