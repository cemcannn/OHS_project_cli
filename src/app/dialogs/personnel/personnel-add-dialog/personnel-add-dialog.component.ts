import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseDialog } from '../../base/base-dialog';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PersonnelService } from 'src/app/services/common/models/personnel.service';
import { Create_Personnel } from 'src/app/contracts/personnels/create_personnel';
import { ShowProfessionDialogComponent } from '../../definition/show-profession-dialog/show-profession-dialog.component';
import { List_Profession } from 'src/app/contracts/definitions/profession/list_profession';
import { ShowDirectorateDialogComponent } from '../../definition/show-directorate-dialog/show-directorate-dialog.component';
import { List_Directorate } from 'src/app/contracts/definitions/directorate/list_directorate';
import { tcIdValidator } from 'src/app/validators/custom-validators';
import { nameValidator, surnameValidator, tkiIdValidator, workingAgeValidator } from 'src/app/validators/personnel-validators';


@Component({
  selector: 'app-personnel-add-dialog',
  templateUrl: './personnel-add-dialog.component.html',
  styleUrls: ['./personnel-add-dialog.component.scss']
})
export class PersonnelAddDialogComponent extends BaseDialog<PersonnelAddDialogComponent> implements OnInit {
  personnelForm: FormGroup;
  profession: List_Profession;
  directorate: List_Directorate;

  constructor(
    dialogRef: MatDialogRef<PersonnelAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private personnelService: PersonnelService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) { 
    super(dialogRef);
    this.personnelForm = this.fb.group({
      trIdNumber: ['', [Validators.required, tcIdValidator()]],
      tkiId: ['', [tkiIdValidator()]],
      name: ['', [Validators.required, nameValidator()]],
      surname: ['', [Validators.required, surnameValidator()]],
      bornDate: ['', [Validators.required, workingAgeValidator()]],
      profession: ['', [Validators.required]],
      directorate: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {}

  createPersonnel(): void {
    if (this.personnelForm.invalid) {
      Object.keys(this.personnelForm.controls).forEach(key => {
        this.personnelForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.personnelForm.value;
    const bornDateValue: Date = new Date(formValue.bornDate);
    bornDateValue.setMinutes(bornDateValue.getMinutes() - bornDateValue.getTimezoneOffset());

    const createPersonnel: Create_Personnel = {
      trIdNumber: formValue.trIdNumber,
      tkiId: formValue.tkiId,
      name: formValue.name,
      surname: formValue.surname,
      profession: this.profession ? this.profession.name : formValue.profession,
      directorate: this.directorate ? this.directorate.name : formValue.directorate,
      bornDate: bornDateValue
    };

    this.personnelService.createPersonnel(
      createPersonnel,
      () => {
        this.dialogRef.close({ success: true });
      },
      (errorMessage: string) => {
        this.dialogRef.close({ success: false, error: errorMessage });
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
        this.profession = result;
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
        this.directorate = result;
        this.personnelForm.patchValue({ directorate: result.name });
      }
    });
  }
}
