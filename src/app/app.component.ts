import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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

declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  @ViewChild(DynamicLoadComponentDirective, { static: true })
  dynamicLoadComponentDirective: DynamicLoadComponentDirective;

  // Codex prompt ve sonucu için gerekli değişkenler
  prompt: string = '';
  completion: any;

  constructor(
    public authService: AuthService,
    private toastrService: CustomToastrService,
    private router: Router,
    private dynamicLoadComponentService: DynamicLoadComponentService,
    private signalRService: SignalRService,
  ) {
    authService.identityCheck();
  }

  ngOnInit(): void {
    // Global SignalR dinleme (uygulama açık olduğu sürece)
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

  signOut() {
    localStorage.removeItem('accessToken');
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
