import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter } from '@angular/core';
import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  Output,
  Renderer2,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from '../../base/base.component';
import {
  DeleteDialogComponent,
  DeleteState,
} from '../../dialogs/delete-dialog/delete-dialog.component';
import {
  AlertifyService,
  MessageType,
  Position,
} from '../../services/admin/alertify.service';
import { DialogService } from '../../services/common/dialog.service';
import { HttpClientService } from '../../services/common/http-client.service';

declare var $: any;

@Directive({
  selector: '[appDelete]',
})
export class DeleteDirective {
  constructor(
    private element: ElementRef,
    private _renderer: Renderer2,
    private httpClientService: HttpClientService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog,
    private alertifyService: AlertifyService,
    private dialogService: DialogService
  ) {
    const img = _renderer.createElement('img');
    img.setAttribute('src', '../../../../../assets/icons/delete.png');
    img.setAttribute('style', 'cursor: pointer;');
    img.width = 25;
    img.height = 25;
    _renderer.appendChild(element.nativeElement, img);
  }

  @Input() id: string;
  @Input() controller: string;
  @Output() callback: EventEmitter<any> = new EventEmitter();

  @HostListener('click')
  async onclick() {
    this.dialogService.openDialog({
      componentType: DeleteDialogComponent,
      data: DeleteState.Yes,
      afterClosed: async () => {
        this.spinner.show(SpinnerType.BallAtom);
        const td: HTMLTableCellElement = this.element.nativeElement;
        this.httpClientService
          .delete(
            {
              controller: this.controller,
            },
            this.id
          )
          .subscribe(
            (data) => {
              $(td.parentElement).animate(
                {
                  opacity: 0,
                  left: '+=50',
                  height: 'toogle',
                },
                700,
                () => {
                  this.callback.emit();
                  if (this.controller == 'roles')
                    this.alertifyService.message(
                      'Rol bilgisi başarıyla silinmiştir.',
                      {
                        dismissOthers: true,
                        messageType: MessageType.Success,
                        position: Position.TopRight,
                      }
                    );
                  else if (this.controller == 'personnels')
                    this.alertifyService.message(
                      'Personel bilgileri başarıyla silinmiştir.',
                      {
                        dismissOthers: true,
                        messageType: MessageType.Success,
                        position: Position.TopRight,
                      }
                    );
                  else if (this.controller == 'typeOfAccidents')
                    this.alertifyService.message(
                      'Kaza türü bilgileri başarıyla silinmiştir.',
                      {
                        dismissOthers: true,
                        messageType: MessageType.Success,
                        position: Position.TopRight,
                      }
                    );
                  else if (this.controller == 'directorates')
                    this.alertifyService.message(
                      'İşletme bilgileri başarıyla silinmiştir.',
                      {
                        dismissOthers: true,
                        messageType: MessageType.Success,
                        position: Position.TopRight,
                      }
                    );
                  else if (this.controller == 'limbs')
                    this.alertifyService.message(
                      'Uzuv bilgileri başarıyla silinmiştir.',
                      {
                        dismissOthers: true,
                        messageType: MessageType.Success,
                        position: Position.TopRight,
                      }
                    );
                  else if (this.controller == 'accidentAreas')
                    this.alertifyService.message(
                      'Kaza yeri bilgileri başarıyla silinmiştir.',
                      {
                        dismissOthers: true,
                        messageType: MessageType.Success,
                        position: Position.TopRight,
                      }
                    );
                  else if (this.controller == 'accidentStatistics')
                    this.alertifyService.message(
                      'Kaza istatistik bilgileri başarıyla silinmiştir.',
                      {
                        dismissOthers: true,
                        messageType: MessageType.Success,
                        position: Position.TopRight,
                      }
                    );
                  else this.controller == 'accidents';
                  this.alertifyService.message(
                    'Kaza bilgileri başarıyla silinmiştir.',
                    {
                      dismissOthers: true,
                      messageType: MessageType.Success,
                      position: Position.TopRight,
                    }
                  );
                }
              );
            },
            (errorResponse: HttpErrorResponse) => {
              this.spinner.hide(SpinnerType.BallAtom);
              if (this.controller == 'roles')
                this.alertifyService.message(
                  'Rol bilgisi silinirken beklenmeyen bir hatayla karşılaşılmıştır.',
                  {
                    dismissOthers: true,
                    messageType: MessageType.Error,
                    position: Position.TopRight,
                  }
                );
              else if (this.controller == 'personnels')
                this.alertifyService.message(
                  'Personel bilgileri silinirken beklenmeyen bir hatayla karşılaşılmıştır.',
                  {
                    dismissOthers: true,
                    messageType: MessageType.Success,
                    position: Position.TopRight,
                  }
                );
              else if (this.controller == 'typeOfAccidents')
                this.alertifyService.message(
                  'Kaza türü bilgileri silinirken beklenmeyen bir hatayla karşılaşılmıştır.',
                  {
                    dismissOthers: true,
                    messageType: MessageType.Success,
                    position: Position.TopRight,
                  }
                );
              else if (this.controller == 'directorates')
                this.alertifyService.message(
                  'İşletme bilgileri silinirken beklenmeyen bir hatayla karşılaşılmıştır.',
                  {
                    dismissOthers: true,
                    messageType: MessageType.Success,
                    position: Position.TopRight,
                  }
                );
              else if (this.controller == 'limbs')
                this.alertifyService.message(
                  'Uzuv bilgileri silinirken beklenmeyen bir hatayla karşılaşılmıştır.',
                  {
                    dismissOthers: true,
                    messageType: MessageType.Success,
                    position: Position.TopRight,
                  }
                );
              else if (this.controller == 'accidentAreas')
                this.alertifyService.message(
                  'Kaza yeri bilgileri silinirken beklenmeyen bir hatayla karşılaşılmıştır.',
                  {
                    dismissOthers: true,
                    messageType: MessageType.Success,
                    position: Position.TopRight,
                  }
                );
              else if (this.controller == 'accidentStatistics')
                this.alertifyService.message(
                  'Kaza istatistik bilgileri silinirken beklenmeyen bir hatayla karşılaşılmıştır.',
                  {
                    dismissOthers: true,
                    messageType: MessageType.Success,
                    position: Position.TopRight,
                  }
                );
              else this.controller == 'accidents';
              this.alertifyService.message(
                'Kaza bilgileri silinirken beklenmeyen bir hatayla karşılaşılmıştır.',
                {
                  dismissOthers: true,
                  messageType: MessageType.Success,
                  position: Position.TopRight,
                }
              );
            }
          );
      },
    });
  }
}
