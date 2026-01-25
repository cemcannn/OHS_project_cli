import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { AccidentService } from 'src/app/services/common/models/accident.service';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { Create_Accident } from 'src/app/contracts/accidents/create_accident';
import { List_Type_Of_Accident } from 'src/app/contracts/definitions/type_of_accident/list_type_of_accident';
import { BaseDialog } from '../../base/base-dialog';
import { ShowTypeOfAccidentDialogComponent } from '../../definition/show-type-of-accident-dialog/show-type-of-accident-dialog.component';
import { ShowLimbDialogComponent } from '../../definition/show-limb-dialog/show-limb-dialog.component';
import { List_Limb } from 'src/app/contracts/definitions/limb/list_limb';
import { ShowAccidentAreaDialogComponent } from '../../definition/show-accident-area-dialog/show-accident-area-dialog.component';
import { List_Accident_Area } from 'src/app/contracts/definitions/accident_area/list_accident_area';
import { timeFormatValidator } from 'src/app/validators/custom-validators';
import { lostWorkDaysValidator, accidentDescriptionValidator, accidentDateRangeValidator, accidentTimeNotInFutureValidator } from 'src/app/validators/accident-validators';

@Component({
  selector: 'app-accident-add',
  templateUrl: './accident-add.component.html',
  styleUrls: ['./accident-add.component.scss']
})
export class AccidentAddComponent extends BaseDialog<AccidentAddComponent> implements OnInit {
  accidentForm: FormGroup;
  typeOfAccident: List_Type_Of_Accident;
  limb: List_Limb;
  accidentArea: List_Accident_Area;

  constructor(
    dialogRef: MatDialogRef<AccidentAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private accidentService: AccidentService,
    private alertifyService: AlertifyService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    super(dialogRef);
    this.accidentForm = this.fb.group({
      typeOfAccident: ['', [Validators.required]],
      limb: ['', [Validators.required]],
      accidentArea: [''],
      accidentDate: ['', [Validators.required, accidentDateRangeValidator()]],
      accidentHour: ['', [timeFormatValidator(), accidentTimeNotInFutureValidator('accidentDate')]],
      lostDayOfWork: ['', [lostWorkDaysValidator()]],
      description: ['', [accidentDescriptionValidator()]]
    });
  }

  ngOnInit(): void {}

  openTypeOfAccidentPicker(): void {
    const dialogRef = this.dialog.open(ShowTypeOfAccidentDialogComponent, {
      width: '600px',
      data: { isPicker: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.typeOfAccident = result;
        this.accidentForm.patchValue({ typeOfAccident: result.id });
      }
    });
  }

  openLimbPicker(): void {
    const dialogRef = this.dialog.open(ShowLimbDialogComponent, {
      width: '600px',
      data: { isPicker: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.limb = result;
        this.accidentForm.patchValue({ limb: result.id });
      }
    });
  }

  openAccidentAreaPicker(): void {
    const dialogRef = this.dialog.open(ShowAccidentAreaDialogComponent, {
      width: '600px',
      data: { isPicker: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.accidentArea = result;
        this.accidentForm.patchValue({ accidentArea: result.id });
      }
    });
  }

  createAccident(): void {
    if (this.accidentForm.invalid) {
      Object.keys(this.accidentForm.controls).forEach(key => {
        this.accidentForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.accidentForm.value;
    const accidentDateValue: Date = new Date(formValue.accidentDate);
    accidentDateValue.setMinutes(accidentDateValue.getMinutes() - accidentDateValue.getTimezoneOffset());

    const createAccident: Create_Accident = {
      personnelId: this.data.personnelId,
      typeOfAccident: this.typeOfAccident ? this.typeOfAccident.name : formValue.typeOfAccident,
      limb: this.limb ? this.limb.name : formValue.limb,
      accidentArea: this.accidentArea ? this.accidentArea.name : formValue.accidentArea,
      accidentDate: accidentDateValue,
      accidentHour: formValue.accidentHour,
      lostDayOfWork: formValue.lostDayOfWork,
      description: formValue.description
    };

    this.accidentService.createAccident(
      createAccident,
      () => {
        this.dialogRef.close({ success: true });
      },
      (errorMessage: string) => {
        this.alertifyService.message(errorMessage, {
          dismissOthers: true,
          messageType: MessageType.Error,
          position: Position.TopRight
        });
        this.dialogRef.close({ success: false, error: errorMessage });
      }
    );
  }  
}
