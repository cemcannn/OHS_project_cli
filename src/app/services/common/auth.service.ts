import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private checkTokenInterval: any;
  private _roles: string[] = [];

  constructor(private jwtHelper: JwtHelperService, private router: Router, private dialog: MatDialog) {
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
    this._roles = [];

    try {
      expired = this.jwtHelper.isTokenExpired(token);

      if (token && !expired) {
        const decodedToken = this.jwtHelper.decodeToken(token);
        const roleClaim =
          decodedToken?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ??
          decodedToken?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'] ??
          decodedToken?.['role'] ??
          decodedToken?.['roles'];

        if (Array.isArray(roleClaim)) {
          this._roles = roleClaim;
        } else if (typeof roleClaim === 'string') {
          this._roles = [roleClaim];
        }
      }
    } catch {
      expired = true;
      this._roles = [];
    }

    _isAuthenticated = token != null && !expired;
  }

  signOut() {
    this.dialog.closeAll();
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    _isAuthenticated = false;
    this._roles = [];
    this.router.navigate(['/login']);
  }

  get isAuthenticated(): boolean {
    return _isAuthenticated;
  }

  get roles(): string[] {
    return this._roles;
  }

  hasRole(role: string): boolean {
    return this._roles.some(r => r.toLowerCase() === role.toLowerCase());
  }

  get isSuperAdmin(): boolean {
    return this.hasRole('SuperAdmin');
  }

  get isAdmin(): boolean {
    return this.hasRole('Admin');
  }

  get isObserver(): boolean {
    return this.hasRole('Observer');
  }

  get canAccessAdminPanel(): boolean {
    return this.isAuthenticated && this.isSuperAdmin;
  }

  get canModifyData(): boolean {
    return this.isSuperAdmin || this.isAdmin;
  }
}

export let _isAuthenticated: boolean;