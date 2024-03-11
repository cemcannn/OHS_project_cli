import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserService } from './models/user.service';
import { Token } from 'src/app/contracts/token/token';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private jwtHelper: JwtHelperService, private userService: UserService) { }

  identityCheck() {
    const token: string = localStorage.getItem("accessToken");

    //const decodeToken = this.jwtHelper.decodeToken(token);
    //const expirationDate: Date = this.jwtHelper.getTokenExpirationDate(token);
    let expired: boolean;
    try {
      expired = this.jwtHelper.isTokenExpired(token);
    } catch {
      expired = true;
    }
    _isAuthenticated = token != null && !expired;
  }

  get isAuthenticated(): boolean {
    return _isAuthenticated;
  }
}
export let _isAuthenticated: boolean;