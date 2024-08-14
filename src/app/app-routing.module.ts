import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './admin/components/dashboard/dashboard.component';
import { AuthGuard } from './guards/common/auth.guard';
import { LayoutComponent } from './admin/layout/layout.component';
import { LayoutComponent as UiLayoutComponent } from './ui/layout/layout.component';
import { HomeComponent } from './ui/components/home/home.component';



const routes: Routes = [
  {
    path: "admin", component: LayoutComponent, children: [
      { path: "", component: DashboardComponent, canActivate: [AuthGuard] },
      { path: "authorize-menu", loadChildren: () => import("./admin/components/authorize-menu/authorize-menu.module").then(module => module.AuthorizeMenuModule), canActivate: [AuthGuard] },
      { path: "roles", loadChildren: () => import("./admin/components/role/role.module").then(module => module.RoleModule), canActivate: [AuthGuard] },
      { path: "users", loadChildren: () => import("./admin/components/user/user.module").then(module => module.UserModule), canActivate: [AuthGuard] },
    ], canActivate: [AuthGuard]
  },
  // { path: "", component: EntranceComponent },
  {
    path: "", component: UiLayoutComponent, children: [
      { path: "", component: HomeComponent },
      {
        path: "accident", loadChildren: () => import("./ui/components/accident/accident.module").then
          (module => module.AccidentModule)
      },
      {
        path: "definition", loadChildren: () => import("./ui/components/definition/definition.module").then
          (module => module.DefinitionModule)
      },
      {
        path: "personnel", loadChildren: () => import("./ui/components/personnel/personnel.module").then
          (module => module.PersonnelModule)
      },
      {
        path: "monthly-directorate-data", loadChildren: () => import("./ui/components/monthly-directorate-data/monthly-directorate-data.module").then
          (module => module.MonthlyDirectorateDataModule)
      },
      {
        path: "accident-statistic", loadChildren: () => import("./ui/components/accident-statistic/accident-statistic.module").then
          (module => module.AccidentStatisticModule)
      },
      {
        path: "accident-rate", loadChildren: () => import("./ui/components/accident-rate/accident-rate.module").then
          (module => module.AccidentRateModule)
      },
      {
        path: "chart", loadChildren: () => import("./ui/components/chart/chart.module").then
          (module => module.ChartModule)
      },
      { path: "register", loadChildren: () => import("./ui/components/register/register.module").then(module => module.RegisterModule) },
      { path: "login", loadChildren: () => import("./ui/components/login/login.module").then(module => module.LoginModule) },
      { path: "password-reset", loadChildren: () => import("./ui/components/password-reset/password-reset.module").then(module => module.PasswordResetModule) },
      { path: "update-password/:userId/:resetToken", loadChildren: () => import("./ui/components/update-password/update-password.module").then(module => module.UpdatePasswordModule) },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }