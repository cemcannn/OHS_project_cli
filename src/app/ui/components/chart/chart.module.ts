import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChartComponent } from './chart.component';



@NgModule({
  declarations: [
    ChartComponent
  ],
  imports: [
    CommonModule, MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    RouterModule.forChild([
      { path: "", component: ChartComponent}
    ])
  ]
})
export class ChartModule { }
