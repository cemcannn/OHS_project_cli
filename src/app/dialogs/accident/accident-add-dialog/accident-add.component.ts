import { Component, Inject, OnInit, ViewChild } from '@angular/core';

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

@Component({
  selector: 'app-accident-add',
  templateUrl: './accident-add.component.html',
  styleUrls: ['./accident-add.component.scss']
})
export class AccidentAddComponent extends BaseDialog<AccidentAddComponent> implements OnInit {
  accidentDateInput: string = "";
  onTheJobDateInput: string = "";
  typeOfAccident: List_Type_Of_Accident; // Kaza türünü tutmak için
  limb: List_Limb;

  constructor(
    dialogRef: MatDialogRef<AccidentAddComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private accidentService: AccidentService,
    private alertifyService: AlertifyService,
    private dialog: MatDialog
  ) {
    super(dialogRef);
  }

  ngOnInit(): void {}

  openTypeOfAccidentPicker(): void {
    const dialogRef = this.dialog.open(ShowTypeOfAccidentDialogComponent, {
      width: '600px',
      data: { isPicker: true } // Picker modunda açmak için
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.typeOfAccident = result; // Seçilen kaza türünü al
      }
    });
  }

  openLimbPicker(): void {
    const dialogRef = this.dialog.open(ShowLimbDialogComponent, {
      width: '600px',
      data: { isPicker: true } // Picker modunda açmak için
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.limb = result; // Seçilen kaza türünü al
      }
    });
  }

  createAccident(
    typeOfAccident: string,
    limb: string,
    accidentDateInput: string,
    accidentHour: string,
    onTheJobDateInput: string,
    description: string
  ): void {
    // gg.aa.yyyy formatındaki tarihi Date nesnesine çevirme ve UTC olarak ayarlama
    const [day, month, year] = accidentDateInput.split(".");
    const accidentDateValue: Date = new Date(Date.UTC(+year, +month - 1, +day));
  
    // gg.aa.yyyy formatındaki tarihi Date nesnesine çevirme ve UTC olarak ayarlama
    const [jobDay, jobMonth, jobYear] = onTheJobDateInput.split(".");
    const onTheJobDateValue: Date = new Date(Date.UTC(+jobYear, +jobMonth - 1, +jobDay));
  
    const createAccident: Create_Accident = {
      personnelId: this.data.personnelId,
      typeOfAccident: this.typeOfAccident ? this.typeOfAccident.name : typeOfAccident,
      limb: this.limb ? this.limb.name : limb,
      accidentDate: accidentDateValue,
      accidentHour: accidentHour,
      onTheJobDate: onTheJobDateValue,
      description: description
    };
  
    this.accidentService.createAccident(
      createAccident,
      () => {
        this.dialogRef.close({ success: true });
      },
      (errorMessage: string) => {
        console.error(errorMessage);
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
