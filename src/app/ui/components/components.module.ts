import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeModule } from './home/home.module';
import { RegisterComponent } from './register/register.component';
import { RegisterModule } from './register/register.module';
import { LoginComponent } from './login/login.component';
import { LoginModule } from './login/login.module';
import { UpdatePasswordComponent } from './update-password/update-password.component';
import { UpdatePasswordModule } from './update-password/update-password.module';
import { RouterModule } from '@angular/router';
import { DefinitionModule } from './definition/definition.module';
import { PersonnelModule } from './personnel/personnel.module';
import { AccidentModule } from './accident/accident.module';
import { AccidentStatisticModule } from './accident-statistic/accident-statistic.module';
import { AccidentRateModule } from './accident-rate/accident-rate.module';
import { UserModule } from './user/user.module';




@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HomeModule,
    RegisterModule,
    LoginModule,
    RouterModule,
    UpdatePasswordModule,
    DefinitionModule,
    PersonnelModule,
    AccidentModule,
    AccidentStatisticModule,
    UserModule,
    AccidentRateModule
  ],
  exports: [
  ]
})
export class ComponentsModule { }