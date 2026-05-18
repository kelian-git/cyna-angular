import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;
  const raw = [{ idProduct: 1, name: 'SOC', price: 999.99, des: 'd', stock: 2 }];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ProductService],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });
  afterEach(() => httpMock.verify());

  it('getAll enriches products', () => {
    service.getAll().subscribe((p) => {
      expect(p[0].available).toBe(true);
      expect(p[0].pricing?.yearly).toBe(999.99);
    });
    httpMock.expectOne('/api/products').flush(raw);
  });

  it('getById enriches a single product', () => {
    service.getById(1).subscribe((p) => expect(p.idProduct).toBe(1));
    httpMock.expectOne('/api/products/1').flush(raw[0]);
  });

  it('getByCategory hits the category endpoint', () => {
    service.getByCategory(3, 'SOC').subscribe((p) => expect(p.length).toBe(1));
    httpMock.expectOne('/api/products/category/3').flush(raw);
  });

  it('search / priceRange / inStock', () => {
    service.search('soc').subscribe();
    httpMock.expectOne((r) => r.url === '/api/products/search').flush(raw);
    service.priceRange(0, 9999).subscribe();
    httpMock.expectOne((r) => r.url === '/api/products/price-range').flush(raw);
    service.inStock().subscribe();
    httpMock.expectOne('/api/products/in-stock').flush(raw);
  });

  it('create / update / updateStock / remove', () => {
    service.create({ name: 'X', des: 'd', price: 1, stock: 1 }, 2).subscribe();
    httpMock.expectOne((r) => r.url === '/api/products' && r.method === 'POST').flush(raw[0]);
    service.update(1, { name: 'X', des: 'd', price: 1, stock: 1 }).subscribe();
    httpMock.expectOne((r) => r.url === '/api/products/1' && r.method === 'PUT').flush(raw[0]);
    service.updateStock(1, 5).subscribe();
    httpMock.expectOne((r) => r.method === 'PATCH').flush(raw[0]);
    service.remove(1).subscribe();
    httpMock.expectOne((r) => r.method === 'DELETE').flush({});
  });
});
