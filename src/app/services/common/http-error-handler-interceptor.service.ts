import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { catchError, Observable, of, throwError } from 'rxjs';
import { CustomToastrService, ToastrMessageType, ToastrPosition } from '../ui/custom-toastr.service';
import { UserAuthService } from './models/user-auth.service';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorHandlerInterceptorService implements HttpInterceptor {

  constructor(
    private toastrService: CustomToastrService,
    private userAuthService: UserAuthService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.spinner.show(); // Spinner'ı her istek öncesi gösteriyoruz

    return next.handle(req).pipe(
      catchError(error => {
        this.spinner.hide(); // Spinner'ı her hata durumunda gizliyoruz

        switch (error.status) {
          case HttpStatusCode.Unauthorized:
            return this.handleUnauthorizedError();
          case HttpStatusCode.InternalServerError:
            this.showToastr("Sunucuya erişilmiyor!", "Sunucu hatası!");
            break;
          case HttpStatusCode.BadRequest:
            this.showToastr("Geçersiz istek yapıldı!", "Geçersiz istek!");
            break;
          case HttpStatusCode.NotFound:
            this.showToastr("Sayfa bulunamadı!", "Sayfa bulunamadı!");
            break;
          default:
            this.showToastr("Beklenmeyen bir hata meydana gelmiştir!", "Hata!");
            break;
        }

        return throwError(() => error); // Hatanın orijinal formunu döndürüyoruz
      })
    );
  }

  private handleUnauthorizedError(): Observable<HttpEvent<any>> {
    this.userAuthService.refreshTokenLogin(localStorage.getItem("refreshToken"), (state) => {
      if (!state) {
        const url = this.router.url;
        if (url == "/products")
          this.showToastr("Sepete ürün eklemek için oturum açmanız gerekiyor.", "Oturum açınız!", ToastrPosition.TopRight);
        else
          this.showToastr("Bu işlemi yapmaya yetkiniz bulunmamaktadır!", "Yetkisiz işlem!");
      }
    }).then(() => {
      this.showToastr("Bu işlemi yapmaya yetkiniz bulunmamaktadır!", "Yetkisiz işlem!");
    });

    return of(); // Boş bir observable döndürüyoruz
  }

  private showToastr(message: string, title: string, position: ToastrPosition = ToastrPosition.BottomFullWidth) {
    this.toastrService.message(message, title, {
      messageType: ToastrMessageType.Warning,
      position
    });
  }
}
