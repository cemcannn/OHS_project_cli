import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * TC Kimlik Numarası validator
 * 11 haneli olmalı ve geçerli bir TC kimlik numarası olmalı
 */
export function tcIdValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null; // Boş değer için başka bir validator kullanılmalı (required)
    }

    // 11 haneli olmalı
    if (value.length !== 11) {
      return { 'tcId': { message: 'TC Kimlik Numarası 11 haneli olmalıdır.' } };
    }

    // Sadece rakamlardan oluşmalı
    if (!/^\d+$/.test(value)) {
      return { 'tcId': { message: 'TC Kimlik Numarası sadece rakamlardan oluşmalıdır.' } };
    }

    // İlk hane 0 olamaz
    if (value[0] === '0') {
      return { 'tcId': { message: 'TC Kimlik Numarası 0 ile başlayamaz.' } };
    }

    return null;
  };
}

/**
 * Pozitif sayı validator
 */
export function positiveNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value && value !== 0) {
      return null;
    }

    if (value < 0) {
      return { 'positiveNumber': { message: 'Değer negatif olamaz.' } };
    }

    return null;
  };
}

/**
 * Saat formatı validator (HH:mm)
 */
export function timeFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) {
      return { 'timeFormat': { message: 'Geçerli bir saat formatı giriniz (HH:mm).' } };
    }

    return null;
  };
}

/**
 * Tarih gelecekte olamaz validator
 */
export function dateNotInFutureValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const currentDate = new Date();
    if (control.value && new Date(control.value) > currentDate) {
      return { 'dateInFuture': { message: 'Tarih gelecekte olamaz.' } };
    }
    return null;
  };
}

/**
 * Tarih geçmişte olmalı validator (doğum tarihi için)
 */
export function dateInPastValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const currentDate = new Date();
    if (control.value && new Date(control.value) >= currentDate) {
      return { 'dateNotInPast': { message: 'Tarih geçmişte olmalıdır.' } };
    }
    return null;
  };
}

/**
 * Minimum yaş validator
 */
export function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      if (age - 1 < minAge) {
        return { 'minAge': { message: `En az ${minAge} yaşında olmalısınız.` } };
      }
    } else if (age < minAge) {
      return { 'minAge': { message: `En az ${minAge} yaşında olmalısınız.` } };
    }

    return null;
  };
}

/**
 * Maksimum yaş validator
 */
export function maxAgeValidator(maxAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const birthDate = new Date(control.value);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      if (age - 1 > maxAge) {
        return { 'maxAge': { message: `En fazla ${maxAge} yaşında olabilirsiniz.` } };
      }
    } else if (age > maxAge) {
      return { 'maxAge': { message: `En fazla ${maxAge} yaşında olabilirsiniz.` } };
    }

    return null;
  };
}

/**
 * Yıl formatı validator (YYYY)
 */
export function yearFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    if (!/^\d{4}$/.test(value.toString())) {
      return { 'yearFormat': { message: 'Yıl 4 haneli olmalıdır.' } };
    }

    const year = parseInt(value, 10);
    const currentYear = new Date().getFullYear();
    
    if (year < 1900 || year > currentYear + 10) {
      return { 'yearFormat': { message: `Yıl ${1900} ile ${currentYear + 10} arasında olmalıdır.` } };
    }

    return null;
  };
}

/**
 * Ay validator (1-12)
 */
export function monthValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    const month = parseInt(value, 10);
    
    if (month < 1 || month > 12) {
      return { 'month': { message: 'Ay 1-12 arasında olmalıdır.' } };
    }

    return null;
  };
}
