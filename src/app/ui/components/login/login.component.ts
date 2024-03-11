import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { async } from 'rxjs';
import { BaseComponent, SpinnerType } from '../../../base/base.component';
import { TokenResponse } from '../../../contracts/token/tokenResponse';
import { AuthService, _isAuthenticated } from '../../../services/common/auth.service';
import { HttpClientService } from '../../../services/common/http-client.service';
import { UserAuthService } from '../../../services/common/models/user-auth.service';
import { UserService } from '../../../services/common/models/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends BaseComponent implements OnInit {

  constructor(private userAuthService: UserAuthService, spinner: NgxSpinnerService, private authService: AuthService, private activatedRoute: ActivatedRoute, private router: Router) {
    super(spinner) }

  ngOnInit(): void {
  }

  async login(usernameOrEmail: string, password: string) {
    this.showSpinner(SpinnerType.BallAtom);
    await this.userAuthService.login(usernameOrEmail, password, () => {
      this.authService.identityCheck();

      this.activatedRoute.queryParams.subscribe(params => {
        const returnUrl: string = params["returnUrl"];
        if (returnUrl)
          this.router.navigate([returnUrl]);

        if (_isAuthenticated) 
          this.router.navigate([""]);
        
      });
      this.hideSpinner(SpinnerType.BallAtom);
    });
  }
}