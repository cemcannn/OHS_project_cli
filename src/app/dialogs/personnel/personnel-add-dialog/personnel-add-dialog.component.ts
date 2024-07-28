import { Component, Inject, OnInit } from '@angular/core';
import { BaseDialog } from '../../base/base-dialog';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PersonnelService } from 'src/app/services/common/models/personnel.service';
import { Create_Personnel } from 'src/app/contracts/personnels/create_personnel';
import { ShowProfessionDialogComponent } from '../../definition/show-profession-dialog/show-profession-dialog.component';
import { List_Profession } from 'src/app/contracts/definitions/profession/list_profession';
import { ShowDirectorateDialogComponent } from '../../definition/show-directorate-dialog/show-directorate-dialog.component';
import { List_Directorate } from 'src/app/contracts/definitions/directorate/list_directorate';


@Component({
  selector: 'app-personnel-add-dialog',
  templateUrl: './personnel-add-dialog.component.html',
  styleUrls: ['./personnel-add-dialog.component.scss']
})
export class PersonnelAddDialogComponent extends BaseDialog<PersonnelAddDialogComponent> implements OnInit {
  profession: List_Profession; // Kaza türünü tutmak için
  directorate: List_Directorate;

  constructor(
    dialogRef: MatDialogRef<PersonnelAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private personnelService: PersonnelService,
    private dialog: MatDialog
  ) { super(dialogRef) }

  ngOnInit(): void {}

  createPersonnel(
    trIdNumber: string,
    tkiId: string,
    name: string,
    surname: string,
    profession: string,
    directorate: string,
    bornDate: string
  ): void {
  // Convert necessary values to the expected types
  const bornDateValue: Date = new Date(bornDate);
  
  // Tarihi UTC olarak ayarlayın
  bornDateValue.setMinutes(bornDateValue.getMinutes() - bornDateValue.getTimezoneOffset());

    const createPersonnel: Create_Personnel = {
      trIdNumber: trIdNumber,
      tkiId: tkiId,
      name: name,
      surname: surname,
      profession: profession,
      directorate: directorate,
      bornDate: bornDateValue
    };

    this.personnelService.createPersonnel(
      createPersonnel,
      () => {
        this.dialogRef.close({ success: true });
      },
      (errorMessage: string) => {
        console.error(errorMessage);

        this.dialogRef.close({ success: false, error: errorMessage });
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
