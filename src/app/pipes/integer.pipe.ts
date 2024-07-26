import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'integer'})
export class IntegerPipe implements PipeTransform {
  transform(value: number): number {
    return Math.floor(value);
  }
}