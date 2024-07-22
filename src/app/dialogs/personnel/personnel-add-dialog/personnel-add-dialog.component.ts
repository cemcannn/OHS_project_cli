import { Component, Inject, OnInit } from '@angular/core';
import { BaseDialog } from '../../base/base-dialog';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PersonnelService } from 'src/app/services/common/models/personnel.service';
import { Create_Personnel } from 'src/app/contracts/personnels/create_personnel';
import { ShowUnitDialogComponent } from '../../definition/show-unit-dialog/show-unit-dialog.component';
import { List_Unit } from 'src/app/contracts/definitions/unit/list_unit';

@Component({
  selector: 'app-personnel-add-dialog',
  templateUrl: './personnel-add-dialog.component.html',
  styleUrls: ['./personnel-add-dialog.component.scss']
})
export class PersonnelAddDialogComponent extends BaseDialog<PersonnelAddDialogComponent> implements OnInit {
  unit: List_Unit; // Kaza türünü tutmak için

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
    unit: string,
    retireId: string,
    insuranceId: string,
    startDateOfWork: string
  ): void {
    // Convert necessary values to the expected types
    const startDateOfWorkValue: Date = new Date(startDateOfWork); // You may want to handle date formatting here


    const createPersonnel: Create_Personnel = {
      trIdNumber: trIdNumber,
      tkiId: tkiId,
      name: name,
      unit: unit,
      surname: surname,
      retiredId: retireId,
      insuranceId: insuranceId,
      startDateOfWork: startDateOfWorkValue
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
