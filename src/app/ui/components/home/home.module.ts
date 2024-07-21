import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';




@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule, 
    MatTableModule,
    MatSortModule,
    RouterModule.forChild([
      { path: "", component: HomeComponent}
    ])
  ]
})
export class HomeModule { }
