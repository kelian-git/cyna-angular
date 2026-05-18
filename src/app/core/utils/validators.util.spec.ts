import { FormControl } from '@angular/forms';
import {
  CARD_NUMBER_REGEX,
  EXPIRY_REGEX,
  isEmail,
  isStrongPassword,
  patternValidator,
  strongPasswordValidator,
} from './validators.util';

describe('validators', () => {
  it('isStrongPassword enforces complexity', () => {
    expect(isStrongPassword('Abcdef1!')).toBe(true);
    expect(isStrongPassword('weak')).toBe(false);
    expect(isStrongPassword('')).toBe(false);
    expect(isStrongPassword(null)).toBe(false);
  });

  it('isEmail validates emails', () => {
    expect(isEmail('a@b.com')).toBe(true);
    expect(isEmail('bad')).toBe(false);
    expect(isEmail(undefined)).toBe(false);
  });

  it('regexes match expected formats', () => {
    expect(CARD_NUMBER_REGEX.test('4242424242424242')).toBe(true);
    expect(CARD_NUMBER_REGEX.test('123')).toBe(false);
    expect(EXPIRY_REGEX.test('12/27')).toBe(true);
    expect(EXPIRY_REGEX.test('13/27')).toBe(false);
  });

  it('strongPasswordValidator returns error object or null', () => {
    const v = strongPasswordValidator();
    expect(v(new FormControl(''))).toBeNull();
    expect(v(new FormControl('Abcdef1!'))).toBeNull();
    expect(v(new FormControl('weak'))).toEqual({ weakPassword: true });
  });

  it('patternValidator validates against regex', () => {
    const v = patternValidator(CARD_NUMBER_REGEX, 'card');
    expect(v(new FormControl(''))).toBeNull();
    expect(v(new FormControl('4242424242424242'))).toBeNull();
    expect(v(new FormControl('xx'))).toEqual({ card: true });
  });
});
