import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { CustomToastrService, ToastrMessageType, ToastrPosition } from '../../services/ui/custom-toastr.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { SpinnerType } from '../../base/base.component';
import { AuthService } from 'src/app/services/common/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastrService: CustomToastrService,
    private spinner: NgxSpinnerService) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.spinner.show(SpinnerType.BallAtom);
    this.authService.identityCheck();

    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
      this.toastrService.message('Oturum açmanız gerekiyor!', 'Yetkisiz Erişim!', {
        messageType: ToastrMessageType.Warning,
        position: ToastrPosition.TopRight
      });
      this.spinner.hide(SpinnerType.BallAtom);
      return false;
    }

    this.spinner.hide(SpinnerType.BallAtom);
    return true;
  }
}
