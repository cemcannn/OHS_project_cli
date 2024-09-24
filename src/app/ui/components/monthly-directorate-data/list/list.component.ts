import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgxSpinnerService } from 'ngx-spinner';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { List_Accident_Statistic } from 'src/app/contracts/accident_statistic/list_accident_statistic';
import { AddAccidentStatisticDialogComponent } from 'src/app/dialogs/accident-statistic/add-accident-statistic-dialog/add-accident-statistic-dialog.component';
import { UpdateAccidentStatisticDialogComponent } from 'src/app/dialogs/accident-statistic/update-accident-statistic-dialog/update-accident-statistic-dialog.component';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { AccidentStatisticService } from 'src/app/services/common/models/accident-statistic.service';
import { MonthlyDirectorateFilterService } from 'src/app/services/common/monthly-directorate-filter.service';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends BaseComponent implements OnInit {
  displayedColumns: string[] = ['year', 'month', 'directorate', 'actualDailyWageSurface', 'actualDailyWageUnderground', 'employeesNumberSurface', 'employeesNumberUnderground', 'lostDayOfWorkSummary', 'monthlyDirectorateDataUpdate', 'delete'];
  dataSource: MatTableDataSource<List_Accident_Statistic> = null;

  monthNames: { [key: string]: string } = {
    '01': 'Ocak',
    '02': 'Şubat',
    '03': 'Mart',
    '04': 'Nisan',
    '05': 'Mayıs',
    '06': 'Haziran',
    '07': 'Temmuz',
    '08': 'Ağustos',
    '09': 'Eylül',
    '10': 'Ekim',
    '11': 'Kasım',
    '12': 'Aralık'
  };

  allAccidentStatistics: List_Accident_Statistic[] = [];

  years: string[] = [];
  directorates: string[] = [];

  selectedYear: string = 'Tüm Yıllar';
  selectedDirectorate: string = 'Tüm İşletmeler';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    spinner: NgxSpinnerService,
    private accidentStatisticService: AccidentStatisticService,
    private monthlyDirectorateFilterService: MonthlyDirectorateFilterService,
    private alertifyService: AlertifyService,
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
    this.showSpinner(SpinnerType.Cog);
    const result: { datas: List_Accident_Statistic[], totalCount: number } = await this.accidentStatisticService.getAccidentStatistics(() => this.hideSpinner(SpinnerType.Cog), errorMessage => this.alertifyService.message(errorMessage, {
      dismissOthers: true,
      messageType: MessageType.Error,
      position: Position.TopRight
    }))

    this.allAccidentStatistics = result.datas;

        // Dinamik verileri oluştur
        this.years = ['Tüm Yıllar', ...new Set(this.allAccidentStatistics.map(accidentStatistic => accidentStatistic.year.toString()))]; // "Tüm Yıllar" eklendi
        this.years.sort((a, b) => parseInt(a) - parseInt(b));
        this.directorates = ['Tüm İşletmeler', ...new Set(this.allAccidentStatistics.map(accidentStatistic => accidentStatistic.directorate))]; // "Tüm İşletmeler" eklendi
    
        this.applyFilters();
  }

  applyFilters(): void {
    const filters = {
      year: this.selectedYear === 'Tüm Yıllar' ? null : this.selectedYear,
      directorate: this.selectedDirectorate === 'Tüm İşletmeler' ? null : this.selectedDirectorate
    };

    const filteredAccidentStatistics = this.monthlyDirectorateFilterService.applyFilters(this.allAccidentStatistics, filters);
    const updatedAccidentStatistics = filteredAccidentStatistics.map(statistic => ({
      ...statistic,
      month: this.monthNames[statistic.month]
    }));
    this.dataSource = new MatTableDataSource<List_Accident_Statistic>(updatedAccidentStatistics);

    // Paginator ve Sort'u dataSource'a bağla
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applySearch(event: Event) {
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