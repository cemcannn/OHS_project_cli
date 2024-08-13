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

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  displayedColumnsStatistic: string[] = ['month', 'actualDailyWageSurface', 'actualDailyWageUnderground', 'actualDailyWageSummary', 'employeesNumberSurface', 'employeesNumberUnderground', 'employeesNumberSummary' ,'workingHoursSurface', 'workingHoursUnderground', 'workingHoursSummary', 'lostDayOfWorkSummary', 'accidentSeverityRate'];
  dataSourceStatistic: MatTableDataSource<any> = new MatTableDataSource<any>();
  clickedRowsStatistic = new Set<any>();
  accidents: List_Accident[] = [];
  totalCountPersonnels: number = 0;
  yearsStatistic: string[] = [];
  selectedYearStatistic: string = 'All';
  accidentStatistics: List_Accident_Statistic[] = [];

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private spinner: NgxSpinnerService,
    private accidentStatisticService: AccidentStatisticService,
    private statisticService: StatisticService,
    private accidentService: AccidentService,
    private accidentRateService: AccidentRateService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getAccidentStatistics();
  }

  async getAccidentStatistics() {
    this.spinner.show();
  
    try {
      const [accidentStatisticsResponse, accidentsResponse] = await Promise.all([
        this.accidentStatisticService.getAccidentStatistics(),
        this.accidentService.getAccidents()
      ]);
  
      this.accidentStatistics = accidentStatisticsResponse.datas;
      this.accidents = accidentsResponse.datas;
  
      this.populateYearsStatistic(this.accidentStatistics);
      this.filterStatisticsByYear(this.selectedYearStatistic);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.spinner.hide();
    }
  }

  populateYearsStatistic(accidentStatistics: List_Accident_Statistic[]) {
    const groupedByYear = this.statisticService.groupByYearList(accidentStatistics);
    this.yearsStatistic = Object.keys(groupedByYear);
  }

  filterStatisticsByYear(year: string) {
    let filteredStatistics = this.accidentStatistics;
    let filteredAccidents = this.accidents;
    if (year !== 'All') {
      filteredStatistics = this.statisticService.groupByYearList(this.accidentStatistics)[year];
      filteredAccidents = this.accidentRateService.groupByYear(this.accidents)[year];
    }
    const groupedStatistics = this.statisticService.groupByMonth(filteredStatistics, filteredAccidents);
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

  async openAddAccidentStatisticDialog(): Promise<void> {
    const dialogRef = this.dialog.open(AddAccidentStatisticDialogComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.getAccidentStatistics();
      }
    });
  }
}