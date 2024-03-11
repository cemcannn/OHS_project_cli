import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthorizeMenuDialogComponent } from './authorize-menu-dialog/authorize-menu-dialog.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { AuthorizeUserDialogComponent } from './authorize-user-dialog/authorize-user-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AccidentAddComponent } from './accident-add-dialog/accident-add.component';
import { PersonnelAddComponent } from './personnel-add-dialog/personnel-add-dialog.component';
import { AccidentListComponent } from './accident-list/accident-list.component';
import { DeleteDirectiveModule } from '../directives/admin/delete.directive.module';


@NgModule({
  declarations: [
    DeleteDialogComponent,
    AuthorizeMenuDialogComponent,
    AuthorizeUserDialogComponent,
    AccidentAddComponent,
    PersonnelAddComponent,
    AccidentListComponent
  ],
  imports: [
    CommonModule, MatDialogModule, MatButtonModule, MatCardModule, MatTableModule, MatToolbarModule, MatBadgeModule, MatListModule, MatFormFieldModule, MatInputModule, DeleteDirectiveModule
  ]
})
export class DialogModule { }