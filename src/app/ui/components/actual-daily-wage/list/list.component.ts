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

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  displayedColumnsStatistic: string[] = ['month', 'actualWageSurface', 'actualWageUnderground', 'employeesNumberSurface', 'employeesNumberUnderground','workingHoursSurface', 'workingHoursUnderground', 'workingHoursSummary', 'lostDayOfWorkSummary', 'delete'];
  dataSourceStatistic: MatTableDataSource<any> = new MatTableDataSource<any>();
  clickedRowsStatistic = new Set<any>();

  @ViewChild(MatSort) sort: MatSort;

  totalCountPersonnels: number = 0;
  yearsStatistic: string[] = [];
  selectedYearStatistic: string = 'All';
  actualDailyWages: List_Actual_Daily_Wage[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    private actualDailyWageService: ActualDailyWageService,
    private statisticService: StatisticService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getActualDailyWages();
  }

  async getActualDailyWages() {
    this.spinner.show(); // Show spinner while loading

    this.actualDailyWageService.getActualDailyWages().then(
      response => {
        this.actualDailyWages = response.datas;
        this.populateYearsStatistic(this.actualDailyWages);
        this.filterStatisticsByYear(this.selectedYearStatistic);
        this.spinner.hide(); // Hide spinner after loading
      },
      error => {
        console.error('Error loading actual daily wages:', error);
        this.spinner.hide(); // Hide spinner in case of error
      }
    );
  }

  populateYearsStatistic(dailyWages: List_Actual_Daily_Wage[]) {
    const groupedByYear = this.statisticService.groupByYear(dailyWages);
    this.yearsStatistic = Object.keys(groupedByYear);
  }

  filterStatisticsByYear(year: string) {
    let filteredStatistics = this.actualDailyWages;
    if (year !== 'All') {
      filteredStatistics = this.statisticService.groupByYear(this.actualDailyWages)[year];
    }
    const groupedStatistics = this.statisticService.groupByMonth(filteredStatistics);
    this.dataSourceStatistic.data = groupedStatistics;
    this.dataSourceStatistic.sort = this.sort;
  }

  exportToExcelStatistics() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSourceStatistic.data.map(item => ({
      Month: item.month,
      ActualWageSurface: item.actualWageSurface,
      ActualWageUnderground: item.actualWageUnderground,
      EmployeesSurface: item.employeesSurface,
      employeesNumberUnderground: item.employeesNumberUnderground,
      employeesNumberSurface: item.employeesNumberSurface,
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
