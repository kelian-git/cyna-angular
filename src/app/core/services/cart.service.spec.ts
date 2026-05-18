import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Product } from '../models';
import { CartService } from './cart.service';

const product = (id: number, price = 100): Product =>
  ({ idProduct: id, name: 'P' + id, price, des: 'd', stock: 5 }) as Product;

describe('CartService', () => {
  let cart: CartService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), CartService],
    });
    cart = TestBed.inject(CartService);
  });

  it('adds items and computes count/total', () => {
    cart.add(product(1, 100), 2);
    cart.add(product(2, 50), 1);
    expect(cart.count()).toBe(3);
    expect(cart.total()).toBe(250);
    expect(cart.getTotal()).toBe(250);
  });

  it('increments quantity when adding an existing product', () => {
    cart.add(product(1), 1);
    cart.add(product(1), 2);
    expect(cart.items().length).toBe(1);
    expect(cart.count()).toBe(3);
  });

  it('updates quantity and removes when quantity <= 0', () => {
    cart.add(product(1), 1);
    cart.updateQuantity(1, 5);
    expect(cart.count()).toBe(5);
    cart.updateQuantity(1, 0);
    expect(cart.items().length).toBe(0);
  });

  it('removes an item and clears the cart', () => {
    cart.add(product(1), 1);
    cart.add(product(2), 1);
    cart.remove(1);
    expect(cart.items().length).toBe(1);
    cart.clear();
    expect(cart.items().length).toBe(0);
  });

  it('persists to localStorage', () => {
    cart.add(product(7), 1);
    expect(localStorage.getItem('cyna-cart')).toContain('7');
  });

  it('syncToBackend returns null observable when logged out', (done) => {
    cart.syncToBackend().subscribe((r) => {
      expect(r).toBeNull();
      done();
    });
  });
});
