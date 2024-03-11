import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import {MatListModule} from '@angular/material/list';


@NgModule({
  declarations: [
    SidebarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatListModule
  ],
  exports: [
    SidebarComponent
  ]
})
export class ComponentsModule { }
