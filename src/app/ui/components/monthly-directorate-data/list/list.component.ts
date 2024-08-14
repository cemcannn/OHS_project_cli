import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent } from 'src/app/base/base.component';
import { List_Monthly_Directorate_Data } from 'src/app/contracts/monthly_directorate_data/list-monthly-directorate-data';
import { AddAccidentStatisticDialogComponent } from 'src/app/dialogs/accident-statistic/add-accident-statistic-dialog/add-accident-statistic-dialog.component';
import { UpdateAccidentStatisticDialogComponent } from 'src/app/dialogs/accident-statistic/update-accident-statistic-dialog/update-accident-statistic-dialog.component';
import { AccidentUpdateDialogComponent } from 'src/app/dialogs/accident/accident-update-dialog/accident-update-dialog.component';
import { AccidentStatisticService } from 'src/app/services/common/models/accident-statistic.service';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends BaseComponent implements OnInit {
  displayedColumns: string[] = ['year', 'month', 'directorate', 'actualDailyWageSurface', 'actualDailyWageUnderground', 'employeesNumberSurface', 'employeesNumberUnderground', 'monthlyDirectorateDataUpdate', 'delete'];
  dataSource: MatTableDataSource<List_Monthly_Directorate_Data> = null;

  monthNames: { [key: number]: string } = {
    1: 'Ocak',
    2: 'Şubat',
    3: 'Mart',
    4: 'Nisan',
    5: 'Mayıs',
    6: 'Haziran',
    7: 'Temmuz',
    8: 'Ağustos',
    9: 'Eylül',
    10: 'Ekim',
    11: 'Kasım',
    12: 'Aralık'
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    spinner: NgxSpinnerService,
    private accidentStatisticService: AccidentStatisticService,
    private dialog: MatDialog,
  ) {
    super(spinner);
  }

  async pageChanged() {
    await this.loadMonthlyDirectorateData();
  }

  async ngOnInit() {
    await this.loadMonthlyDirectorateData();
  }

  async openUpdateMonthlyDirectorateData(accidentData: any): Promise<void> {
    const dialogRef = await this.dialog.open(UpdateAccidentStatisticDialogComponent, {
      width: '500px',
      data: accidentData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        console.log('Accident updated successfully!');
        this.loadMonthlyDirectorateData(); // Refresh the list after update
      } else if (result && result.error) {
        console.error('Failed to update accident:', result.error);
      }
    });
  }

  async loadMonthlyDirectorateData(): Promise<void> {
    const allMonthlyDirectorateDatas: { datas: List_Monthly_Directorate_Data[], totalCount: number } = await this.accidentStatisticService.getAccidentStatistics();

  // Convert month values from string to number and then to month names
  const convertedData = allMonthlyDirectorateDatas.datas.map(data => {
    const monthNumber = parseInt(data.month, 10); // Convert month from string to number
    return {
      ...data,
      month: this.monthNames[monthNumber] // Convert month number to month name
    };
  });

    // Use the correct type for MatTableDataSource
    this.dataSource = new MatTableDataSource<List_Monthly_Directorate_Data>(convertedData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  async openAddAccidentStatisticDialog(): Promise<void> {
    const dialogRef = this.dialog.open(AddAccidentStatisticDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.loadMonthlyDirectorateData();
      }
    });
  }
}
