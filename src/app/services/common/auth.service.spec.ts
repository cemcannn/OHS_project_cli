import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let jwtHelperSpy: jasmine.SpyObj<JwtHelperService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const jwtSpy = jasmine.createSpyObj('JwtHelperService', ['decodeToken', 'isTokenExpired']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: JwtHelperService, useValue: jwtSpy },
        { provide: Router, useValue: routerSpyObj }
      ]
    });

    service = TestBed.inject(AuthService);
    jwtHelperSpy = TestBed.inject(JwtHelperService) as jasmine.SpyObj<JwtHelperService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('identityCheck', () => {
    it('should return true when token exists and is not expired', () => {
      const mockToken = 'valid.jwt.token';
      localStorage.setItem('accessToken', mockToken);
      jwtHelperSpy.isTokenExpired.and.returnValue(false);

      const result = service.identityCheck();

      expect(result).toBeTrue();
      expect(jwtHelperSpy.isTokenExpired).toHaveBeenCalledWith(mockToken);
    });

    it('should return false when token does not exist', () => {
      const result = service.identityCheck();

      expect(result).toBeFalse();
    });

    it('should return false when token is expired', () => {
      const mockToken = 'expired.jwt.token';
      localStorage.setItem('accessToken', mockToken);
      jwtHelperSpy.isTokenExpired.and.returnValue(true);

      const result = service.identityCheck();

      expect(result).toBeFalse();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if identity check passes', () => {
      spyOn(service, 'identityCheck').and.returnValue(true);

      expect(service.isAuthenticated).toBeTrue();
    });

    it('should return false if identity check fails', () => {
      spyOn(service, 'identityCheck').and.returnValue(false);

      expect(service.isAuthenticated).toBeFalse();
    });
  });

  describe('getUserRoles', () => {
    it('should return user roles from decoded token', () => {
      const mockToken = 'valid.jwt.token';
      const mockRoles = ['Admin', 'User'];
      const mockDecodedToken = {
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': mockRoles
      };

      localStorage.setItem('accessToken', mockToken);
      jwtHelperSpy.decodeToken.and.returnValue(mockDecodedToken);

      const roles = service.getUserRoles();

      expect(roles).toEqual(mockRoles);
      expect(jwtHelperSpy.decodeToken).toHaveBeenCalledWith(mockToken);
    });

    it('should return empty array when no token exists', () => {
      const roles = service.getUserRoles();

      expect(roles).toEqual([]);
    });

    it('should return empty array when token has no roles', () => {
      const mockToken = 'valid.jwt.token';
      const mockDecodedToken = {};

      localStorage.setItem('accessToken', mockToken);
      jwtHelperSpy.decodeToken.and.returnValue(mockDecodedToken);

      const roles = service.getUserRoles();

      expect(roles).toEqual([]);
    });
  });
});
