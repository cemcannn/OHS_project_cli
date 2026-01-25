import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { AccidentService } from 'src/app/services/common/models/accident.service';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { Update_Accident } from 'src/app/contracts/accidents/update_accident';
import { BaseDialog } from '../../base/base-dialog';
import { List_Type_Of_Accident } from 'src/app/contracts/definitions/type_of_accident/list_type_of_accident';
import { List_Limb } from 'src/app/contracts/definitions/limb/list_limb';
import { ShowTypeOfAccidentDialogComponent } from '../../definition/show-type-of-accident-dialog/show-type-of-accident-dialog.component';
import { ShowLimbDialogComponent } from '../../definition/show-limb-dialog/show-limb-dialog.component';
import { List_Accident_Area } from 'src/app/contracts/definitions/accident_area/list_accident_area';
import { ShowAccidentAreaDialogComponent } from '../../definition/show-accident-area-dialog/show-accident-area-dialog.component';
import { accidentDateRangeValidator, lostWorkDaysValidator, accidentDescriptionValidator, accidentTimeNotInFutureValidator } from 'src/app/validators/accident-validators';
import { timeFormatValidator } from 'src/app/validators/custom-validators';

@Component({
  selector: 'app-accident-update-dialog',
  templateUrl: './accident-update-dialog.component.html',
  styleUrls: ['./accident-update-dialog.component.scss']
})
export class AccidentUpdateDialogComponent extends BaseDialog<AccidentUpdateDialogComponent>  {
  typeOfAccident: string; // Kaza türünü tutmak için
  limb: string;
  accidentArea: string;
  accidentForm: FormGroup;

  constructor(
    dialogRef: MatDialogRef<AccidentUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Update_Accident,
    private accidentService: AccidentService,
    private alertifyService: AlertifyService,
    private dialog: MatDialog,
    private fb: FormBuilder
  ) {
    super(dialogRef);
    this.accidentForm = this.fb.group({
      typeOfAccident: [data.typeOfAccident, [Validators.required]],
      limb: [data.limb, [Validators.required]],
      accidentArea: [data.accidentArea, [Validators.required]],
      accidentDate: [data.accidentDate, [Validators.required, accidentDateRangeValidator()]],
      accidentHour: [data.accidentHour, [Validators.required, timeFormatValidator(), accidentTimeNotInFutureValidator('accidentDate')]],
      lostDayOfWork: [data.lostDayOfWork, [Validators.required, lostWorkDaysValidator()]],
      description: [data.description, [Validators.required, accidentDescriptionValidator()]]
    });
  }

  ngOnInit(): void { }
  
  updateAccident(): void {
    if (this.accidentForm.invalid) {
      Object.keys(this.accidentForm.controls).forEach(key => {
        this.accidentForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.accidentForm.value;
    const updateAccident: Update_Accident = {
      id: this.data.id,
      typeOfAccident: this.typeOfAccident || formValue.typeOfAccident,
      limb: this.limb || formValue.limb,
      accidentArea : this.accidentArea || formValue.accidentArea,
      accidentDate: new Date(formValue.accidentDate),
      accidentHour: formValue.accidentHour,
      lostDayOfWork: formValue.lostDayOfWork,
      description: formValue.description
    };

    this.accidentService.updateAccident(updateAccident).then(
      () => {
        this.alertifyService.message('Kaza bilgileri başarıyla güncellendi.', {
          dismissOthers: true,
          messageType: MessageType.Success,
          position: Position.TopRight
        });
        this.dialogRef.close({ success: true });
      },
      (errorMessage: string) => {
        this.alertifyService.message('Kaza bilgileri güncelenirken bir sorun oluştu.', {
          dismissOthers: true,
          messageType: MessageType.Error,
          position: Position.TopRight
        });
        this.dialogRef.close({ success: false });
      }
    );
  }

  openTypeOfAccidentPicker(): void {
    const dialogRef = this.dialog.open(ShowTypeOfAccidentDialogComponent, {
      data: { isPicker: true } // Picker modunda açmak için
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.typeOfAccident = result.name; // Seçilen kaza türünü al
        this.accidentForm.patchValue({ typeOfAccident: result.name });
      }
    });
  }

  openLimbPicker(): void {
    const dialogRef = this.dialog.open(ShowLimbDialogComponent, {
      data: { isPicker: true } // Picker modunda açmak için
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.limb = result.name; // Seçilen kaza türünü al
        this.accidentForm.patchValue({ limb: result.name });
      }
    });
  }

  openAccidentAreaPicker(): void {
    const dialogRef = this.dialog.open(ShowAccidentAreaDialogComponent, {
      width: '600px',
      data: { isPicker: true } // Picker modunda açmak için
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.accidentArea = result.name; // Seçilen kaza alanı türünü al
        this.accidentForm.patchValue({ accidentArea: result.name });
      }
    });
  }
}
