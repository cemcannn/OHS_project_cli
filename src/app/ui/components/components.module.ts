import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeModule } from './home/home.module';
import { RegisterComponent } from './register/register.component';
import { RegisterModule } from './register/register.module';
import { LoginComponent } from './login/login.component';
import { LoginModule } from './login/login.module';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { UpdatePasswordComponent } from './update-password/update-password.component';
import { PasswordResetModule } from './password-reset/password-reset.module';
import { UpdatePasswordModule } from './update-password/update-password.module';
import { RouterModule } from '@angular/router';
import { DefinitionModule } from './definition/definition.module';
import { PersonnelModule } from './personnel/personnel.module';
import { AccidentModule } from './accident/accident.module';




@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    HomeModule,
    RegisterModule,
    LoginModule,
    RouterModule,
    PasswordResetModule,
    UpdatePasswordModule,
    DefinitionModule,
    PersonnelModule,
    AccidentModule
  ],
  exports: [
  ]
})
export class ComponentsModule { }