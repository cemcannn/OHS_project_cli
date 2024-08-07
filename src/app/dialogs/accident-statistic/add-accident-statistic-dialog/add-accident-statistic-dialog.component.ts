import { Component, Inject, OnInit } from '@angular/core';
import { BaseDialog } from '../../base/base-dialog';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ShowDirectorateDialogComponent } from '../../definition/show-directorate-dialog/show-directorate-dialog.component';
import { List_Directorate } from 'src/app/contracts/definitions/directorate/list_directorate';
import { AccidentStatisticService } from 'src/app/services/common/models/accident-statistic.service';
import { Create_Accident_Statistic } from 'src/app/contracts/accident_statistic/create-accident-statistic';


@Component({
  selector: 'app-add-accident-statistic-dialog',
  templateUrl: './add-accident-statistic-dialog.component.html',
  styleUrls: ['./add-accident-statistic-dialog.component.scss']
})
export class AddAccidentStatisticDialogComponent extends BaseDialog<AddAccidentStatisticDialogComponent> implements OnInit {
  month: string;
  year: string;
  actualDailyWageSurface: string;
  actualDailyWageUnderground: string;
  employeesNumberSurface: string;
  employeesNumberUnderground: string;
  directorate: List_Directorate;

  months = [
    { value: '01', viewValue: 'Ocak' },
    { value: '02', viewValue: 'Şubat' },
    { value: '03', viewValue: 'Mart' },
    { value: '04', viewValue: 'Nisan' },
    { value: '05', viewValue: 'Mayıs' },
    { value: '06', viewValue: 'Haziran' },
    { value: '07', viewValue: 'Temmuz' },
    { value: '08', viewValue: 'Ağustos' },
    { value: '09', viewValue: 'Eylül' },
    { value: '10', viewValue: 'Ekim' },
    { value: '11', viewValue: 'Kasım' },
    { value: '12', viewValue: 'Aralık' }
  ];

  years: string[] = [];

  constructor(
    dialogRef: MatDialogRef<AddAccidentStatisticDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private accidentStatisticService: AccidentStatisticService,
    private dialog: MatDialog
  ) { super(dialogRef); }

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 2000; i--) {
      this.years.push(i.toString());
    }
  }

  createAccidentStatistic(): void {
    const createActualDailyWage: Create_Accident_Statistic = {
      month: this.month,
      year: this.year,
      actualDailyWageSurface: this.actualDailyWageSurface,
      actualDailyWageUnderground: this.actualDailyWageUnderground,
      employeesNumberSurface: this.employeesNumberSurface,
      employeesNumberUnderground: this.employeesNumberUnderground,
      directorate: this.directorate.name
    };

    this.accidentStatisticService.createAccidentStatistic(
      createActualDailyWage,
      () => {
        this.dialogRef.close({ success: true });
      },
      (errorMessage: string) => {
        console.error(errorMessage);
        this.dialogRef.close({ success: false, error: errorMessage });
      }
    );
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
