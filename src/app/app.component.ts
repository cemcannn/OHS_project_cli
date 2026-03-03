import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/common/auth.service';
import {
  CustomToastrService,
  ToastrMessageType,
  ToastrPosition,
} from './services/ui/custom-toastr.service';
import {
  ComponentType,
  DynamicLoadComponentService,
} from './services/common/dynamic-load-component.service';
import { DynamicLoadComponentDirective } from './directives/common/dynamic-load-component.directive';
import { SignalRService } from './services/common/signalr.service';
import { HubUrls } from './constants/hub-urls';
import { ReceiveFunctions } from './constants/receive-functions';
import { UserService } from './services/common/models/user.service';

declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild(DynamicLoadComponentDirective, { static: true })
  dynamicLoadComponentDirective: DynamicLoadComponentDirective;

  prompt: string = '';
  completion: any;
  profilePhoto: string | null = null;
  userName: string | null = null;

  constructor(
    public authService: AuthService,
    private toastrService: CustomToastrService,
    private router: Router,
    private dynamicLoadComponentService: DynamicLoadComponentService,
    private signalRService: SignalRService,
    private userService: UserService,
  ) {
    authService.identityCheck();
  }

  async ngOnInit(): Promise<void> {
    // Rota değişimlerini dinle — giriş sonrası fotoğrafı yükle
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.authService.isAuthenticated) {
        this.loadProfilePhoto();
      } else {
        this.profilePhoto = null;
        this.userName = null;
      }
    });

    await this.loadProfilePhoto();

    // Profil fotoğrafı güncellenince anında yansıt
    this.userService.profilePhotoUpdated$.subscribe(photo => {
      this.profilePhoto = photo;
    });

    this.signalRService
      .on(HubUrls.AccidentHub, ReceiveFunctions.AccidentAddedMessageReceiveFunction, (message: any) => {
        this.toastrService.message(message, 'Yeni Kaza', {
          messageType: ToastrMessageType.Info,
          position: ToastrPosition.TopRight,
        });
      })
      .catch(err => console.error('SignalR accidents-hub error', err));

    this.signalRService
      .on(HubUrls.PersonnelHub, ReceiveFunctions.PersonnelAddedMessageReceiveFunction, (message: any) => {
        this.toastrService.message(message, 'Yeni Personel', {
          messageType: ToastrMessageType.Info,
          position: ToastrPosition.TopRight,
        });
      })
      .catch(err => console.error('SignalR personnels-hub error', err));
  }

  private _lastUserId: string | null = null;

  async loadProfilePhoto() {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
      if (!userId) return;
      if (userId === this._lastUserId && this.userName) return; // zaten yüklendi
      this._lastUserId = userId;
      const user = await this.userService.getUserById(userId);
      this.profilePhoto = user?.profilePhoto || null;
      this.userName = user?.name || null;
    } catch {}
  }

  signOut() {
    localStorage.removeItem('accessToken');
    this.profilePhoto = null;
    this.userName = null;
    this._lastUserId = null;
    this.authService.identityCheck();
    this.router.navigate(['/login']);
    this.toastrService.message('Oturum kapatılmıştır!', 'Oturum Kapatıldı', {
      messageType: ToastrMessageType.Warning,
      position: ToastrPosition.TopRight,
    });
  }

  loadComponent() {
    this.dynamicLoadComponentService.loadComponent(
      ComponentType.DefinitionComponent,
      this.dynamicLoadComponentDirective.viewContainerRef
    );
  }
}
