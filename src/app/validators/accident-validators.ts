import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Kaza için özel validatorlar
 */

/**
 * Kayıp iş günü validator
 */
export function lostWorkDaysValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const days = parseInt(value, 10);

    if (isNaN(days)) {
      return { 'lostWorkDays': { message: 'Geçerli bir sayı giriniz.' } };
    }

    if (days < 0) {
      return { 'lostWorkDays': { message: 'Kayıp iş günü negatif olamaz.' } };
    }

    if (days > 365) {
      return { 'lostWorkDays': { message: 'Kayıp iş günü 365 günü aşamaz.' } };
    }

    return null;
  };
}

/**
 * Kaza açıklaması validator
 */
export function accidentDescriptionValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    if (value.length < 10) {
      return { 'accidentDescription': { message: 'Açıklama en az 10 karakter olmalıdır.' } };
    }

    if (value.length > 500) {
      return { 'accidentDescription': { message: 'Açıklama en fazla 500 karakter olabilir.' } };
    }

    return null;
  };
}

/**
 * Kaza saati gelecekte olamaz validator
 * Kaza tarihini kontrol ederek kaza saatinin gelecekte olup olmadığını kontrol eder
 */
export function accidentTimeNotInFutureValidator(dateControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.parent) {
      return null;
    }

    const dateControl = control.parent.get(dateControlName);
    const timeValue = control.value;

    if (!dateControl || !dateControl.value || !timeValue) {
      return null;
    }

    const accidentDate = new Date(dateControl.value);
    const timeParts = timeValue.split(':');
    
    if (timeParts.length !== 2) {
      return null; // Format kontrolü başka validator tarafından yapılmalı
    }

    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);

    accidentDate.setHours(hours, minutes, 0, 0);

    const now = new Date();

    if (accidentDate > now) {
      return { 'accidentTimeInFuture': { message: 'Kaza zamanı gelecekte olamaz.' } };
    }

    return null;
  };
}

/**
 * Kaza tarihi kontrol validator
 * Belirli bir tarih aralığında olmalı
 */
export function accidentDateRangeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const accidentDate = new Date(control.value);
    const now = new Date();
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(now.getFullYear() - 10);

    if (accidentDate > now) {
      return { 'accidentDateRange': { message: 'Kaza tarihi gelecekte olamaz.' } };
    }

    if (accidentDate < tenYearsAgo) {
      return { 'accidentDateRange': { message: 'Kaza tarihi son 10 yıl içinde olmalıdır.' } };
    }

    return null;
  };
}
