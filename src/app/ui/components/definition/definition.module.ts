import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DefinitionComponent } from './definition.component';
import { RouterModule } from '@angular/router';
import { DialogModule } from 'src/app/dialogs/dialog.module';
import { DeleteDirectiveModule } from 'src/app/directives/admin/delete.directive.module';


@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,DialogModule,DeleteDirectiveModule,
    RouterModule.forChild([
      { path: "", component: DefinitionComponent}
    ])
  ]
})
export class DefinitionModule { }
