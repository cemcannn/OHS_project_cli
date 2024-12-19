import { Component, Inject, OnInit } from '@angular/core';
import { BaseDialog } from '../../base/base-dialog';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Update_Personnel } from 'src/app/contracts/personnels/update_personnel';
import { PersonnelService } from 'src/app/services/common/models/personnel.service';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { List_Profession } from 'src/app/contracts/definitions/profession/list_profession';
import { ShowProfessionDialogComponent } from '../../definition/show-profession-dialog/show-profession-dialog.component';
import { ShowDirectorateDialogComponent } from '../../definition/show-directorate-dialog/show-directorate-dialog.component';
import { List_Directorate } from 'src/app/contracts/definitions/directorate/list_directorate';


@Component({
  selector: 'app-personnel-update-dialog',
  templateUrl: './personnel-update-dialog.component.html',
  styleUrls: ['./personnel-update-dialog.component.scss']
})
export class PersonnelUpdateDialogComponent extends BaseDialog<PersonnelUpdateDialogComponent> implements OnInit {
  profession: List_Profession; // Kaza türünü tutmak için
  directorate: List_Directorate;
  

  constructor(dialogRef: MatDialogRef<PersonnelUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Update_Personnel,
    private personnelService: PersonnelService,
    private alertifyService: AlertifyService,
    private dialog: MatDialog
  ) {super(dialogRef)}

  ngOnInit(): void { }

  updatePersonnel(): void {
    const updatePersonnel: Update_Personnel = {
      id: this.data.id,
      trIdNumber: this.data.trIdNumber,
      tkiId: this.data.tkiId,
      name: this.data.name,
      surname: this.data.surname,
      profession: this.profession.name, // Seçilen yeni profession veya mevcut profession
      directorate: this.directorate.name, // Seçilen yeni directorate veya mevcut directorate
      bornDate: new Date(this.data.bornDate)
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
  
  openDirectoratePicker(): void {
    const dialogRef = this.dialog.open(ShowDirectorateDialogComponent, {
      width: '600px',
      data: { isPicker: true } // Picker modunda açmak için
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.directorate = result; // Seçilen kaza türünü al
      }
    });
  }
}
