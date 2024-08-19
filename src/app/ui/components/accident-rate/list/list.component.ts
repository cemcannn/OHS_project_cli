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
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends BaseComponent implements OnInit {
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
    spinner: NgxSpinnerService,
    private personnelService: PersonnelService,
    private accidentService: AccidentService,
    private accidentRateService: AccidentRateService,
    private alertifyService: AlertifyService,
  ) {super(spinner);}

  ngOnInit(): void {
    this.getPersonnels();
    this.getAccidents();
  }

  async getPersonnels() {
    this.showSpinner(SpinnerType.Cog)
    try{
    this.personnelService.getPersonnels().then(
      response => {
        this.totalCountPersonnels = response.totalCount;
        this.personnels = response.datas;
      });
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

  async getAccidents() {
    this.showSpinner(SpinnerType.Cog)
    try{
    this.accidentService.getAccidents().then(
      response => {
        this.totalCountAccidents = response.totalCount;
        this.accidents = response.datas;
        this.populateYears(this.accidents);
        this.filterAccidentsByYear(this.selectedYearAccident);
      });
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
      "Aylar": item.month,
      "Kaza Sonrası Çalışır Durumdaki Çalışan Sayısı": item.zeroDay,
      "Kaza Sonrası İş Göremez Raporlu Çalışan Sayısı (1-4 Gün)": item.oneToFourDay,
      "Kaza Sonrası İş Göremez Çalışan Sayısı (5 Gün ve Üzeri)": item.fiveAboveDay,
      "Toplam İş Kazası Sayısı": item.totalAccidentNumber,
      "Toplam İşgünü Kaybı": item.totalLostDayOfWork
    })));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Accident Rates');
    XLSX.writeFile(wb, 'Kaza İstatistikleri.xlsx');
  }
}