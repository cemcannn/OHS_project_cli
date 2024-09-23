import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { List_Accident_Statistic } from 'src/app/contracts/accident_statistic/list_accident_statistic';
import * as XLSX from 'xlsx'; // Import xlsx
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { AccidentStatisticService } from 'src/app/services/common/models/accident-statistic.service';
import { AccidentStatisticFilterService } from 'src/app/services/common/accident-statistic-filter.service';
import { List_Return_Statistic } from 'src/app/contracts/accident_statistic/list_return_statistic';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends BaseComponent implements OnInit {
  // Tablo için görüntülenecek kolonları tanımladık
  displayedColumns: string[] = ['month', 'actualDailyWageSurface', 'actualDailyWageUnderground', 'actualDailyWageSummary', 'employeesNumberSurface', 'employeesNumberUnderground', 'employeesNumberSummary' ,'workingHoursSurface', 'workingHoursUnderground', 'workingHoursSummary', 'lostDayOfWorkSummary', 'accidentSeverityRate'];
  
  dataSource: MatTableDataSource<List_Accident_Statistic> = null;
  years: string[] = [];
  directorates: string[] = [];
  accidentStatistics: List_Accident_Statistic[] = [];

  @ViewChild(MatSort) sort: MatSort;

  selectedYear: string = 'Tüm Yıllar';  // Filtreleme için seçilen yıl
  selectedDirectorate: string = 'Tüm İşletmeler';  // Filtreleme için seçilen işletme

  constructor(
    spinner: NgxSpinnerService,
    private accidentStatisticService: AccidentStatisticService,
    private accidentStatisticFilterService: AccidentStatisticFilterService,
    private alertifyService: AlertifyService,
  ) {super(spinner);}

  ngOnInit(): void {
    this.loadAccidentStatistics();
  }

  async loadAccidentStatistics(): Promise<void> {
    this.showSpinner(SpinnerType.Cog);

      // İstatistikleri yükle
      const result = await this.accidentStatisticService.getAccidentStatistics(() => this.hideSpinner(SpinnerType.Cog), errorMessage => this.alertifyService.message(errorMessage, {
        dismissOthers: true,
        messageType: MessageType.Error,
        position: Position.TopRight
      }))

      this.accidentStatistics = result.datas;

      // Yılları ve işletmeleri filtreleme için hazırlıyoruz
      this.years = ['Tüm Yıllar', ...new Set(this.accidentStatistics.map(stat => stat.year))];
      this.directorates = ['Tüm İşletmeler', ...new Set(this.accidentStatistics.map(stat => stat.directorate))];

      // Filtre uygulama işlemi
      this.applyFilters();
    }

  applyFilters(): void {
    const filters = {
      year: this.selectedYear === 'Tüm Yıllar' ? null : this.selectedYear,
      directorate: this.selectedDirectorate === 'Tüm İşletmeler' ? null : this.selectedDirectorate
    };

    const filteredAccidentStatistics = this.accidentStatisticFilterService.applyFilters(this.accidentStatistics, filters);
    this.dataSource = new MatTableDataSource<List_Accident_Statistic>(filteredAccidentStatistics); // Değişiklik burada

    // Paginator ve Sort'u dataSource'a bağla
    this.dataSource.sort = this.sort;
  }

  exportToExcelStatistics() {
    // Excel'e verileri aktarma
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data.map(item => ({
      "Aylar": item.month,
      "Yerüstü Fiili Yevmiye Sayısı": item.actualDailyWageSurface,
      "Yeraltı Fiili Yevmiye Sayısı": item.actualDailyWageUnderground,
      "Toplam Fiili Yevmiye Sayısı": item.actualDailyWageSummary,
      "Yerüstü Çalışan Sayısı": item.employeesNumberSurface,
      "Yeraltı Çalışan Sayısı": item.employeesNumberUnderground,
      "Toplam Çalışan Sayısı": item.employeesNumberSummary,
      "Yerüstü Çalışma Saati": item.workingHoursSurface,
      "Yeraltı Çalışma Saati": item.workingHoursUnderground,
      "Toplam Çalışma Saati": item.workingHoursSummary,
      "Toplam İş Günü Kaybı": item.lostDayOfWorkSummary
    })));
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kaza İstatistikleri');
    XLSX.writeFile(wb, 'Kaza İstatistikleri.xlsx');
  }
}
