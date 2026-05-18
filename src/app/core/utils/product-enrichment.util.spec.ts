import { Product } from '../models';
import { enrichProduct, sortByPriorityAndStock } from './product-enrichment.util';

describe('enrichProduct', () => {
  it('derives availability, pricing, image and characteristics', () => {
    const p = enrichProduct(
      { idProduct: 1, name: 'EDR Pack', price: 1200, des: 'desc', stock: 5 },
      'EDR',
    );
    expect(p.available).toBe(true);
    expect(p.pricing?.yearly).toBe(1200);
    expect(p.pricing?.monthly).toBe(100);
    expect(p.imageUrl).toContain('http');
    expect(p.characteristics?.length).toBeGreaterThan(0);
  });

  it('marks out-of-stock products as unavailable and uses fallbacks', () => {
    const p = enrichProduct({ idProduct: 2, name: 'X', price: 100, des: 'd', stock: 0 });
    expect(p.available).toBe(false);
    expect(p.characteristics).toEqual(['Support inclus', 'Documentation complète']);
  });
});

describe('sortByPriorityAndStock', () => {
  it('puts available products first, then by priority desc', () => {
    const list = [
      { idProduct: 1, available: false, priority: 5 },
      { idProduct: 2, available: true, priority: 1 },
      { idProduct: 3, available: true, priority: 9 },
    ] as Product[];
    const sorted = sortByPriorityAndStock(list);
    expect(sorted[0].idProduct).toBe(3);
    expect(sorted[1].idProduct).toBe(2);
    expect(sorted[2].idProduct).toBe(1);
  });
});
