import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeleteDialogComponent } from './delete-dialog/delete-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthorizeMenuDialogComponent } from './authorize/authorize-menu-dialog/authorize-menu-dialog.component';
import { MatBadgeModule } from '@angular/material/badge';
import { MatListModule } from '@angular/material/list';
import { AuthorizeUserDialogComponent } from './authorize/authorize-user-dialog/authorize-user-dialog.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AccidentAddComponent } from './accident/accident-add-dialog/accident-add.component';
import { AccidentListComponent } from './accident/accident-list/accident-list.component';
import { DeleteDirectiveModule } from '../directives/admin/delete.directive.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccidentUpdateDialogComponent } from './accident/accident-update-dialog/accident-update-dialog.component';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { TimespanPipe } from '../pipes/timespan.pipe';
import { PersonnelUpdateDialogComponent } from './personnel/personnel-update-dialog/personnel-update-dialog.component';
import { PersonnelAddDialogComponent } from './personnel/personnel-add-dialog/personnel-add-dialog.component';
import { DateNotInFutureValidatorDirective, TimeNotInFutureValidatorDirective } from '../directives/validator.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { ShowTypeOfAccidentDialogComponent } from './definition/show-type-of-accident-dialog/show-type-of-accident-dialog.component';
import { ShowLimbDialogComponent } from './definition/show-limb-dialog/show-limb-dialog.component';
import { ShowProfessionDialogComponent } from './definition/show-profession-dialog/show-profession-dialog.component';
import { ShowAccidentAreaDialogComponent } from './definition/show-accident-area-dialog/show-accident-area-dialog.component';




@NgModule({
  declarations: [
    DeleteDialogComponent,
    AuthorizeMenuDialogComponent,
    AuthorizeUserDialogComponent,
    AccidentAddComponent,
    PersonnelAddDialogComponent,
    AccidentListComponent,
    AccidentUpdateDialogComponent,
    TimespanPipe,
    PersonnelUpdateDialogComponent,
    DateNotInFutureValidatorDirective,
    TimeNotInFutureValidatorDirective,
    ShowTypeOfAccidentDialogComponent,
    ShowLimbDialogComponent,
    ShowProfessionDialogComponent,
    ShowAccidentAreaDialogComponent

  ],
  imports: [
    FormsModule, MatSelectModule, MatIconModule, MatDatepickerModule, MatNativeDateModule, MatPaginatorModule, MatSortModule, ReactiveFormsModule, CommonModule, MatDialogModule, MatButtonModule, MatCardModule, MatTableModule, MatToolbarModule, MatBadgeModule, MatListModule, MatFormFieldModule, MatInputModule, DeleteDirectiveModule
  ]
})
export class DialogModule { }