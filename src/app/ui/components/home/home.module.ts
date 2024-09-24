import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { RouterModule } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {MatCardModule} from '@angular/material/card';



@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule, MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule,
    MatTableModule, MatCardModule,
    MatSortModule,
    RouterModule.forChild([
      { path: "", component: HomeComponent}
    ])
  ]
})
export class HomeModule { }
