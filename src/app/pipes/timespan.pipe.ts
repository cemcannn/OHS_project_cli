import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timespan'
})
export class TimespanPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';

    const match = value.match(/PT(\d+)H(\d+)M(\d+)/);
    if (!match) return value;

    const hours = match[1].padStart(2, '0');
    const minutes = match[2].padStart(2, '0');

    return `${hours}:${minutes}`;
  }
}
