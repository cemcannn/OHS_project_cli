import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
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
import { OpenAiCodexService } from './services/common/open-ai-codex.service';

declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
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
    private openAiCodexService: OpenAiCodexService
  ) {
    authService.identityCheck();
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

  // Codex'ten yanıt almak için method ekliyoruz
  getCodexCompletion() {
    this.openAiCodexService.getCodexCompletion(this.prompt).subscribe(
      (response) => {
        this.completion = response.choices[0].text; // Dönen yanıtı alıp completion değişkenine kaydediyoruz
        this.toastrService.message('Codex yanıtı alındı.', 'Codex', {
          messageType: ToastrMessageType.Success,
          position: ToastrPosition.TopRight,
        });
      },
      (error) => {
        console.error('Codex Error:', error);
        this.toastrService.message('Codex yanıtı alınamadı.', 'Codex Hatası', {
          messageType: ToastrMessageType.Error,
          position: ToastrPosition.TopRight,
        });
      }
    );
  }
}
