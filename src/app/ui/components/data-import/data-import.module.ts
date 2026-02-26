import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { DataImportComponent } from './data-import.component';

@NgModule({
  declarations: [DataImportComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: DataImportComponent }]),
  ],
})
export class DataImportModule {}
