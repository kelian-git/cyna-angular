import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Mot de passe : 8+ caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial. */
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const CARD_NUMBER_REGEX = /^\d{16}$/;
export const CVV_REGEX = /^\d{3,4}$/;
export const EXPIRY_REGEX = /^(0[1-9]|1[0-2])\/\d{2}$/;

export function isStrongPassword(pwd: string | null | undefined): boolean {
  return PASSWORD_REGEX.test(pwd || '');
}

export function isEmail(value: string | null | undefined): boolean {
  return EMAIL_REGEX.test(value || '');
}

/** Validators Angular réutilisables (Reactive Forms). */
export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return isStrongPassword(control.value) ? null : { weakPassword: true };
  };
}

export function patternValidator(regex: RegExp, errorKey: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    return regex.test(control.value) ? null : { [errorKey]: true };
  };
}
