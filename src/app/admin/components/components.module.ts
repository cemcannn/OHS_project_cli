import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserModule } from './user/user.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuthorizeMenuModule } from './authorize-menu/authorize-menu.module';
import { RoleModule } from './role/role.module';
import { ListComponent } from './user/list/list.component';
import { UserComponent } from './user/user.component';




@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    DashboardModule,
    AuthorizeMenuModule,
    RoleModule,
    UserModule
  ]
})
export class ComponentsModule { }