import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { List_Directorate } from 'src/app/contracts/definitions/directorate/list_directorate';
import { BaseDialog } from '../../base/base-dialog';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AccidentStatisticService } from 'src/app/services/common/models/accident-statistic.service';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { Update_Accident_Statistic } from 'src/app/contracts/accident_statistic/update-accident-statistic';
import { monthValidator, yearFormatValidator, positiveNumberValidator } from 'src/app/validators/custom-validators';
import { DirectorateService } from 'src/app/services/common/models/directorate.service';

@Component({
  selector: 'app-update-accident-statistic-dialog',
  templateUrl: './update-accident-statistic-dialog.component.html',
  styleUrls: ['./update-accident-statistic-dialog.component.scss']
})
export class UpdateAccidentStatisticDialogComponent extends BaseDialog<UpdateAccidentStatisticDialogComponent> {
  statisticForm: FormGroup;
  directorates: List_Directorate[] = [];
  
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
    dialogRef: MatDialogRef<UpdateAccidentStatisticDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Update_Accident_Statistic,
    private accidentStatisticService: AccidentStatisticService,
    private alertifyService: AlertifyService,
    private directorateService: DirectorateService,
    private fb: FormBuilder
  ) { 
    super(dialogRef);
    this.statisticForm = this.fb.group({
      month: [data.month, [Validators.required, monthValidator()]],
      year: [data.year, [Validators.required, yearFormatValidator()]],
      actualDailyWageSurface: [data.actualDailyWageSurface, [Validators.required, positiveNumberValidator()]],
      actualDailyWageUnderground: [data.actualDailyWageUnderground, [Validators.required, positiveNumberValidator()]],
      employeesNumberSurface: [data.employeesNumberSurface, [Validators.required, positiveNumberValidator()]],
      employeesNumberUnderground: [data.employeesNumberUnderground, [Validators.required, positiveNumberValidator()]],
      directorate: [data.directorate ?? '']
    });
  }

  ngOnInit(): void {
    this.loadDirectorates();
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 2000; i--) {
      this.years.push(i.toString());
    }
  }

  private async loadDirectorates(): Promise<void> {
    const result = await this.directorateService.getDirectorates();
    this.directorates = result.datas ?? [];
  }

  updateAccidentStatistic(): void {
    if (this.statisticForm.invalid) {
      Object.keys(this.statisticForm.controls).forEach(key => {
        this.statisticForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.statisticForm.value;
    const updateMonthlyDirectorateData: Update_Accident_Statistic = {
      id: this.data.id,
      month: formValue.month,
      year: formValue.year,
      actualDailyWageSurface: formValue.actualDailyWageSurface,
      actualDailyWageUnderground: formValue.actualDailyWageUnderground,
      employeesNumberSurface: formValue.employeesNumberSurface,
      employeesNumberUnderground: formValue.employeesNumberUnderground,
      directorate: formValue.directorate || ''
    };

    this.accidentStatisticService.updateAccidentStatistic(updateMonthlyDirectorateData).then(
      () => {
        this.alertifyService.message('Aylık işletme verisi başarıyla güncellendi.', {
          dismissOthers: true,
          messageType: MessageType.Success,
          position: Position.TopRight
        });
        this.dialogRef.close({ success: true });
      },
      (errorMessage: string) => {
        this.alertifyService.message('Aylık işletme verisi güncelenirken bir sorun oluştu.', {
          dismissOthers: true,
          messageType: MessageType.Error,
          position: Position.TopRight
        });
        this.dialogRef.close({ success: false });
      }
    );
  }

}
