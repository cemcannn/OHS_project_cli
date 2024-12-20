import { Component, Inject } from '@angular/core';
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

@Component({
  selector: 'app-accident-update-dialog',
  templateUrl: './accident-update-dialog.component.html',
  styleUrls: ['./accident-update-dialog.component.scss']
})
export class AccidentUpdateDialogComponent extends BaseDialog<AccidentUpdateDialogComponent>  {
  typeOfAccident: string; // Kaza türünü tutmak için
  limb: string;
  accidentArea: string;

  constructor(
    dialogRef: MatDialogRef<AccidentUpdateDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Update_Accident,
    private accidentService: AccidentService,
    private alertifyService: AlertifyService,
    private dialog: MatDialog
  ) {super(dialogRef)}

  ngOnInit(): void { }
  
  updateAccident(): void {
    const updateAccident: Update_Accident = {
      id: this.data.id,
      typeOfAccident: this.typeOfAccident || this.data.typeOfAccident,
      limb: this.limb || this.data.limb,
      accidentArea : this.accidentArea || this.data.accidentArea,
      accidentDate: new Date(this.data.accidentDate),
      accidentHour: this.data.accidentHour,
      lostDayOfWork: this.data.lostDayOfWork,
      description: this.data.description
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
      }
    });
  }
}
