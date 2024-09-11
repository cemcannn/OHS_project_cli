import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx'; // Import xlsx
import { StatisticService } from 'src/app/services/common/statistic.service';
import { MatDialog } from '@angular/material/dialog';
import { AccidentService } from 'src/app/services/common/models/accident.service';
import { AccidentRateService } from 'src/app/services/common/accident-rate.service';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';
import { List_Accident_Statistic } from 'src/app/contracts/accident_statistic/list_accident_statistic';
import { AccidentStatisticService } from 'src/app/services/common/models/accident-statistic.service';
import { AddAccidentStatisticDialogComponent } from 'src/app/dialogs/accident-statistic/add-accident-statistic-dialog/add-accident-statistic-dialog.component';
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends BaseComponent implements OnInit {
  displayedColumnsStatistic: string[] = ['month', 'actualDailyWageSurface', 'actualDailyWageUnderground', 'actualDailyWageSummary', 'employeesNumberSurface', 'employeesNumberUnderground', 'employeesNumberSummary' ,'workingHoursSurface', 'workingHoursUnderground', 'workingHoursSummary', 'lostDayOfWorkSummary', 'accidentSeverityRate'];
  dataSourceStatistic: MatTableDataSource<any> = new MatTableDataSource<any>();
  clickedRowsStatistic = new Set<any>();
  accidents: List_Accident[] = [];
  totalCountPersonnels: number = 0;
  years: string[] = [];
  directorates: string[] = []; // İşletmeleri tutacak dizi
  selectedYearStatistic: string = 'All';
  selectedDirectorate: string = 'All'; // İşletme seçimi
  accidentStatistics: List_Accident_Statistic[] = [];

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    spinner: NgxSpinnerService,
    private accidentStatisticService: AccidentStatisticService,
    private statisticService: StatisticService,
    private accidentService: AccidentService,
    private accidentRateService: AccidentRateService,
    private alertifyService: AlertifyService,
    private dialog: MatDialog
  ) {super(spinner)}

  ngOnInit(): void {
    this.getAccidentStatistics();    
  }

  async getAccidentStatistics() {
    this.showSpinner(SpinnerType.Cog)

    let accidentStatisticsResponse, accidentsResponse;

    try {
      [accidentStatisticsResponse, accidentsResponse] = await Promise.all([
        this.accidentStatisticService.getAccidentStatistics(),
        this.accidentService.getAccidents()
      ]);

      this.accidentStatistics = accidentStatisticsResponse.datas;
      this.accidents = accidentsResponse.datas;

      this.populateYearsStatistic(this.accidentStatistics);
      this.populateDirectorates(this.accidents);
      this.filterStatisticsByYearAndDirectorate(this.selectedYearStatistic, this.selectedDirectorate);
    } catch (errorMessage) {
      this.alertifyService.message(errorMessage, {
        dismissOthers: true,
        messageType: MessageType.Error,
        position: Position.TopRight
      });
    } finally {
      this.hideSpinner(SpinnerType.Cog);
    }
  }

  populateYearsStatistic(accidentStatistics: List_Accident_Statistic[]) {
    const groupedByYear = this.statisticService.groupByYearList(accidentStatistics);
    this.years = Object.keys(groupedByYear);
  }

  populateDirectorates(accidents: List_Accident[]) {
    const directoratesSet = new Set(accidents.map(a => a.directorate));
    this.directorates = Array.from(directoratesSet);
  }

  onFiltersChanged() {
    this.filterStatisticsByYearAndDirectorate(this.selectedYearStatistic, this.selectedDirectorate);
  }

  filterStatisticsByYearAndDirectorate(year: string, directorate: string) {
    let filteredStatistics = this.accidentStatistics;
    let filteredAccidents = this.accidents;

    if (year !== 'All') {
      filteredStatistics = this.statisticService.groupByYearList(this.accidentStatistics)[year];
      filteredAccidents = this.accidentRateService.groupByYear(this.accidents)[year];
    }

    if (directorate !== 'All') {
      filteredStatistics = filteredStatistics.filter(a => a.directorate === directorate)
      filteredAccidents = filteredAccidents.filter(a => a.directorate === directorate);
    }

    // Gruplama ve filtreleme işlemleri
    const groupedStatistics = this.statisticService.groupByMonth(filteredStatistics, filteredAccidents);

    // `accidentId` özelliği kullanılmadığı için mevcut özelliklerle uyumlu hale getirildi
    this.dataSourceStatistic.data = groupedStatistics;
    this.dataSourceStatistic.sort = this.sort;
  }

  exportToExcelStatistics() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSourceStatistic.data.map(item => ({
      Month: item.month,
      ActualDailyWageSurface: item.actualDailyWageSurface,
      ActualDailyWageUnderground: item.actualDailyWageUnderground,
      EmployeesSurface: item.employeesSurface,
      employeesNumberUnderground: item.employeesNumberUnderground,
      employeesNumberSurface: item.employeesNumberSurface,
      WorkingHoursSurface: item.workingHoursSurface,
      WorkingHoursUnderground: item.workingHoursUnderground,
      WorkingHoursSummary: item.workingHoursSummary,
      LostDayOfWorkSummary: item.lostDayOfWorkSummary
    })));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Statistics');
    XLSX.writeFile(wb, 'statistics.xlsx');
  }
}
