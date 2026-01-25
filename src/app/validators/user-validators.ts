import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Kullanıcı için özel validatorlar
 */

/**
 * Kullanıcı adı validator
 */
export function usernameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    // Kullanıcı adı: harf, rakam, alt çizgi ve nokta içerebilir
    const usernameRegex = /^[a-zA-Z0-9_.]+$/;
    if (!usernameRegex.test(value)) {
      return { 'username': { message: 'Kullanıcı adı sadece harf, rakam, alt çizgi ve nokta içerebilir.' } };
    }

    if (value.length < 3) {
      return { 'username': { message: 'Kullanıcı adı en az 3 karakter olmalıdır.' } };
    }

    if (value.length > 50) {
      return { 'username': { message: 'Kullanıcı adı en fazla 50 karakter olabilir.' } };
    }

    return null;
  };
}

/**
 * Güçlü şifre validator
 */
export function strongPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    const errors: any = {};

    if (value.length < 8) {
      errors.minLength = 'Şifre en az 8 karakter olmalıdır.';
    }

    if (!/[A-Z]/.test(value)) {
      errors.uppercase = 'Şifre en az bir büyük harf içermelidir.';
    }

    if (!/[a-z]/.test(value)) {
      errors.lowercase = 'Şifre en az bir küçük harf içermelidir.';
    }

    if (!/[0-9]/.test(value)) {
      errors.number = 'Şifre en az bir rakam içermelidir.';
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.special = 'Şifre en az bir özel karakter içermelidir.';
    }

    if (Object.keys(errors).length > 0) {
      return { 'strongPassword': errors };
    }

    return null;
  };
}

/**
 * Şifre eşleşme validator
 */
export function passwordMatchValidator(passwordControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) {
      return null;
    }

    const passwordControl = control.parent.get(passwordControlName);
    
    if (!passwordControl) {
      return null;
    }

    if (control.value !== passwordControl.value) {
      return { 'passwordMatch': { message: 'Şifreler eşleşmiyor.' } };
    }

    return null;
  };
}

/**
 * Email validator (gelişmiş)
 */
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    if (!emailRegex.test(value)) {
      return { 'email': { message: 'Geçerli bir email adresi giriniz.' } };
    }

    if (value.length > 250) {
      return { 'email': { message: 'Email adresi en fazla 250 karakter olabilir.' } };
    }

    return null;
  };
}

/**
 * Rol adı validator
 */
export function roleNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    // Rol adı: harf, rakam ve boşluk içerebilir
    const roleRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ0-9\s]+$/;
    if (!roleRegex.test(value)) {
      return { 'roleName': { message: 'Rol adı sadece harf, rakam ve boşluk içerebilir.' } };
    }

    if (value.length < 2) {
      return { 'roleName': { message: 'Rol adı en az 2 karakter olmalıdır.' } };
    }

    if (value.length > 50) {
      return { 'roleName': { message: 'Rol adı en fazla 50 karakter olabilir.' } };
    }

    return null;
  };
}
