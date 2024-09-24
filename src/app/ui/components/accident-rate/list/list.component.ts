import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatTableDataSource } from '@angular/material/table';
import { List_Accident } from 'src/app/contracts/accidents/list_accident';
import { AccidentService } from 'src/app/services/common/models/accident.service';
import { Accident_Rate } from 'src/app/contracts/accidents/accident_rate';
import * as XLSX from 'xlsx'; // Import xlsx
import { BaseComponent, SpinnerType } from 'src/app/base/base.component';
import { AlertifyService, MessageType, Position } from 'src/app/services/admin/alertify.service';
import { AccidentRateFilterService } from 'src/app/services/common/accident-rate-filter.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent extends BaseComponent implements OnInit {
  displayedColumns: string[] = ['month', 'zeroDay', 'oneToFourDay', 'fiveAboveDay', 'totalAccidentNumber', 'totalLostDayOfWork'];
  dataSource: MatTableDataSource<Accident_Rate> = null;
  years: string[] = [];
  directorates: string[] = [];
  allAccidents: List_Accident[] = [];
  monthNames = ['Tüm Aylar', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']; // "Tüm Aylar" eklendi

  @ViewChild(MatSort) sort: MatSort;

  selectedYear: string = 'Tüm Yıllar';
  selectedDirectorate: string = 'Tüm İşletmeler';

  constructor(
    spinner: NgxSpinnerService,
    private accidentService: AccidentService,
    private accidentRateFilterService: AccidentRateFilterService,
    private alertifyService: AlertifyService,
  ) {super(spinner);}

  ngOnInit(): void {
    this.loadAccidents();
  }

  async loadAccidents(): Promise<void> {
    // Kazaları yükle
    this.showSpinner(SpinnerType.Cog);
    const result = await this.accidentService.getAccidents(() => this.hideSpinner(SpinnerType.Cog), errorMessage => this.alertifyService.message(errorMessage, {
      dismissOthers: true,
      messageType: MessageType.Error,
      position: Position.TopRight
    }))
    
    this.allAccidents = result.datas;

    // Dinamik verileri oluştur
    this.years = ['Tüm Yıllar', ...new Set(this.allAccidents.map(accident => new Date(accident.accidentDate).getFullYear().toString()))]; // "Tüm Yıllar" eklendi
    this.years.sort((a, b) => parseInt(a) - parseInt(b));
    this.directorates = ['Tüm İşletmeler', ...new Set(this.allAccidents.map(accident => accident.directorate))]; // "Tüm İşletmeler" eklendi

    this.applyFilters();
  }

  applyFilters(): void {
    const filters = {
      year: this.selectedYear === 'Tüm Yıllar' ? null : this.selectedYear,
      directorate: this.selectedDirectorate === 'Tüm İşletmeler' ? null : this.selectedDirectorate
    };

    const filteredAccidents = this.accidentRateFilterService.applyFilters(this.allAccidents, filters);
    this.dataSource = new MatTableDataSource<Accident_Rate>(filteredAccidents); // Değişiklik burada

    // Paginator ve Sort'u dataSource'a bağla
    this.dataSource.sort = this.sort;
  }

  exportToExcelAccidents() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data.map(item => ({
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