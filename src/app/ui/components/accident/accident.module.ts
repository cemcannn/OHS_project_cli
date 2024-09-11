import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccidentComponent } from './accident.component';
import { RouterModule } from '@angular/router';
import { ListComponent } from './list/list.component';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { DeleteDirectiveModule } from 'src/app/directives/admin/delete.directive.module';
import { MatPaginatorModule } from '@angular/material/paginator';
import { DialogModule } from 'src/app/dialogs/dialog.module';
import { MatSortModule } from '@angular/material/sort';
import { CommonPipesModule } from 'src/app/pipes/common-pipes.module';
import { MatSelectModule } from '@angular/material/select';



@NgModule({
  declarations: [
    AccidentComponent,
    ListComponent
  ],
  imports: [
    CommonModule, MatSidenavModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatTableModule, MatPaginatorModule,
    DialogModule, MatSortModule, MatSelectModule,
    DeleteDirectiveModule, CommonPipesModule,
    RouterModule.forChild([
      { path: "", component: AccidentComponent}
    ])
  ]
})
export class AccidentModule { }
