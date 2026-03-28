import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { CustomToastrService, ToastrMessageType, ToastrPosition } from '../../services/ui/custom-toastr.service';
import { AuthService } from '../../services/common/auth.service';

@Injectable({
  providedIn: 'root'
})
export class SuperAdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private toastrService: CustomToastrService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    this.authService.identityCheck();

    if (!this.authService.canAccessAdminPanel) {
      this.toastrService.message('Bu alana yalnızca SuperAdmin erişebilir.', 'Yetkisiz Erişim!', {
        messageType: ToastrMessageType.Warning,
        position: ToastrPosition.TopRight
      });
      this.router.navigate(['/']);
      return false;
    }

    return true;
  }
}
