import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimespanPipe } from './timespan.pipe';
import { IntegerPipe } from './integer.pipe';

@NgModule({
  declarations: [TimespanPipe, IntegerPipe],
  imports: [CommonModule],
  exports: [TimespanPipe, IntegerPipe] // Boruları dışa aktar
})
export class CommonPipesModule { }
