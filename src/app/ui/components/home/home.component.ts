import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';
import { List_Personnel } from 'src/app/contracts/personnels/list_personnel'; 
import { AccidentService } from 'src/app/services/common/models/accident.service';
import { PersonnelService } from 'src/app/services/common/models/personnel.service';
import { Accident_Rate } from 'src/app/contracts/accidents/accident_rate';
import { AccidentRateService } from 'src/app/services/common/accident-rate.service';
import * as XLSX from 'xlsx'; // Import xlsx
import { ActualDailyWageService } from 'src/app/services/common/models/actual_daily_wage.service';
import { List_Actual_Daily_Wage } from 'src/app/contracts/actual_daily_wages/list_actual_daily_wage';
import { StatisticService } from 'src/app/services/common/statistic.service';
import { AddActualDailyWageComponent } from 'src/app/dialogs/actual-daily-wage/add-actual-daily-wage/add-actual-daily-wage.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  displayedColumnsAccident: string[] = ['month', 'zeroDay', 'oneToFourDay', 'fiveAboveDay', 'totalAccidentNumber', 'totalWorkDay'];
  displayedColumnsStatistic: string[] = ['month', 'actualWageSurface', 'actualWageUnderground', 'workingHoursSurface', 'workingHoursUnderground', 'workingHoursSummary', 'lostDayOfWorkSummary', 'delete'];
  dataSourceAccident: MatTableDataSource<Accident_Rate> = new MatTableDataSource<Accident_Rate>();
  dataSourceStatistic: MatTableDataSource<any> = new MatTableDataSource<any>();
  clickedRowsAccident = new Set<Accident_Rate>();
  clickedRowsStatistic = new Set<any>();

  @ViewChild(MatSort) sort: MatSort;

  totalCountPersonnels: number = 0;
  personnels: List_Personnel[] = [];
  totalCountAccidents: number = 0;
  accidents: List_Accident[] = [];
  yearsAccident: string[] = [];
  yearsStatistic: string[] = [];
  selectedYearAccident: string = 'All';
  selectedYearStatistic: string = 'All';
  actualDailyWages: List_Actual_Daily_Wage[] = [];

  constructor(
    private spinner: NgxSpinnerService,
    private personnelService: PersonnelService,
    private accidentService: AccidentService,
    private accidentRateService: AccidentRateService,
    private actualDailyWageService: ActualDailyWageService,
    private statisticService: StatisticService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getPersonnels();
    this.getAccidents();
    this.getActualDailyWages();
  }

  async getPersonnels() {
    this.spinner.show(); // Show spinner while loading

    this.personnelService.getPersonnels().then(
      response => {
        this.totalCountPersonnels = response.totalCount;
        this.personnels = response.datas;
        this.spinner.hide(); // Hide spinner after loading
      },
      error => {
        console.error('Error loading personnels:', error);
        this.spinner.hide(); // Hide spinner in case of error
      }
    );
  }

  async getAccidents() {
    this.spinner.show(); // Show spinner while loading

    this.accidentService.getAccidents().then(
      response => {
        this.totalCountAccidents = response.totalCount;
        this.accidents = response.datas;
        this.populateYears(this.accidents);
        this.filterAccidentsByYear(this.selectedYearAccident);
        this.spinner.hide(); // Hide spinner after loading
      },
      error => {
        console.error('Error loading accidents:', error);
        this.spinner.hide(); // Hide spinner in case of error
      }
    );
  }

  populateYears(accidents: List_Accident[]) {
    const groupedByYear = this.accidentRateService.groupByYear(accidents);
    this.yearsAccident = Object.keys(groupedByYear);
  }

  filterAccidentsByYear(year: string) {
    let filteredAccidents = this.accidents;
    if (year !== 'All') {
      filteredAccidents = this.accidentRateService.groupByYear(this.accidents)[year];
    }
    const groupedAccidents = this.accidentRateService.groupByMonth(filteredAccidents); // Accidents'ı aylara göre gruplayın
    this.dataSourceAccident.data = groupedAccidents;
    this.dataSourceAccident.sort = this.sort;
  }

  exportToExcelAccidents() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSourceAccident.data.map(item => ({
      Month: item.month,
      ZeroDay: item.zeroDay,
      OneToFourDay: item.oneToFourDay,
      FiveAboveDay: item.fiveAboveDay,
      TotalAccidentNumber: item.totalAccidentNumber,
      TotalWorkDay: item.totalWorkDay
    })));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Accident Rates');
    XLSX.writeFile(wb, 'accident_rates.xlsx');
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
        this.getPersonnels();
      }
    });
  }
}
