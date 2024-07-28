import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';




@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule, MatFormFieldModule, MatSelectModule,
    MatTableModule,
    MatSortModule,
    RouterModule.forChild([
      { path: "", component: HomeComponent}
    ])
  ]
})
export class HomeModule { }
