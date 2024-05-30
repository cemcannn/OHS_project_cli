import { Component, Inject } from '@angular/core';
import { BaseDialog } from '../base/base-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PersonnelService } from 'src/app/services/common/models/personnel.service';
import { Create_Personnel } from 'src/app/contracts/personnels/create_personnel';

@Component({
  selector: 'app-personnel-add-dialog',
  templateUrl: './personnel-add-dialog.component.html',
  styleUrls: ['./personnel-add-dialog.component.scss']
})
export class PersonnelAddDialogComponent extends BaseDialog<PersonnelAddDialogComponent> { 
  constructor(
    dialogRef: MatDialogRef<PersonnelAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private personnelService: PersonnelService
  ) {super(dialogRef)}

  createPersonnel(
    trIdNumber: string,
    name: string,
    surname: string,
    retireId: string,
    insuranceId: string,
    startDateOfWork: string,
    tkiId: string
  ): void {
    // Convert necessary values to the expected types
    const retireIdValue: number = Number(retireId); // If retireId is supposed to be a string, no need to convert
    const insuranceIdValue: number = Number(insuranceId); // If insuranceId is supposed to be a string, no need to convert
    const startDateOfWorkValue: Date = new Date(startDateOfWork); // You may want to handle date formatting here
    const tkiIdValue: number = Number(tkiId); // If tkiId is supposed to be a string, no need to convert
  
    const createPersonnel: Create_Personnel = {
      trIdNumber: trIdNumber,
      name: name,
      surname: surname,
      retiredId: retireIdValue,
      insuranceId: insuranceIdValue,
      startDateOfWork: startDateOfWorkValue,
      tkiId: tkiIdValue
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
}
