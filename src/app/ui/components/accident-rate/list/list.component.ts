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

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  displayedColumnsAccident: string[] = ['month', 'zeroDay', 'oneToFourDay', 'fiveAboveDay', 'totalAccidentNumber', 'totalLostDayOfWork'];
  dataSourceAccident: MatTableDataSource<Accident_Rate> = new MatTableDataSource<Accident_Rate>();
  clickedRowsAccident = new Set<Accident_Rate>();

  @ViewChild(MatSort) sort: MatSort;

  totalCountPersonnels: number = 0;
  personnels: List_Personnel[] = [];
  totalCountAccidents: number = 0;
  accidents: List_Accident[] = [];
  yearsAccident: string[] = [];
  selectedYearAccident: string = 'All';

  constructor(
    private spinner: NgxSpinnerService,
    private personnelService: PersonnelService,
    private accidentService: AccidentService,
    private accidentRateService: AccidentRateService,
  ) {}

  ngOnInit(): void {
    this.getPersonnels();
    this.getAccidents();
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
      TotalLostDayOfWork: item.totalLostDayOfWork
    })));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Accident Rates');
    XLSX.writeFile(wb, 'accident_rates.xlsx');
  }
}