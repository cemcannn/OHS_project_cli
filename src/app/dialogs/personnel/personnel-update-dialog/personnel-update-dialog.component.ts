import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseDialog } from '../../base/base-dialog';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Update_Personnel } from 'src/app/contracts/personnels/update_personnel';
import { PersonnelService } from 'src/app/services/common/models/personnel.service';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { List_Profession } from 'src/app/contracts/definitions/profession/list_profession';
import { ShowProfessionDialogComponent } from '../../definition/show-profession-dialog/show-profession-dialog.component';
import { ShowDirectorateDialogComponent } from '../../definition/show-directorate-dialog/show-directorate-dialog.component';
import { List_Directorate } from 'src/app/contracts/definitions/directorate/list_directorate';
import { tcIdValidator } from 'src/app/validators/custom-validators';
import { nameValidator, surnameValidator, tkiIdValidator, workingAgeValidator } from 'src/app/validators/personnel-validators';


@Component({
  selector: 'app-personnel-update-dialog',
  templateUrl: './personnel-update-dialog.component.html',
  styleUrls: ['./personnel-update-dialog.component.scss']
})
export class PersonnelUpdateDialogComponent extends BaseDialog<PersonnelUpdateDialogComponent> implements OnInit {
  personnelForm: FormGroup;
  profession: string;
  directorate: string;
  

  constructor(
    dialogRef: MatDialogRef<PersonnelUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Update_Personnel,
    private personnelService: PersonnelService,
    private alertifyService: AlertifyService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    super(dialogRef);
    this.personnelForm = this.fb.group({
      trIdNumber: [data.trIdNumber, [tcIdValidator()]],
      tkiId: [data.tkiId, [tkiIdValidator()]],
      name: [data.name, [nameValidator()]],
      surname: [data.surname, [surnameValidator()]],
      bornDate: [data.bornDate, [workingAgeValidator()]],
      profession: [data.profession],
      directorate: [data.directorate]
    });
  }

  ngOnInit(): void { }

  updatePersonnel(): void {
    if (this.personnelForm.invalid) {
      Object.keys(this.personnelForm.controls).forEach(key => {
        this.personnelForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.personnelForm.value;
    const updatePersonnel: Update_Personnel = {
      id: this.data.id,
      trIdNumber: formValue.trIdNumber,
      tkiId: formValue.tkiId,
      name: formValue.name,
      surname: formValue.surname,
      profession: this.profession || formValue.profession,
      directorate: this.directorate || (this.data as any).directorateCode || formValue.directorate,
      bornDate: new Date(formValue.bornDate)
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
      data: { isPicker: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.profession = result.name;
        this.personnelForm.patchValue({ profession: result.name });
      }
    });
  }
  
  openDirectoratePicker(): void {
    const dialogRef = this.dialog.open(ShowDirectorateDialogComponent, {
      width: '600px',
      data: { isPicker: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.directorate = result.code || result.name;
        this.personnelForm.patchValue({ directorate: result.code || result.name });
      }
    });
  }
}
