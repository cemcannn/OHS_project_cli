import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx'; // Import xlsx
import { ActualDailyWageService } from 'src/app/services/common/models/actual_daily_wage.service';
import { List_Actual_Daily_Wage } from 'src/app/contracts/actual_daily_wages/list_actual_daily_wage';
import { StatisticService } from 'src/app/services/common/statistic.service';
import { AddActualDailyWageComponent } from 'src/app/dialogs/actual-daily-wage/add-actual-daily-wage/add-actual-daily-wage.component';
import { MatDialog } from '@angular/material/dialog';
import { AccidentService } from 'src/app/services/common/models/accident.service';
import { AccidentRateService } from 'src/app/services/common/accident-rate.service';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  displayedColumnsStatistic: string[] = ['month', 'actualDailyWageSurface', 'actualDailyWageUnderground', 'actualDailyWageSummary', 'employeesNumberSurface', 'employeesNumberUnderground', 'employeesNumberSummary' ,'workingHoursSurface', 'workingHoursUnderground', 'workingHoursSummary', 'lostDayOfWorkSummary', 'accidentSeverityRate' ,'delete'];
  dataSourceStatistic: MatTableDataSource<any> = new MatTableDataSource<any>();
  clickedRowsStatistic = new Set<any>();
  accidents: List_Accident[] = [];

  @ViewChild(MatSort) sort: MatSort;

  totalCountPersonnels: number = 0;
  yearsStatistic: string[] = [];
  selectedYearStatistic: string = 'All';
  actualDailyWages: List_Actual_Daily_Wage[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    private actualDailyWageService: ActualDailyWageService,
    private statisticService: StatisticService,
    private accidentService: AccidentService,
    private accidentRateService: AccidentRateService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getActualDailyWages();
  }

  async getActualDailyWages() {
    this.spinner.show();
  
    try {
      const [dailyWagesResponse, accidentsResponse] = await Promise.all([
        this.actualDailyWageService.getActualDailyWages(),
        this.accidentService.getAccidents()
      ]);
  
      this.actualDailyWages = dailyWagesResponse.datas;
      this.accidents = accidentsResponse.datas;
  
      this.populateYearsStatistic(this.actualDailyWages);
      this.filterStatisticsByYear(this.selectedYearStatistic);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.spinner.hide();
    }
  }

  populateYearsStatistic(dailyWages: List_Actual_Daily_Wage[]) {
    const groupedByYear = this.statisticService.groupByYear(dailyWages);
    this.yearsStatistic = Object.keys(groupedByYear);
  }

  filterStatisticsByYear(year: string) {
    let filteredStatistics = this.actualDailyWages;
    let filteredAccidents = this.accidents;
    if (year !== 'All') {
      filteredStatistics = this.statisticService.groupByYear(this.actualDailyWages)[year];
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

  async openAddActualDailyWageDialog(): Promise<void> {
    const dialogRef = this.dialog.open(AddActualDailyWageComponent, {
      width: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.getActualDailyWages();
      }
    });
  }
}