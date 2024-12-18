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
  {
    path: "", component: UiLayoutComponent, children: [
      { path: "", component: HomeComponent, canActivate: [AuthGuard] },
      {
        path: "accident", loadChildren: () => import("./ui/components/accident/accident.module").then(module => module.AccidentModule), canActivate: [AuthGuard]
      },
      {
        path: "definition", loadChildren: () => import("./ui/components/definition/definition.module").then(module => module.DefinitionModule), canActivate: [AuthGuard]
      },
      {
        path: "personnel", loadChildren: () => import("./ui/components/personnel/personnel.module").then(module => module.PersonnelModule), canActivate: [AuthGuard]
      },
      {
        path: "monthly-directorate-data", loadChildren: () => import("./ui/components/monthly-directorate-data/monthly-directorate-data.module").then(module => module.MonthlyDirectorateDataModule), canActivate: [AuthGuard]
      },
      {
        path: "accident-statistic", loadChildren: () => import("./ui/components/accident-statistic/accident-statistic.module").then(module => module.AccidentStatisticModule), canActivate: [AuthGuard]
      },
      {
        path: "accident-rate", loadChildren: () => import("./ui/components/accident-rate/accident-rate.module").then(module => module.AccidentRateModule), canActivate: [AuthGuard]
      },
      {
        path: "chart", loadChildren: () => import("./ui/components/chart/chart.module").then(module => module.ChartModule), canActivate: [AuthGuard]
      },
      { path: "register", loadChildren: () => import("./ui/components/register/register.module").then(module => module.RegisterModule) },
      { path: "login", loadChildren: () => import("./ui/components/login/login.module").then(module => module.LoginModule) },
      { path: 'update-password/:userId', loadChildren: () => import("./ui/components/update-password/update-password.module").then(module => module.UpdatePasswordModule) },
      { path: 'user', loadChildren: () => import("./ui/components/user/user.module").then(module => module.UserModule) },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
