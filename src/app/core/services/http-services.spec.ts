import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CartApiService } from './cart-api.service';
import { CartItemService } from './cart-item.service';
import { CategoryService } from './category.service';
import { InvoiceService } from './invoice.service';
import { OrderService } from './order.service';
import { PaymentService } from './payment.service';
import { SubscriptionService } from './subscription.service';
import { UserService } from './user.service';

describe('HTTP CRUD services', () => {
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => httpMock.verify());

  it('CategoryService CRUD + enrichment', () => {
    const s = TestBed.inject(CategoryService);
    s.getAll().subscribe((c) => expect(c[0].imageUrl).toContain('http'));
    httpMock.expectOne('/api/categories').flush([{ idCategory: 1, name: 'SOC' }]);
    s.getById(1).subscribe();
    httpMock.expectOne('/api/categories/1').flush({ idCategory: 1, name: 'SOC' });
    s.search('soc').subscribe();
    httpMock.expectOne((r) => r.url === '/api/categories/search').flush([]);
    s.withProducts().subscribe();
    httpMock.expectOne('/api/categories/with-products').flush([]);
    s.create({ name: 'X' }).subscribe();
    httpMock.expectOne((r) => r.method === 'POST').flush({ idCategory: 2, name: 'X' });
    s.update(1, { name: 'Y' }).subscribe();
    httpMock.expectOne((r) => r.method === 'PUT').flush({ idCategory: 1, name: 'Y' });
    s.remove(1).subscribe();
    httpMock.expectOne((r) => r.method === 'DELETE').flush({});
  });

  it('OrderService endpoints', () => {
    const s = TestBed.inject(OrderService);
    s.getAll().subscribe();
    httpMock.expectOne('/api/orders').flush([]);
    s.getById(1).subscribe();
    httpMock.expectOne('/api/orders/1').flush({});
    s.getByUser(2).subscribe();
    httpMock.expectOne('/api/orders/user/2').flush([]);
    s.getByStatus('PENDING').subscribe();
    httpMock.expectOne('/api/orders/status/PENDING').flush([]);
    s.dateRange('a', 'b').subscribe();
    httpMock.expectOne((r) => r.url === '/api/orders/date-range').flush([]);
    s.revenue('a', 'b').subscribe();
    httpMock.expectOne((r) => r.url === '/api/orders/revenue').flush(0);
    s.create(1).subscribe();
    httpMock.expectOne((r) => r.url === '/api/orders' && r.method === 'POST').flush({});
    s.checkout(1).subscribe();
    httpMock.expectOne((r) => r.url === '/api/orders/checkout').flush({});
    s.update(1, {}).subscribe();
    httpMock.expectOne((r) => r.method === 'PUT').flush({});
    s.updateStatus(1, 'COMPLETED').subscribe();
    httpMock.expectOne((r) => r.method === 'PATCH').flush({});
    s.remove(1).subscribe();
    httpMock.expectOne((r) => r.method === 'DELETE').flush({});
  });

  it('UserService endpoints incl. checkEmail fallback', () => {
    const s = TestBed.inject(UserService);
    s.getAll().subscribe();
    httpMock.expectOne('/api/users').flush([]);
    s.getById(1).subscribe();
    httpMock.expectOne('/api/users/1').flush({});
    s.getByEmail('a@b.c').subscribe();
    httpMock.expectOne('/api/users/email/a%40b.c').flush({});
    s.search('jo').subscribe();
    httpMock.expectOne((r) => r.url === '/api/users/search').flush([]);
    s.checkEmail('a@b.c').subscribe((v) => expect(v).toBe(false));
    httpMock.expectOne((r) => r.url === '/api/users/check-email').error(new ProgressEvent('e'));
    s.create({ name: 'n', email: 'e', password: 'p' }).subscribe();
    httpMock.expectOne((r) => r.method === 'POST').flush({});
    s.update(1, {}).subscribe();
    httpMock.expectOne((r) => r.method === 'PUT').flush({});
    s.remove(1).subscribe();
    httpMock.expectOne((r) => r.method === 'DELETE').flush({});
  });

  it('PaymentService / InvoiceService / SubscriptionService', () => {
    const pay = TestBed.inject(PaymentService);
    pay.getAll().subscribe();
    httpMock.expectOne('/api/payments').flush([]);
    pay.getByOrder(1).subscribe();
    httpMock.expectOne('/api/payments/order/1').flush({});
    pay.updateStatus(1, 'PAID').subscribe();
    httpMock.expectOne((r) => r.method === 'PATCH').flush({});

    const inv = TestBed.inject(InvoiceService);
    inv.getByUser(2).subscribe();
    httpMock.expectOne('/api/invoices/user/2').flush([]);
    inv.create(1).subscribe();
    httpMock.expectOne((r) => r.url === '/api/invoices' && r.method === 'POST').flush({});

    const sub = TestBed.inject(SubscriptionService);
    sub.getByUser(2).subscribe();
    httpMock.expectOne('/api/subscriptions/user/2').flush([]);
    sub.cancel(1).subscribe();
    httpMock.expectOne((r) => r.method === 'PATCH').flush({});
  });

  it('CartApiService (404 → null) and CartItemService', () => {
    const c = TestBed.inject(CartApiService);
    c.getByUser(2).subscribe((v) => expect(v).toBeNull());
    httpMock
      .expectOne('/api/carts/user/2')
      .flush('nf', { status: 404, statusText: 'Not Found' });
    c.create(2).subscribe();
    httpMock.expectOne((r) => r.method === 'POST').flush({ idCart: 1, items: [] });

    const ci = TestBed.inject(CartItemService);
    ci.listByCart(1).subscribe();
    httpMock.expectOne('/api/cart-items/cart/1').flush([]);
    ci.add(1, 2, 3).subscribe();
    httpMock.expectOne((r) => r.method === 'POST').flush({});
    ci.updateQuantity(1, 2).subscribe();
    httpMock.expectOne((r) => r.method === 'PUT').flush({});
    ci.remove(1).subscribe();
    httpMock.expectOne((r) => r.method === 'DELETE').flush({});
  });
});
