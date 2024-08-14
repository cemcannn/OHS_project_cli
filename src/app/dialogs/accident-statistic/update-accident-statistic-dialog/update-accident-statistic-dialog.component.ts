import { Component, Inject, OnInit } from '@angular/core';
import { List_Directorate } from 'src/app/contracts/definitions/directorate/list_directorate';
import { BaseDialog } from '../../base/base-dialog';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AccidentStatisticService } from 'src/app/services/common/models/accident-statistic.service';
import { Update_Monthly_Directorate_Data } from 'src/app/contracts/monthly_directorate_data/update-monthly-directorate-data';
import { ShowDirectorateDialogComponent } from '../../definition/show-directorate-dialog/show-directorate-dialog.component';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';

@Component({
  selector: 'app-update-accident-statistic-dialog',
  templateUrl: './update-accident-statistic-dialog.component.html',
  styleUrls: ['./update-accident-statistic-dialog.component.scss']
})
export class UpdateAccidentStatisticDialogComponent extends BaseDialog<UpdateAccidentStatisticDialogComponent> {
  directorate: List_Directorate;
  year: string;
  
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
    @Inject(MAT_DIALOG_DATA) public data: Update_Monthly_Directorate_Data,
    private accidentStatisticService: AccidentStatisticService,
    private alertifyService: AlertifyService,
    private dialog: MatDialog
  ) { super(dialogRef); }

  ngOnInit(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 2000; i--) {
      this.years.push(i.toString());
    }
  }

  updateAccidentStatistic(): void {
    const updateMonthlyDirectorateData: Update_Monthly_Directorate_Data = {
      id: this.data.id,
      month: this.data.month,
      year: this.data.year,
      actualDailyWageSurface: this.data.actualDailyWageSurface,
      actualDailyWageUnderground: this.data.actualDailyWageUnderground,
      employeesNumberSurface: this.data.employeesNumberSurface,
      employeesNumberUnderground: this.data.employeesNumberUnderground,
      directorate: this.data.directorate
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
