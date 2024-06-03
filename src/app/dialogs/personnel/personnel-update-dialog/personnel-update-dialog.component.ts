import { Component, Inject } from '@angular/core';
import { BaseDialog } from '../../base/base-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Update_Personnel } from 'src/app/contracts/personnels/update_personnel';
import { PersonnelService } from 'src/app/services/common/models/personnel.service';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';

@Component({
  selector: 'app-personnel-update-dialog',
  templateUrl: './personnel-update-dialog.component.html',
  styleUrls: ['./personnel-update-dialog.component.scss']
})
export class PersonnelUpdateDialogComponent extends BaseDialog<PersonnelUpdateDialogComponent> {
  constructor(dialogRef: MatDialogRef<PersonnelUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Update_Personnel,
    private personnelService: PersonnelService,
    private alertifyService: AlertifyService
  ) {super(dialogRef)}

  updatePersonnel(): void {
    const updatePersonnel: Update_Personnel = {
      id: this.data.id,
      name: this.data.name,
      surname: this.data.surname,
      insuranceId: this.data.insuranceId,
      retiredId: this.data.retiredId,
      startDateOfWork: new Date(this.data.startDateOfWork),
      tkiId: this.data.tkiId,
      trIdNumber: this.data.trIdNumber
    };

    this.personnelService.updatePersonnel(updatePersonnel).then(
      () => {
        this.alertifyService.message('Personel bilgileri başarıyla güncellendi.', {
          dismissOthers: true,
          messageType: MessageType.Success,
          position: Position.TopRight
        });
        this.dialogRef.close({ success: true });
      },
      (errorMessage: string) => {
        this.alertifyService.message('Personel bilgileri güncelenirken bir sorun oluştu.', {
          dismissOthers: true,
          messageType: MessageType.Error,
          position: Position.TopRight
        });
        this.dialogRef.close({ success: false });
      }
    );
  }
}
