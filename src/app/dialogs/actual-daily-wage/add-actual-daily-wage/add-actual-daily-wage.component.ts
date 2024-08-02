import { Component, Inject, OnInit } from '@angular/core';
import { BaseDialog } from '../../base/base-dialog';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActualDailyWageService } from 'src/app/services/common/models/actual_daily_wage.service';
import { Create_Actual_Daily_Wage } from 'src/app/contracts/actual_daily_wages/create_actual_daily_wage';
import { ShowDirectorateDialogComponent } from '../../definition/show-directorate-dialog/show-directorate-dialog.component';
import { List_Directorate } from 'src/app/contracts/definitions/directorate/list_directorate';

@Component({
  selector: 'app-add-actual-daily-wage',
  templateUrl: './add-actual-daily-wage.component.html',
  styleUrls: ['./add-actual-daily-wage.component.scss']
})
export class AddActualDailyWageComponent extends BaseDialog<AddActualDailyWageComponent> implements OnInit {
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
    dialogRef: MatDialogRef<AddActualDailyWageComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private actualDailyWageService: ActualDailyWageService,
    private dialog: MatDialog
  ) { super(dialogRef); }

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 2000; i--) {
      this.years.push(i.toString());
    }
  }

  createActualDailyWage(): void {
    const createActualDailyWage: Create_Actual_Daily_Wage = {
      month: this.month,
      year: this.year,
      actualDailyWageSurface: this.actualDailyWageSurface,
      actualDailyWageUnderground: this.actualDailyWageUnderground,
      employeesNumberSurface: this.employeesNumberSurface,
      employeesNumberUnderground: this.employeesNumberUnderground,
      directorate: this.directorate.name
    };

    this.actualDailyWageService.createActualDailyWage(
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
