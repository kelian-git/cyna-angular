import { Product } from '../models';
import { SearchService } from './search.service';

const P = (over: Partial<Product>): Product =>
  ({
    idProduct: 1,
    name: 'SOC Platform',
    des: 'desc',
    price: 1000,
    stock: 5,
    available: true,
    ...over,
  }) as Product;

describe('SearchService', () => {
  const service = new SearchService();

  it('exposes matchScore', () => {
    expect(service.matchScore('soc', 'SOC')).toBe(4);
  });

  it('filters by keyword and sorts by score', () => {
    const products = [
      P({ idProduct: 1, name: 'SOC Platform' }),
      P({ idProduct: 2, name: 'EDR Agent' }),
    ];
    const res = service.searchProducts(products, { keyword: 'SOC Platform' });
    expect(res[0].idProduct).toBe(1);
    expect(res.find((p) => p.idProduct === 2)).toBeUndefined();
  });

  it('applies price range and availability filters', () => {
    const products = [
      P({ idProduct: 1, price: 500, stock: 0, available: false }),
      P({ idProduct: 2, price: 2000, stock: 3, available: true }),
    ];
    const res = service.searchProducts(products, {
      priceMin: 1000,
      priceMax: 3000,
      onlyAvailable: true,
    });
    expect(res.length).toBe(1);
    expect(res[0].idProduct).toBe(2);
  });

  it('filters by category ids', () => {
    const products = [
      P({ idProduct: 1, category: { idCategory: 10, name: 'A' } }),
      P({ idProduct: 2, category: { idCategory: 20, name: 'B' } }),
    ];
    const res = service.searchProducts(products, { categoryIds: [20] });
    expect(res.map((p) => p.idProduct)).toEqual([2]);
  });
});
