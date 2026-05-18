import { formatDate, formatDateTime, formatPrice, maskCardNumber } from './formatters.util';

describe('formatters', () => {
  describe('formatPrice', () => {
    it('returns em dash for null/NaN', () => {
      expect(formatPrice(null)).toBe('—');
      expect(formatPrice(undefined)).toBe('—');
      expect(formatPrice(NaN)).toBe('—');
    });
    it('formats a number as EUR currency', () => {
      const out = formatPrice(1999.99);
      expect(out).toContain('1');
      expect(out).toContain('999');
    });
  });

  describe('formatDate / formatDateTime', () => {
    it('returns em dash for empty/invalid', () => {
      expect(formatDate('')).toBe('—');
      expect(formatDate('not-a-date')).toBe('—');
      expect(formatDateTime('')).toBe('—');
    });
    it('formats valid dates', () => {
      expect(formatDate('2026-05-12')).not.toBe('—');
      expect(formatDateTime('2026-05-12T10:00:00')).not.toBe('—');
      expect(formatDate(new Date('2026-05-12'))).not.toBe('—');
    });
  });

  describe('maskCardNumber', () => {
    it('masks all but last 4 digits', () => {
      expect(maskCardNumber('4242424242424242')).toBe('•••• •••• •••• 4242');
    });
    it('returns dots for short/empty input', () => {
      expect(maskCardNumber('12')).toBe('••••');
      expect(maskCardNumber('')).toBe('••••');
      expect(maskCardNumber(null)).toBe('••••');
    });
  });
});
