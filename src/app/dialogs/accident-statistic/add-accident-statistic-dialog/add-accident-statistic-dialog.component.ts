import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseDialog } from '../../base/base-dialog';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ShowDirectorateDialogComponent } from '../../definition/show-directorate-dialog/show-directorate-dialog.component';
import { List_Directorate } from 'src/app/contracts/definitions/directorate/list_directorate';
import { AccidentStatisticService } from 'src/app/services/common/models/accident-statistic.service';
import { Create_Accident_Statistic } from 'src/app/contracts/accident_statistic/create-accident-statistic';
import { monthValidator, yearFormatValidator, positiveNumberValidator } from 'src/app/validators/custom-validators';


@Component({
  selector: 'app-add-accident-statistic-dialog',
  templateUrl: './add-accident-statistic-dialog.component.html',
  styleUrls: ['./add-accident-statistic-dialog.component.scss']
})
export class AddAccidentStatisticDialogComponent extends BaseDialog<AddAccidentStatisticDialogComponent> implements OnInit {
  directorate: List_Directorate;
  statisticForm: FormGroup;
  
  // Template binding için getter'lar
  get month() { return this.statisticForm.get('month')?.value; }
  set month(value: string) { this.statisticForm.patchValue({ month: value }); }
  
  get year() { return this.statisticForm.get('year')?.value; }
  set year(value: string) { this.statisticForm.patchValue({ year: value }); }
  
  get actualDailyWageSurface() { return this.statisticForm.get('actualDailyWageSurface')?.value; }
  set actualDailyWageSurface(value: string) { this.statisticForm.patchValue({ actualDailyWageSurface: value }); }
  
  get actualDailyWageUnderground() { return this.statisticForm.get('actualDailyWageUnderground')?.value; }
  set actualDailyWageUnderground(value: string) { this.statisticForm.patchValue({ actualDailyWageUnderground: value }); }
  
  get employeesNumberSurface() { return this.statisticForm.get('employeesNumberSurface')?.value; }
  set employeesNumberSurface(value: string) { this.statisticForm.patchValue({ employeesNumberSurface: value }); }
  
  get employeesNumberUnderground() { return this.statisticForm.get('employeesNumberUnderground')?.value; }
  set employeesNumberUnderground(value: string) { this.statisticForm.patchValue({ employeesNumberUnderground: value }); }

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
    private dialog: MatDialog,
    private fb: FormBuilder
  ) { 
    super(dialogRef);
    this.statisticForm = this.fb.group({
      month: ['', [Validators.required, monthValidator()]],
      year: ['', [Validators.required, yearFormatValidator()]],
      actualDailyWageSurface: ['', [Validators.required, positiveNumberValidator()]],
      actualDailyWageUnderground: ['', [Validators.required, positiveNumberValidator()]],
      employeesNumberSurface: ['', [Validators.required, positiveNumberValidator()]],
      employeesNumberUnderground: ['', [Validators.required, positiveNumberValidator()]],
      directorate: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 2000; i--) {
      this.years.push(i.toString());
    }
  }

  createAccidentStatistic(): void {
    if (this.statisticForm.invalid) {
      Object.keys(this.statisticForm.controls).forEach(key => {
        this.statisticForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.statisticForm.value;
    const createActualDailyWage: Create_Accident_Statistic = {
      month: formValue.month,
      year: formValue.year,
      actualDailyWageSurface: formValue.actualDailyWageSurface,
      actualDailyWageUnderground: formValue.actualDailyWageUnderground,
      employeesNumberSurface: formValue.employeesNumberSurface,
      employeesNumberUnderground: formValue.employeesNumberUnderground,
      directorate: this.directorate?.name || formValue.directorate
    };

    this.accidentStatisticService.createAccidentStatistic(
      createActualDailyWage,
      () => {
        this.dialogRef.close({ success: true });
      },
      (errorMessage: string) => {
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
        this.statisticForm.patchValue({ directorate: result.name });
      }
    });
  }
}
