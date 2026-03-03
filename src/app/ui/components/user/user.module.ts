import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserComponent } from './user.component';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { DialogModule } from 'src/app/dialogs/dialog.module';


@NgModule({
  declarations: [
    UserComponent
  ],
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, DialogModule,
    RouterModule.forChild([
      { path: "", component: UserComponent }
    ])
  ]
})
export class UserModule { }
