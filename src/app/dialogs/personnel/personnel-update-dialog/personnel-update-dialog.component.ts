import { Component, Inject, OnInit } from '@angular/core';
import { BaseDialog } from '../../base/base-dialog';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Update_Personnel } from 'src/app/contracts/personnels/update_personnel';
import { PersonnelService } from 'src/app/services/common/models/personnel.service';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { List_Profession } from 'src/app/contracts/definitions/profession/list_profession';
import { ShowProfessionDialogComponent } from '../../definition/show-profession-dialog/show-profession-dialog.component';


@Component({
  selector: 'app-personnel-update-dialog',
  templateUrl: './personnel-update-dialog.component.html',
  styleUrls: ['./personnel-update-dialog.component.scss']
})
export class PersonnelUpdateDialogComponent extends BaseDialog<PersonnelUpdateDialogComponent> implements OnInit {
  profession: List_Profession; // Kaza türünü tutmak için

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
      bornDate: new Date(this.data.bornDate),
      tkiId: this.data.tkiId,
      trIdNumber: this.data.trIdNumber,
      profession: this.data.profession
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

  openProfessionPicker(): void {
    const dialogRef = this.dialog.open(ShowProfessionDialogComponent, {
      width: '600px',
      data: { isPicker: true } // Picker modunda açmak için
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.profession = result; // Seçilen kaza türünü al
      }
    });
  }
}
