import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActualDailyWageComponent } from './actual-daily-wage.component';
import { ListComponent } from './list/list.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    ActualDailyWageComponent,
    ListComponent
  ],
  imports: [
    CommonModule, MatSidenavModule, MatFormFieldModule, MatSelectModule, FormsModule, ReactiveFormsModule,
     MatTableModule,
    MatSortModule,
    RouterModule.forChild([
      { path: "", component: ActualDailyWageComponent}
    ])
  ]
})
export class ActualDailyWageModule { }
