import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';
import { Product } from '../../../core/models';
import { ProductCardComponent } from './product-card.component';

const product = (over: Partial<Product> = {}): Product =>
  ({
    idProduct: 1,
    name: 'SOC Platform',
    des: 'desc',
    price: 1999.99,
    stock: 3,
    available: true,
    imageUrl: 'http://img',
    ...over,
  }) as Product;

describe('ProductCardComponent', () => {
  let fixture: ComponentFixture<ProductCardComponent>;
  let component: ProductCardComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductCardComponent, RouterTestingModule, TranslateModule.forRoot()],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
  });

  it('renders product name and price', () => {
    component.product = product();
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('SOC Platform');
    expect(component.price).toContain('999');
  });

  it('shows out-of-stock badge and disables add when unavailable', () => {
    component.product = product({ available: false, stock: 0 });
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn.disabled).toBe(true);
    expect(fixture.nativeElement.querySelector('app-badge')).toBeTruthy();
  });

  it('emits add when the button is clicked', () => {
    const spy = jest.fn();
    component.product = product();
    component.add.subscribe(spy);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    expect(spy).toHaveBeenCalledWith(component.product);
  });
});
