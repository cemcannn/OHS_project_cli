import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private checkTokenInterval: any;

  constructor(private jwtHelper: JwtHelperService, private router: Router) {
    this.startTokenExpirationCheck();
  }

  startTokenExpirationCheck() {
    this.checkTokenInterval = setInterval(() => {
      const token = localStorage.getItem('accessToken');
      if (token && this.jwtHelper.isTokenExpired(token)) {
        this.signOut();
      }
    }, 1000); // 1 saniyede bir kontrol edilir
  }

  identityCheck() {
    const token: string = localStorage.getItem("accessToken");
    let expired: boolean;
    try {
      expired = this.jwtHelper.isTokenExpired(token);
    } catch {
      expired = true;
    }
    _isAuthenticated = token != null && !expired;
  }

  signOut() {
    localStorage.removeItem("accessToken");
    _isAuthenticated = false;
    this.router.navigate(['/login']);
  }

  get isAuthenticated(): boolean {
    return _isAuthenticated;
  }
}

export let _isAuthenticated: boolean;