import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonthlyDirectorateDataComponent } from './monthly-directorate-data.component';
import { ListComponent } from './list/list.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DialogModule } from '@angular/cdk/dialog';
import { MatSortModule } from '@angular/material/sort';
import { DeleteDirectiveModule } from 'src/app/directives/admin/delete.directive.module';
import { CommonPipesModule } from 'src/app/pipes/common-pipes.module';
import { RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';



@NgModule({
  declarations: [
    MonthlyDirectorateDataComponent,
    ListComponent
  ],
  imports: [
    CommonModule, MatSidenavModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatTableModule, MatPaginatorModule,
    DialogModule, MatSortModule, DeleteDirectiveModule, CommonPipesModule, MatSelectModule,
    RouterModule.forChild([
      { path: "", component: MonthlyDirectorateDataComponent}
    ])
  ]
})
export class MonthlyDirectorateDataModule { }
