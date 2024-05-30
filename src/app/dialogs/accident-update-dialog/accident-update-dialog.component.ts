import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AccidentService } from 'src/app/services/common/models/accident.service';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { Update_Accident } from 'src/app/contracts/accidents/update_accident';
import { BaseDialog } from '../base/base-dialog';

@Component({
  selector: 'app-accident-update-dialog',
  templateUrl: './accident-update-dialog.component.html',
  styleUrls: ['./accident-update-dialog.component.scss']
})
export class AccidentUpdateDialogComponent extends BaseDialog<AccidentUpdateDialogComponent>  {
  constructor(
    dialogRef: MatDialogRef<AccidentUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Update_Accident,
    private accidentService: AccidentService,
    private alertifyService: AlertifyService
  ) {super(dialogRef)}

  updateAccident(): void {
    const updateAccident: Update_Accident = {
      id: this.data. id,
      typeOfAccident: this.data.typeOfAccident,
      accidentDate: new Date(this.data.accidentDate),
      accidentHour: this.data.accidentHour,
      onTheJobDate: new Date(this.data.onTheJobDate),
      description: this.data.description
    };

    this.accidentService.updateAccident(updateAccident).then(
      () => {
        this.alertifyService.message('Kaza bilgileri başarıyla güncellendi.', {
          dismissOthers: true,
          messageType: MessageType.Success,
          position: Position.TopRight
        });
        this.dialogRef.close({ success: true });
      },
      (errorMessage: string) => {
        this.alertifyService.message('Kaza bilgileri güncelenirken bir sorun oluştu.', {
          dismissOthers: true,
          messageType: MessageType.Error,
          position: Position.TopRight
        });
        this.dialogRef.close({ success: false });
      }
    );
  }
}
