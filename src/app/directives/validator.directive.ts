import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator, ValidatorFn, Validators } from '@angular/forms';
import { Directive, Input } from '@angular/core';

export function dateNotInFutureValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const currentDate = new Date();
    if (control.value && new Date(control.value) > currentDate) {
      return { 'dateInFuture': true };
    }
    return null;
  };
}

export function timeNotInFutureValidator(dateControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const dateControl = control.parent?.get(dateControlName);
    const currentDate = new Date();
    if (dateControl && dateControl.value) {
      const date = new Date(dateControl.value);
      const time = control.value.split(':');
      if (time.length === 2) {
        date.setHours(parseInt(time[0], 10));
        date.setMinutes(parseInt(time[1], 10));
        if (date > currentDate) {
          return { 'timeInFuture': true };
        }
      }
    }
    return null;
  };
}

@Directive({
  selector: '[dateNotInFuture]',
  providers: [{ provide: NG_VALIDATORS, useExisting: DateNotInFutureValidatorDirective, multi: true }]
})
export class DateNotInFutureValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return dateNotInFutureValidator()(control);
  }
}

@Directive({
  selector: '[timeNotInFuture]',
  providers: [{ provide: NG_VALIDATORS, useExisting: TimeNotInFutureValidatorDirective, multi: true }]
})
export class TimeNotInFutureValidatorDirective implements Validator {
  @Input('timeNotInFuture') dateControlName: string;

  validate(control: AbstractControl): ValidationErrors | null {
    return timeNotInFutureValidator(this.dateControlName)(control);
  }
}
