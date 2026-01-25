import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Personel için özel validatorlar
 */

/**
 * İsim validator - Türkçe karakterleri destekler
 */
export function nameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    // Türkçe karakterler dahil sadece harf ve boşluk
    const nameRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/;
    if (!nameRegex.test(value)) {
      return { 'name': { message: 'İsim sadece harflerden oluşmalıdır.' } };
    }

    if (value.length < 2) {
      return { 'name': { message: 'İsim en az 2 karakter olmalıdır.' } };
    }

    if (value.length > 30) {
      return { 'name': { message: 'İsim en fazla 30 karakter olabilir.' } };
    }

    return null;
  };
}

/**
 * Soyisim validator
 */
export function surnameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    const surnameRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/;
    if (!surnameRegex.test(value)) {
      return { 'surname': { message: 'Soyisim sadece harflerden oluşmalıdır.' } };
    }

    if (value.length < 2) {
      return { 'surname': { message: 'Soyisim en az 2 karakter olmalıdır.' } };
    }

    if (value.length > 30) {
      return { 'surname': { message: 'Soyisim en fazla 30 karakter olabilir.' } };
    }

    return null;
  };
}

/**
 * TKI ID validator
 */
export function tkiIdValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    // TKI ID formatı: genellikle rakamlardan oluşur
    if (!/^\d+$/.test(value)) {
      return { 'tkiId': { message: 'TKI ID sadece rakamlardan oluşmalıdır.' } };
    }

    return null;
  };
}

/**
 * Çalışma yaşı validator (16-67 yaş arası)
 */
export function workingAgeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    let actualAge = age;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      actualAge = age - 1;
    }

    if (actualAge < 16) {
      return { 'workingAge': { message: 'Çalışan en az 16 yaşında olmalıdır.' } };
    }

    if (actualAge > 67) {
      return { 'workingAge': { message: 'Çalışan en fazla 67 yaşında olabilir.' } };
    }

    return null;
  };
}
