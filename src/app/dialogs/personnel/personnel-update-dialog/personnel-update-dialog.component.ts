import { Component, Inject, OnInit } from '@angular/core';
import { BaseDialog } from '../../base/base-dialog';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Update_Personnel } from 'src/app/contracts/personnels/update_personnel';
import { PersonnelService } from 'src/app/services/common/models/personnel.service';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { List_Unit } from 'src/app/contracts/definitions/unit/list_unit';
import { ShowUnitDialogComponent } from '../../definition/show-unit-dialog/show-unit-dialog.component';

@Component({
  selector: 'app-personnel-update-dialog',
  templateUrl: './personnel-update-dialog.component.html',
  styleUrls: ['./personnel-update-dialog.component.scss']
})
export class PersonnelUpdateDialogComponent extends BaseDialog<PersonnelUpdateDialogComponent> implements OnInit {
  unit: List_Unit; // Kaza türünü tutmak için

  constructor(dialogRef: MatDialogRef<PersonnelUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Update_Personnel,
    private personnelService: PersonnelService,
    private alertifyService: AlertifyService,
    private dialog: MatDialog
  ) {super(dialogRef)}

  ngOnInit(): void {}

  updatePersonnel(): void {
    const updatePersonnel: Update_Personnel = {
      id: this.data.id,
      name: this.data.name,
      surname: this.data.surname,
      insuranceId: this.data.insuranceId,
      retiredId: this.data.retiredId,
      startDateOfWork: new Date(this.data.startDateOfWork),
      tkiId: this.data.tkiId,
      trIdNumber: this.data.trIdNumber,
      unit: this.data.unit
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

  openUnitPicker(): void {
    const dialogRef = this.dialog.open(ShowUnitDialogComponent, {
      width: '600px',
      data: { isPicker: true } // Picker modunda açmak için
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.unit = result; // Seçilen kaza türünü al
      }
    });
  }
}
